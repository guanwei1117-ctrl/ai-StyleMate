import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { WeatherService } from './weather.service';
import { WardrobeModule } from '../wardrobe/wardrobe.module';
import { UserModule } from '../user/user.module';
import { AiSkillsModule } from '../ai-skills/ai-skills.module';
import { MemoryModule } from '../memory/memory.module';
import { AiRateLimiter } from '../scoring/ai-rate-limiter';
import { Outfit } from '../wardrobe/entities/outfit.entity';
import { ShoppingListItem } from './entities/shopping-list-item.entity';

@Module({
  imports: [
    UserModule,
    WardrobeModule,
    AiSkillsModule,
    MemoryModule,
    TypeOrmModule.forFeature([Outfit, ShoppingListItem]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, WeatherService, AiRateLimiter],
  exports: [RecommendationService, WeatherService],
})
export class RecommendationModule {}
