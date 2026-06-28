import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { WardrobeModule } from '../wardrobe/wardrobe.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, WardrobeModule],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
