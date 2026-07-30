import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';

/**
 * 提取原始 base64 并检测 MIME 类型
 * 兼容两种输入：纯 base64 或 data:...;base64,... 完整 URI
 */
function extractBase64(input: string): { mime: string; raw: string } {
  const dataUriMatch = input.match(/^data:(image\/\w+);base64,(.+)$/);
  if (dataUriMatch) {
    return { mime: dataUriMatch[1], raw: dataUriMatch[2] };
  }
  // 纯 base64，根据 magic bytes 检测
  let mime = 'image/jpeg';
  if (input.startsWith('iVBOR')) mime = 'image/png';
  else if (input.startsWith('R0lG')) mime = 'image/gif';
  else if (input.startsWith('UklG')) mime = 'image/webp';
  return { mime, raw: input };
}

function detectImageType(base64: string): string {
  return extractBase64(base64).mime;
}

@Injectable()
export class ClaudeProvider implements LLMProvider {
  readonly name = 'Claude';
  readonly supportsVision = true; // Claude Sonnet 支持图片分析
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
      .map((m) => {
        // 如果有图片附件，构建 Claude 图片块格式
        if (m.imageBase64 && m.role === 'user') {
          const { mime, raw } = extractBase64(m.imageBase64);
          return {
            role: 'user' as const,
            content: [
              { type: 'text' as const, text: m.content },
              {
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: mime as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: raw,
                },
              },
            ],
          };
        }
        return {
          role: m.role as 'user' | 'assistant',
          content: m.content,
        };
      });

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
