import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  readonly name = 'OpenAI';
  private readonly logger = new Logger(OpenAIProvider.name);
  private client: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey || apiKey === 'sk-xxx') {
        this.logger.warn('OPENAI_API_KEY 未配置或为占位值，OpenAI 不可用');
      }
      this.client = new OpenAI({ apiKey: apiKey || '' });
    }
    return this.client;
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const client = this.getClient();
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'sk-xxx') {
      throw new Error('OPENAI_API_KEY 未配置');
    }

    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
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
      `OpenAI 调用成功 | 耗时 ${elapsed}ms | 输入 ${usage?.prompt_tokens ?? 0} tokens | 输出 ${usage?.completion_tokens ?? 0} tokens`,
    );

    return {
      content,
      model: response.model,
      usage: usage
        ? {
            inputTokens: usage.prompt_tokens,
            outputTokens: usage.completion_tokens,
          }
        : undefined,
    };
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    return !!(apiKey && apiKey !== 'sk-xxx');
  }
}
