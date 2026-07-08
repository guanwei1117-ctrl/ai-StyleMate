import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider, ChatMessage, LLMOptions, LLMResponse } from './llm-provider.interface';
import { ClaudeProvider } from './claude.provider';
import { OpenAIProvider } from './openai.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { QwenVLProvider } from './qwen-vl.provider';

/**
 * LLM Factory — 自动 fallback（支持图片标注）
 *
 * 无图片时：
 *  DeepSeek → Qwen-VL → OpenAI → Claude（DeepSeek 国内最快）
 *
 * 有图片时：
 *  Qwen-VL（通义千问国内直连）→ OpenAI（GPT-4o）→ Claude（Sonnet）
 *  （DeepSeek 不支持视觉，自动跳过）
 */
@Injectable()
export class LLMFactory {
  private readonly logger = new Logger(LLMFactory.name);
  private readonly allProviders: LLMProvider[];

  constructor(
    private readonly claudeProvider: ClaudeProvider,
    private readonly openaiProvider: OpenAIProvider,
    private readonly deepSeekProvider: DeepSeekProvider,
    private readonly qwenVLProvider: QwenVLProvider,
  ) {
    this.allProviders = [deepSeekProvider, qwenVLProvider, openaiProvider, claudeProvider];
  }

  /**
   * 按优先级依次调用 Provider，失败自动 fallback
   * 如果消息中包含图片，自动跳过不支持视觉的 Provider
   */
  async chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const timeoutMs = options?.timeoutMs ?? 30000;

    // 检查是否有图片
    const hasImage = messages.some((m) => m.imageBase64);

    // 有图片时过滤掉不支持视觉的 Provider
    const providers = hasImage
      ? this.allProviders.filter((p) => p.supportsVision)
      : this.allProviders;

    if (providers.length === 0) {
      throw new Error('没有可用的 Provider（所有支持视觉的 Provider 均未配置）');
    }

    if (hasImage) {
      this.logger.log(
        `检测到图片附件，可用 Provider: ${providers.map((p) => p.name).join(' → ')} （已跳过不支持视觉的 Provider）`,
      );
    }

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const isLast = i === providers.length - 1;

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
        this.logger.warn(`⚠️ ${provider.name} 超时，fallback 到 ${providers[i + 1].name}`);
      }
    }

    throw new Error('所有 LLM Provider 均不可用');
  }

  /**
   * 获取当前可用的 Provider 列表
   */
  async getAvailableProviders(): Promise<string[]> {
    const results = await Promise.all(
      this.allProviders.map(async (p) => {
        const available = await p.isAvailable().catch(() => false);
        return available ? p.name : null;
      }),
    );
    return results.filter((n): n is string => n !== null);
  }
}
