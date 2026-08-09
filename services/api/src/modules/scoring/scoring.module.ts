import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { ResponseParserService } from './response-parser.service';
import { PromptBuilderService } from './prompt-builder.service';
import { AiResponseCache } from './ai-response-cache';
import { LlmModule } from '../llm/llm.module';
import { AiSkillsModule } from '../ai-skills/ai-skills.module';
import { AiRateLimiter } from './ai-rate-limiter';

@Module({
  imports: [LlmModule, AiSkillsModule],
  controllers: [ScoringController],
  providers: [ScoringService, ResponseParserService, PromptBuilderService, AiResponseCache, AiRateLimiter],
  exports: [ScoringService],
})
export class ScoringModule {}
