import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlmModule } from '../llm/llm.module';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';
import { UserStyleProfile } from './entities/user-style-profile.entity';
import { OutfitFeedback } from './entities/outfit-feedback.entity';
import { UserCurrentIntent } from './entities/user-current-intent.entity';
import { UserMemorySummary } from './entities/user-memory-summary.entity';
import { WardrobeItem } from '../wardrobe/entities/wardrobe-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserStyleProfile,
      OutfitFeedback,
      UserCurrentIntent,
      UserMemorySummary,
      WardrobeItem,
    ]),
    LlmModule,
  ],
  controllers: [MemoryController],
  providers: [MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}
