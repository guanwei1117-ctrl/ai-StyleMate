import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { WardrobeService } from '../wardrobe/wardrobe.service';
import { WardrobeItem } from '../wardrobe/entities/wardrobe-item.entity';
import { Outfit } from '../wardrobe/entities/outfit.entity';
import { OutfitRecommendationSkill } from '../ai-skills/outfit-recommendation/outfit-recommendation.skill';
import { PurchaseEvaluationSkill } from '../ai-skills/purchase-evaluation/purchase-evaluation.skill';
import { PurchaseEvaluationResult } from '../ai-skills/purchase-evaluation/purchase-evaluation.dto';
import { WeatherService, WeatherInfo } from './weather.service';
import { MemoryService } from '../memory/memory.service';
import { AIMemoryContext } from '../memory/memory.dto';
import {
  OutfitRecommendationInput,
  OutfitRecommendationPlan,
} from '../ai-skills/outfit-recommendation/outfit-recommendation.dto';

export interface TodayOutfitRequest {
  userId: string;
  city: string;
  occasion: string;
  styleGoal: string;
  constraints: string[];
}

export interface TodayOutfitResponse {
  weather: WeatherInfo;
  plans: OutfitRecommendationPlan[];
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly userService: UserService,
    private readonly wardrobeService: WardrobeService,
    private readonly outfitRecommendationSkill: OutfitRecommendationSkill,
    private readonly purchaseEvaluationSkill: PurchaseEvaluationSkill,
    private readonly weatherService: WeatherService,
    private readonly memoryService: MemoryService,
    @InjectRepository(Outfit)
    private readonly outfitRepo: Repository<Outfit>,
  ) {}

  /**
   * 今天穿什么 — 获取天气 + 读取用户记忆 + 调用 AI 生成 3 套穿搭方案
   */
  async generateTodayOutfit(req: TodayOutfitRequest): Promise<TodayOutfitResponse> {
    // 1. 获取天气
    const weather = await this.weatherService.getWeather(req.city);

    // 2. 获取衣橱单品
    const wardrobeItems = await this.wardrobeService.getUserItems(req.userId);

    if (wardrobeItems.length === 0) {
      throw new NotFoundException('衣橱里还没有衣服，先去添加几件吧');
    }

    // 3. 读取用户长期记忆（AI 调用前必须先读取记忆）
    let memoryContext: AIMemoryContext | null = null;
    try {
      memoryContext = await this.memoryService.buildAIContext(req.userId, 'today_outfit');
      this.logger.log(
        `已加载用户记忆 | userId: ${req.userId} | 记忆摘要: ${memoryContext.memorySummary ? '有' : '无'} | 反馈: ${memoryContext.recentFeedbackSummary ? '有' : '无'}`,
      );
    } catch (err) {
      this.logger.warn(`读取用户记忆失败（不影响主流程）: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 4. 调用 AI skill 生成推荐（注入记忆上下文）
    const input: OutfitRecommendationInput = {
      wardrobeItems: wardrobeItems.map((i) => ({
        id: i.id,
        category: i.category,
        subCategory: i.subCategory ?? '',
        color: i.color,
        material: i.material ?? '',
        season: i.season ?? [],
        styleTags: i.styleTags ?? [],
        occasionTags: i.occasionTags ?? [],
        formalityScore: i.formalityScore,
        warmthScore: i.warmthScore,
        matchabilityScore: i.matchabilityScore,
        matchColors: i.matchColors ?? [],
        matchCategories: i.matchCategories ?? [],
      })),
      weather: {
        city: weather.city,
        condition: weather.condition,
        temperature: weather.temperature,
        apparentTemperature: weather.apparentTemperature,
        windSpeed: weather.windSpeed,
        humidity: weather.humidity,
        isRaining: weather.isRaining,
      },
      occasion: req.occasion,
      styleGoal: req.styleGoal,
      constraints: req.constraints ?? [],
      memoryContext,
    };

    const result = await this.outfitRecommendationSkill.recommend(input);

    return {
      weather,
      plans: result.plans,
    };
  }

  /**
   * 保存穿搭方案为 Outfit
   */
  async saveOutfit(
    userId: string,
    data: {
      plan: OutfitRecommendationPlan;
      weather: WeatherInfo;
      occasion: string;
      styleGoal: string;
    },
  ): Promise<Outfit> {
    const items: Array<{ itemId: string; position: number }> = [];
    let position = 0;
    for (const slot of ['top', 'bottom', 'outerwear', 'shoes', 'accessory'] as const) {
      const item = data.plan[slot];
      if (item) {
        items.push({ itemId: item.itemId, position: position++ });
      }
    }

    const outfit = this.outfitRepo.create({
      userId,
      name: data.plan.title,
      title: data.plan.title,
      items,
      occasion: [data.occasion],
      styleTags: [],
      styleGoal: data.styleGoal,
      weather: data.weather as unknown as Record<string, unknown>,
      score: data.plan.score,
      aiReason: `${data.plan.reason}\n\n适合场景：${data.plan.scene}\n风险提醒：${data.plan.riskWarning}`,
      isAiGenerated: true,
    });

    return this.outfitRepo.save(outfit);
  }

  /**
   * 分析衣橱缺口
   */
  async analyzeWardrobeGaps(userId: string) {
    const items = await this.wardrobeService.getUserItems(userId);

    const categoryCount: Record<string, number> = {};
    items.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const essentials = {
      top: 3,
      bottom: 3,
      outerwear: 2,
      dress: 1,
      shoes: 3,
      accessory: 2,
    };

    const gaps = Object.entries(essentials)
      .filter(([cat, min]) => (categoryCount[cat] || 0) < min)
      .map(([cat, min]) => ({
        category: cat,
        current: categoryCount[cat] || 0,
        recommended: min,
        missing: min - (categoryCount[cat] || 0),
      }));

    return { gaps, totalItems: items.length };
  }

  async getUserOutfits(userId: string): Promise<Outfit[]> {
    return this.outfitRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 买前判断 — 用户上传商品图片，AI 结合衣橱+记忆判断是否值得购买
   */
  async purchaseEvaluate(
    userId: string,
    imageBase64: string,
  ): Promise<PurchaseEvaluationResult> {
    // 1. 获取衣橱单品
    const wardrobeItems = await this.wardrobeService.getUserItems(userId);

    if (wardrobeItems.length === 0) {
      throw new NotFoundException('衣橱里还没有衣服，先去添加几件吧');
    }

    // 2. 读取用户长期记忆（AI 调用前必须先读取记忆）
    let memoryContext: AIMemoryContext | null = null;
    try {
      memoryContext = await this.memoryService.buildAIContext(userId, 'purchase_evaluate');
      this.logger.log(
        `买前判断已加载用户记忆 | userId: ${userId} | 记忆摘要: ${memoryContext.memorySummary ? '有' : '无'}`,
      );
    } catch (err) {
      this.logger.warn(`读取用户记忆失败（不影响主流程）: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 3. 从记忆中提取用户画像
    let userProfile: PurchaseEvaluationResult['matchedWardrobeItems'] | undefined;
    try {
      const bodyProfile = await this.userService.getBodyProfile(userId);
      const stylePref = await this.userService.getStylePreference(userId);
      userProfile = {
        bodyShape: bodyProfile?.bodyShape ?? undefined,
        stylePreferences: stylePref?.preferredStyles ?? undefined,
        dressingGoals: undefined,
      } as any;
    } catch {
      // 用户画像非必需，获取失败不影响主流程
    }

    // 4. 调用 AI skill（注入记忆上下文）
    const result = await this.purchaseEvaluationSkill.evaluate({
      imageBase64,
      wardrobeItems,
      userProfile: userProfile as any,
      memoryContext,
    });

    return result;
  }
}
