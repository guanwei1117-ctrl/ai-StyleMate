import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';

/**
 * DeepSeek Provider
 *
 * DeepSeek 提供 OpenAI 兼容 API
 * - Base URL: https://api.deepseek.com/v1
 * - 模型: deepseek-chat（纯文本，不支持视觉）
 * - 当消息中包含图片时自动被 LLM Factory 跳过
 */
@Injectable()
export class DeepSeekProvider implements LLMProvider {
  readonly name = 'DeepSeek';
  readonly supportsVision = false; // DeepSeek Chat 不支持图片分析
  private readonly logger = new Logger(DeepSeekProvider.name);
  private client: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
      if (!apiKey) {
        this.logger.warn('DEEPSEEK_API_KEY 未配置，DeepSeek 不可用');
      }
      this.client = new OpenAI({
        apiKey: apiKey || '',
        baseURL: 'https://api.deepseek.com/v1',
      });
    }
    return this.client;
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const client = this.getClient();
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY 未配置');
    }

    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
      messages: messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
    });

    const elapsed = Date.now() - startTime;
    const content = response.choices[0]?.message?.content ?? '';
    const usage = response.usage;

    this.logger.log(
      `DeepSeek 调用成功 | 耗时 ${elapsed}ms | 输入 ${usage?.prompt_tokens ?? 0} tokens | 输出 ${usage?.completion_tokens ?? 0} tokens`,
    );

    return {
      content,
      model: response.model,
      usage: usage
        ? { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens }
        : undefined,
    };
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    return !!(apiKey);
  }
}
