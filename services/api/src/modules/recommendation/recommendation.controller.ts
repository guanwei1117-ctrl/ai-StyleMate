import { Controller, Get, Post, Body, Logger, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { RecommendationService } from './recommendation.service';
import { WeatherService } from './weather.service';
import { AiRateLimiter } from '../scoring/ai-rate-limiter';
import { OutfitRecommendationPlan } from '../ai-skills/outfit-recommendation/outfit-recommendation.dto';
import { WeatherInfo } from './weather.service';

@ApiTags('穿搭推荐')
@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly weatherService: WeatherService,
    private readonly aiRateLimiter: AiRateLimiter,
  ) {}

  /**
   * 今天穿什么 — 生成 3 套穿搭方案
   */
  @Post('today-outfit')
  @ApiOperation({ summary: 'AI 根据天气+衣橱+场合生成今日穿搭推荐' })
  async generateTodayOutfit(
    @Body() body: {
      userId: string;
      city: string;
      occasion: string;
      styleGoal: string;
      constraints?: string[];
    },
  ) {
    this.logger.log(
      `收到今天穿什么请求 | userId: ${body.userId} | 城市: ${body.city} | 场合: ${body.occasion}`,
    );
    return this.recommendationService.generateTodayOutfit({
      userId: body.userId,
      city: body.city,
      occasion: body.occasion,
      styleGoal: body.styleGoal,
      constraints: body.constraints ?? [],
    });
  }

  /**
   * 保存穿搭方案
   */
  @Post('save-outfit')
  @ApiOperation({ summary: '保存穿搭方案为 Outfit' })
  async saveOutfit(
    @Body() body: {
      userId: string;
      plan: OutfitRecommendationPlan;
      weather: WeatherInfo;
      occasion: string;
      styleGoal: string;
    },
  ) {
    this.logger.log(`保存穿搭方案 | userId: ${body.userId} | 标题: ${body.plan.title}`);
    return this.recommendationService.saveOutfit(body.userId, {
      plan: body.plan,
      weather: body.weather,
      occasion: body.occasion,
      styleGoal: body.styleGoal,
    });
  }

  /**
   * 查询天气（供前端预览）
   */
  @Get('weather')
  @ApiOperation({ summary: '获取城市实时天气' })
  async getWeather(city: string) {
    return this.weatherService.getWeather(city);
  }

  /**
   * 获取用户保存的穿搭列表
   */
  @Get('outfits')
  @ApiOperation({ summary: '获取用户保存的穿搭列表' })
  async getUserOutfits(userId: string) {
    return this.recommendationService.getUserOutfits(userId);
  }

  /**
   * 分析衣橱缺口
   */
  @Get('wardrobe-gaps')
  @ApiOperation({ summary: '分析衣橱缺口' })
  analyzeGaps(userId: string) {
    return this.recommendationService.analyzeWardrobeGaps(userId);
  }

  /**
   * 买前判断 — 用户上传商品图片，AI 结合衣橱判断是否值得购买
   */
  @Post('purchase-evaluate')
  @ApiOperation({ summary: 'AI 结合用户衣橱判断商品是否值得购买' })
  async purchaseEvaluate(
    @Body() body: { userId: string; imageBase64: string },
  ) {
    this.logger.log(`收到买前判断请求 | userId: ${body.userId}`);
    return this.recommendationService.purchaseEvaluate(body.userId, body.imageBase64);
  }

}
