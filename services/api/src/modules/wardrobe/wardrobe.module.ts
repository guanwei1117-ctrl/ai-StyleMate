import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WardrobeController } from './wardrobe.controller';
import { WardrobeService } from './wardrobe.service';
import { WardrobeItem } from './entities/wardrobe-item.entity';
import { Outfit } from './entities/outfit.entity';
import { AiSkillsModule } from '../ai-skills/ai-skills.module';
import { AiRateLimiter } from '../scoring/ai-rate-limiter';

@Module({
  imports: [TypeOrmModule.forFeature([WardrobeItem, Outfit]), AiSkillsModule],
  controllers: [WardrobeController],
  providers: [WardrobeService, AiRateLimiter],
  exports: [WardrobeService],
})
export class WardrobeModule {}
