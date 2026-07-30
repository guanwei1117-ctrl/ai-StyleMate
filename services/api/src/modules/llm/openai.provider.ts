import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';

/** MIME type 映射 */
function detectImageType(base64: string): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBOR')) return 'image/png';
  if (base64.startsWith('R0lG')) return 'image/gif';
  if (base64.startsWith('UklG')) return 'image/webp';
  return 'image/jpeg'; // 默认
}

@Injectable()
export class OpenAIProvider implements LLMProvider {
  readonly name = 'OpenAI';
  readonly supportsVision = true; // GPT-4o 支持图片分析
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

    // 构建消息，支持图片
    const formattedMessages = messages.map((m) => {
      // 如果有图片附件且是 user 消息，使用 Vision API 格式
      if (m.imageBase64 && m.role === 'user') {
        // 如果已经是完整 data URI 则直接用，否则加前缀
        const imageUrl = m.imageBase64.startsWith('data:')
          ? m.imageBase64
          : `data:${detectImageType(m.imageBase64)};base64,${m.imageBase64}`;
        return {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: m.content },
            { type: 'image_url' as const, image_url: { url: imageUrl } },
          ],
        };
      }
      return {
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      };
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
      messages: formattedMessages,
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
        ? { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens }
        : undefined,
    };
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    return !!(apiKey && apiKey !== 'sk-xxx');
  }
}
