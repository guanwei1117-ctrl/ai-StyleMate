import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';

@Injectable()
export class ClaudeProvider implements LLMProvider {
  readonly name = 'Claude';
  private readonly logger = new Logger(ClaudeProvider.name);
  private client: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
      if (!apiKey || apiKey === 'sk-ant-xxx') {
        this.logger.warn('ANTHROPIC_API_KEY 未配置或为占位值，Claude 不可用');
      }
      this.client = new Anthropic({ apiKey: apiKey || '' });
    }
    return this.client;
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const client = this.getClient();
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey || apiKey === 'sk-ant-xxx') {
      throw new Error('ANTHROPIC_API_KEY 未配置');
    }

    // 提取 system message（Claude 要求 system 单独传）
    const systemMsg = messages.find((m) => m.role === 'system');
    const userMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const startTime = Date.now();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
      system: systemMsg?.content,
      messages: userMessages,
    });

    const elapsed = Date.now() - startTime;
    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as Anthropic.TextBlock).text)
      .join('');

    this.logger.log(
      `Claude 调用成功 | 耗时 ${elapsed}ms | 输入 ${response.usage.input_tokens} tokens | 输出 ${response.usage.output_tokens} tokens`,
    );

    return {
      content: textContent,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    return !!(apiKey && apiKey !== 'sk-ant-xxx');
  }
}
