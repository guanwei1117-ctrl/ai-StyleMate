import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { LlmModule } from '../llm/llm.module';
import { AiSkillsModule } from '../ai-skills/ai-skills.module';
import { MemoryModule } from '../memory/memory.module';
import { AiRateLimiter } from './ai-rate-limiter';

@Module({
  imports: [LlmModule, AiSkillsModule, MemoryModule],
  controllers: [ScoringController],
  providers: [ScoringService, AiRateLimiter],
  exports: [ScoringService],
})
export class ScoringModule {}
