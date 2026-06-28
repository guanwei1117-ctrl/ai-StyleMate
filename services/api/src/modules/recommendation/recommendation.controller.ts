import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';

@ApiTags('穿搭推荐')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('outfit')
  @ApiOperation({ summary: '生成穿搭推荐' })
  generateOutfit(@Body() body: { userId: string; occasion?: string }) {
    return this.recommendationService.generateOutfitRecommendation(
      body.userId,
      body.occasion,
    );
  }

  @Get('wardrobe-gaps')
  @ApiOperation({ summary: '分析衣橱缺口' })
  analyzeGaps(@Query('userId') userId: string) {
    return this.recommendationService.analyzeWardrobeGaps(userId);
  }
}
