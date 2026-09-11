import { Injectable, Logger, Optional } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildStyleChatPrompt } from './prompts';
import { StyleChatInput, StyleChatResult } from './style-chat.dto';
import { MemoryService } from '../../memory/memory.service';
import { RagService } from '../../rag/rag.service';

/**
 * 强制结束时硬保证输出：无论模型返回什么，done 必须为 true 且必须有 statement。
 * （模型偶尔会无视结束指令继续提问，前端依赖 done 字段推进流程，必须兜底。）
 */
export function hardenFinalizeResult(
  parsed: StyleChatResult,
  forceFinalize: boolean,
): StyleChatResult {
  if (!forceFinalize) return parsed;
  return {
    ...parsed,
    done: true,
    statement:
      parsed.statement?.trim() ||
      parsed.reply?.trim() ||
      '用户完成了一次穿搭偏好对话，偏好细节以对话记录为准。',
  };
}

@Injectable()
export class StyleChatSkill {
  private readonly logger = new Logger(StyleChatSkill.name);

  constructor(
    private readonly llmFactory: LLMFactory,
    @Optional() private readonly memoryService?: MemoryService,
    // M9：接 RAG（让对话引导有专业依据 —— 风格/体型/色彩知识库检索）
    @Optional() private readonly ragService?: RagService,
  ) {}

  /**
   * 自由对话式测评：返回 AI 的下一个回复或最终总结
   */
  async chat(input: StyleChatInput): Promise<StyleChatResult> {
    // M9：检索风格/体型/色彩专业知识（让对话引导有专业依据）
    const knowledge = await this.retrieveStyleKnowledge(input);
    const systemPrompt = buildStyleChatPrompt(input, knowledge);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: input.forceFinalize
          ? '请立即结束对话，直接输出总结 JSON（done 必须为 true）。'
          : input.userMessage
            ? '（以上是我最新的回复，请继续对话）'
            : '请开始对话。',
      },
    ];

    this.logger.log(
      `引导式测评对话 | 轮次: ${input.history.length} | 强制结束: ${!!input.forceFinalize}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.7,
      maxTokens: 900,
      timeoutMs: 60000,
    });

    const parsed = this.parseResponse(response.content);
    // 强制结束兜底：保证前端能进入"生成档案"步骤
    const result = hardenFinalizeResult(parsed, !!input.forceFinalize);
    this.logger.log(
      `引导式测评对话完成 | 耗时 ${Date.now() - startTime}ms | done: ${result.done} | 回复长度: ${result.reply.length}`,
    );

    // 对话结束时，将结果写入长期记忆（best-effort，不影响主流程）
    if (result.done && input.userId && this.memoryService) {
      this.saveChatToMemory(input.userId, result).catch((err) => {
        this.logger.warn(`对话记忆写入失败（静默）: ${err instanceof Error ? err.message : String(err)}`);
      });
    }

    return result;
  }

  /**
   * M9：检索风格 / 体型 / 色彩专业知识
   *
   * - 根据对话历史最后一条用户消息（如果存在）或最近的偏好关键词检索相关知识
   * - @Optional + try/catch 三层降级：RAG 不可用时不影响对话流程
   * - 返回空字符串时下游直接拼"无参考知识"提示
   */
  private async retrieveStyleKnowledge(input: StyleChatInput): Promise<string> {
    if (!this.ragService) {
      this.logger.debug('RAG 未启用（RagService 未注入），跳过对话知识检索');
      return '';
    }

    // 取最后一条用户消息作为 query（对话场景下这是当前焦点）
    const lastUserMsg = [...(input.history ?? [])].reverse().find((h) => h.role === 'user');
    const query = (lastUserMsg?.content ?? input.userMessage ?? '穿搭风格推荐').slice(0, 80);

    try {
      const text = await this.ragService.augmentWithContext(query, {
        domains: ['style_encyclopedia', 'body_type', 'color_theory'],
        topK: 3,
      });
      if (text) {
        const titles = (text.match(/【([^】]+)】/g) ?? []).map((t) => t.replace(/[【】]/g, ''));
        this.logger.log(`style-chat RAG 命中 ${titles.length} 条知识 | ${titles.join('、')}`);
      }
      return text;
    } catch (err) {
      this.logger.warn(
        `style-chat RAG 检索失败，降级为无知识对话: ${err instanceof Error ? err.message : String(err)}`,
      );
      return '';
    }
  }

  private parseResponse(content: string): StyleChatResult {
    let jsonStr = content.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // 模型偶尔会直接返回纯文本问题（未包 JSON），当作普通回复处理
      return { reply: content.trim(), done: false };
    }

    return {
      reply: String(parsed.reply ?? ''),
      done: Boolean(parsed.done),
      statement: parsed.statement ? String(parsed.statement) : undefined,
      likedKeywords: Array.isArray(parsed.likedKeywords)
        ? parsed.likedKeywords.map(String)
        : undefined,
      dislikedKeywords: Array.isArray(parsed.dislikedKeywords)
        ? parsed.dislikedKeywords.map(String)
        : undefined,
      scenes: Array.isArray(parsed.scenes) ? parsed.scenes.map(String) : undefined,
    };
  }

  /**
   * 对话结束时将结果写入长期记忆
   *
   * 将 AI 总结的 likedKeywords/dislikedKeywords/scenes/statement
   * 写入 UserStyleProfile 和 UserMemorySummary。
   */
  private async saveChatToMemory(
    userId: string,
    result: StyleChatResult,
  ): Promise<void> {
    if (!this.memoryService) return;

    // 写入风格画像
    const profileUpdate: Record<string, string[]> = {};
    if (result.likedKeywords?.length) {
      profileUpdate.likedStyles = result.likedKeywords;
    }
    if (result.dislikedKeywords?.length) {
      profileUpdate.dislikedStyles = result.dislikedKeywords;
    }
    if (result.scenes?.length) {
      profileUpdate.commonOccasions = result.scenes;
    }
    if (Object.keys(profileUpdate).length > 0) {
      await this.memoryService.updateStyleProfile(userId, profileUpdate as any);
    }

    // 写入 AI 总结记忆
    if (result.statement) {
      await this.memoryService.refreshMemorySummary(userId);
    }

    this.logger.log(`对话记忆已写入 | userId: ${userId}`);
  }
}
