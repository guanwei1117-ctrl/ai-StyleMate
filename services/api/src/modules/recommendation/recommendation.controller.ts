import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { RecommendationService } from './recommendation.service';
import { WeatherService } from './weather.service';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { resolveUserId } from '../../common/guards/resolve-user-id';
import { OutfitRecommendationPlan } from '../ai-skills/outfit-recommendation/outfit-recommendation.dto';
import { WeatherInfo } from './weather.service';

@ApiTags('穿搭推荐')
@UseGuards(OptionalAuthGuard)
@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly weatherService: WeatherService,
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
    @Req() req: Request,
  ) {
    const userId = resolveUserId(req, body.userId);
    this.logger.log(
      `收到今天穿什么请求 | userId: ${userId} | 城市: ${body.city} | 场合: ${body.occasion}`,
    );
    return this.recommendationService.generateTodayOutfit({
      userId,
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
    @Req() req: Request,
  ) {
    const userId = resolveUserId(req, body.userId);
    this.logger.log(`保存穿搭方案 | userId: ${userId} | 标题: ${body.plan.title}`);
    return this.recommendationService.saveOutfit(userId, {
      plan: body.plan,
      weather: body.weather,
      occasion: body.occasion,
      styleGoal: body.styleGoal,
    });
  }

  /**
   * 单品出发搭配 — "这件怎么搭"
   */
  @Post('style-item')
  @ApiOperation({ summary: '以衣橱中一件单品为核心生成搭配方案' })
  async styleItem(
    @Body() body: { userId: string; itemId: string; occasion?: string },
    @Req() req: Request,
  ) {
    const userId = resolveUserId(req, body.userId);
    this.logger.log(
      `收到单品搭配请求 | userId: ${userId} | itemId: ${body.itemId} | 场合: ${body.occasion ?? '不限'}`,
    );
    return this.recommendationService.styleItem(userId, body.itemId, body.occasion);
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
  async getUserOutfits(@Query('userId') userId: string, @Req() req: Request) {
    return this.recommendationService.getUserOutfits(resolveUserId(req, userId));
  }

  /**
   * 分析衣橱缺口 — AI 个性化分析（结合风格档案+季节+预算），失败自动回退规则
   */
  @Get('wardrobe-gaps')
  @ApiOperation({ summary: '分析衣橱缺口（AI 个性化）' })
  analyzeGaps(@Query('userId') userId: string, @Query('season') season: string | undefined, @Req() req: Request) {
    return this.recommendationService.analyzeWardrobeGaps(resolveUserId(req, userId), season);
  }

  /**
   * 获取购物清单
   */
  @Get('shopping-list')
  @ApiOperation({ summary: '获取用户购物清单' })
  getShoppingList(@Query('userId') userId: string, @Req() req: Request) {
    return this.recommendationService.getShoppingList(resolveUserId(req, userId));
  }

  /**
   * 批量加入购物清单
   */
  @Post('shopping-list')
  @ApiOperation({ summary: '批量加入购物清单（自动去重）' })
  addShoppingItems(
    @Body() body: { userId: string; items: Array<Record<string, unknown>> },
    @Req() req: Request,
  ) {
    const userId = resolveUserId(req, body.userId);
    return this.recommendationService.addShoppingItems(
      userId,
      body.items as Array<{
        category: string;
        subCategory?: string;
        description?: string;
        color?: string;
        budgetRange?: string;
        priority?: number;
        reason?: string;
        source?: string;
      }>,
    );
  }

  /**
   * 更新购物清单单品（标记已买/改优先级）
   */
  @Patch('shopping-list/:id')
  @ApiOperation({ summary: '更新购物清单单品' })
  updateShoppingItem(
    @Param('id') id: string,
    @Body() body: { userId: string; purchased?: boolean; priority?: number; description?: string },
    @Req() req: Request,
  ) {
    return this.recommendationService.updateShoppingItem(resolveUserId(req, body.userId), id, body);
  }

  /**
   * 删除购物清单单品
   */
  @Delete('shopping-list/:id')
  @ApiOperation({ summary: '删除购物清单单品' })
  async deleteShoppingItem(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Req() req: Request,
  ) {
    await this.recommendationService.deleteShoppingItem(resolveUserId(req, userId), id);
    return { code: 0, message: '已删除' };
  }

  /**
   * 买前判断 — 用户上传商品图片，AI 结合衣橱判断是否值得购买
   */
  @Post('purchase-evaluate')
  @ApiOperation({ summary: 'AI 结合用户衣橱判断商品是否值得购买' })
  async purchaseEvaluate(
    @Body() body: { userId: string; imageBase64: string },
    @Req() req: Request,
  ) {
    const userId = resolveUserId(req, body.userId);
    this.logger.log(`收到买前判断请求 | userId: ${userId}`);
    return this.recommendationService.purchaseEvaluate(userId, body.imageBase64);
  }

}
