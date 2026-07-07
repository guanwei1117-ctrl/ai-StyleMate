import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';
import { ClaudeProvider } from './claude.provider';
import { OpenAIProvider } from './openai.provider';

/**
 * LLM Factory — 自动 fallback
 *
 * 优先级：
 *  1. Claude（Anthropic）
 *  2. OpenAI（fallback）
 *
 * 调用链：
 *   try Claude → 失败/超时 → try OpenAI → 失败 → 抛错
 */
@Injectable()
export class LLMFactory {
  private readonly logger = new Logger(LLMFactory.name);
  private readonly providers: LLMProvider[];

  constructor(
    private readonly claudeProvider: ClaudeProvider,
    private readonly openaiProvider: OpenAIProvider,
  ) {
    this.providers = [claudeProvider, openaiProvider];
  }

  /**
   * 按优先级依次调用 Provider，失败自动 fallback
   */
  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const timeoutMs = options?.timeoutMs ?? 30000;

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      const isLast = i === this.providers.length - 1;

      // 先检查可用性
      const available = await provider.isAvailable().catch(() => false);
      if (!available) {
        this.logger.warn(`${provider.name} 不可用，${isLast ? '无更多 fallback' : '尝试下一个'}`);
        continue;
      }

      const providerStartTime = Date.now();

      const result = await Promise.race([
        provider.chat(messages, options),
        new Promise<LLMResponse>((_, reject) =>
          setTimeout(
            () => reject(new Error(`${provider.name} 调用超时 (${timeoutMs}ms)`)),
            timeoutMs,
          ),
        ),
      ]);

      const elapsed = Date.now() - providerStartTime;

      if (result) {
        this.logger.log(`✅ 主 Provider: ${provider.name} | 总耗时 ${elapsed}ms`);
        return result;
      }

      if (!isLast) {
        this.logger.warn(`⚠️ ${provider.name} 超时，fallback 到 ${this.providers[i + 1].name}`);
      }
    }

    throw new Error('所有 LLM Provider 均不可用');
  }

  /**
   * 获取当前可用的 Provider 列表
   */
  async getAvailableProviders(): Promise<string[]> {
    const results = await Promise.all(
      this.providers.map(async (p) => {
        const available = await p.isAvailable().catch(() => false);
        return available ? p.name : null;
      }),
    );
    return results.filter((n): n is string => n !== null);
  }
}
