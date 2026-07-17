import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { ClaudeProvider } from './llm/claude.provider';
import { OpenAIProvider } from './llm/openai.provider';
import { DeepSeekProvider } from './llm/deepseek.provider';
import { QwenVLProvider } from './llm/qwen-vl.provider';
import { LLMFactory } from './llm/llm-factory';
import { AiRateLimiter } from './ai-rate-limiter';

@Module({
  controllers: [ScoringController],
  providers: [ScoringService, ClaudeProvider, OpenAIProvider, DeepSeekProvider, QwenVLProvider, LLMFactory, AiRateLimiter],
  exports: [ScoringService],
})
export class ScoringModule {}
