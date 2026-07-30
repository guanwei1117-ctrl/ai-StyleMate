import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';

/**
 * Qwen-VL Provider（通义千问视觉）
 *
 * 通过阿里云 DashScope OpenAI 兼容接口调用 qwen-vl-max
 * - 国内直连，不受公司网络限制
 * - 支持图片/视觉分析（base64 图片）
 * - 性价比极高：¥3/百万 token（输入），¥12/百万 token（输出）
 *
 * API Key 获取：https://dashscope.console.aliyun.com/
 */
@Injectable()
export class QwenVLProvider implements LLMProvider {
  readonly name = 'Qwen-VL';
  readonly supportsVision = true;
  private readonly logger = new Logger(QwenVLProvider.name);
  private client: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('DASHSCOPE_API_KEY');
      if (!apiKey) {
        this.logger.warn('DASHSCOPE_API_KEY 未配置，Qwen-VL 不可用');
      }
      this.client = new OpenAI({
        apiKey: apiKey || '',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });
    }
    return this.client;
  }

  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const client = this.getClient();
    const apiKey = this.configService.get<string>('DASHSCOPE_API_KEY');
    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY 未配置');
    }

    const startTime = Date.now();

    // 构建消息，支持图片（OpenAI Vision 兼容格式）
    // 注意：前端传的是 data URI，后端确保只加一层前缀
    const formattedMessages = messages.map((m) => {
      if (m.imageBase64 && m.role === 'user') {
        // 如果已经是 data URI 则直接用，否则加前缀
        const imageUrl = m.imageBase64.startsWith('data:')
          ? m.imageBase64
          : `data:image/jpeg;base64,${m.imageBase64}`;
        return {
          role: 'user' as const,
          content: [
            { type: 'image_url' as const, image_url: { url: imageUrl } },
            { type: 'text' as const, text: m.content },
          ],
        };
      }
      return {
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      };
    });

    const response = await client.chat.completions.create({
      model: 'qwen-vl-max',
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
      messages: formattedMessages,
    });

    const elapsed = Date.now() - startTime;
    const content = response.choices[0]?.message?.content ?? '';
    const usage = response.usage;

    this.logger.log(
      `Qwen-VL 调用成功 | 耗时 ${elapsed}ms | 输入 ${usage?.prompt_tokens ?? 0} tokens | 输出 ${usage?.completion_tokens ?? 0} tokens`,
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
    const apiKey = this.configService.get<string>('DASHSCOPE_API_KEY');
    return !!(apiKey);
  }
}
