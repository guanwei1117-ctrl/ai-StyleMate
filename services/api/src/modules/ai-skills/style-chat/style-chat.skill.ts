import { Injectable, Logger } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildStyleChatPrompt } from './prompts';
import { StyleChatInput, StyleChatResult } from './style-chat.dto';

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
        content: input.userMessage
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
    this.logger.log(
      `引导式测评对话完成 | 耗时 ${Date.now() - startTime}ms | done: ${parsed.done} | 回复长度: ${parsed.reply.length}`,
    );
    return parsed;
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
