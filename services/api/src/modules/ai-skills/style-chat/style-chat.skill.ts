import { Injectable, Logger } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildStyleChatPrompt } from './prompts';
import { StyleChatInput, StyleChatResult } from './style-chat.dto';

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

  constructor(private readonly llmFactory: LLMFactory) {}

  /**
   * 引导式测评对话：返回 AI 的下一个问题或最终总结
   */
  async chat(input: StyleChatInput): Promise<StyleChatResult> {
    const systemPrompt = buildStyleChatPrompt(input);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        // 三种场景的用户消息必须与系统提示一致，避免"开始吧"与"结束"矛盾
        content: input.forceFinalize
          ? '请立即结束对话，直接输出总结 JSON（done 必须为 true）。'
          : input.userMessage
            ? '（已在上文给出我的最新回复，请继续）'
            : '开始吧。',
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
    return result;
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
}
