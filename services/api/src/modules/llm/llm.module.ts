import { Module } from '@nestjs/common';
import { ClaudeProvider } from './claude.provider';
import { OpenAIProvider } from './openai.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { QwenVLProvider } from './qwen-vl.provider';
import { LLMFactory } from './llm-factory';

/**
 * LLM 共享模块
 *
 * 从 scoring 模块提取，供 scoring / ai-skills / wardrobe 等模块复用。
 * 避免循环依赖：所有需要调用 LLM 的模块都 import 此模块。
 */
@Module({
  providers: [ClaudeProvider, OpenAIProvider, DeepSeekProvider, QwenVLProvider, LLMFactory],
  exports: [LLMFactory],
})
export class LlmModule {}
