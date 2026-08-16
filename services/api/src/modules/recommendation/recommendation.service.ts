import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { WardrobeService } from '../wardrobe/wardrobe.service';
import { WardrobeItem } from '../wardrobe/entities/wardrobe-item.entity';
import { Outfit } from '../wardrobe/entities/outfit.entity';
import { OutfitRecommendationSkill } from '../ai-skills/outfit-recommendation/outfit-recommendation.skill';
import { PurchaseEvaluationSkill } from '../ai-skills/purchase-evaluation/purchase-evaluation.skill';
import { PurchaseEvaluationResult } from '../ai-skills/purchase-evaluation/purchase-evaluation.dto';
import { ItemStylingSkill } from '../ai-skills/item-styling/item-styling.skill';
import { ItemStylingResult } from '../ai-skills/item-styling/item-styling.dto';
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
  /** 是否为空衣橱起步方案（单品均为购买建议） */
  isStarter?: boolean;
  /** 起步方案提示文案 */
  starterMessage?: string;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly userService: UserService,
    private readonly wardrobeService: WardrobeService,
    private readonly outfitRecommendationSkill: OutfitRecommendationSkill,
    private readonly purchaseEvaluationSkill: PurchaseEvaluationSkill,
    private readonly itemStylingSkill: ItemStylingSkill,
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

    // 2. 获取衣橱单品（允许为空：空衣橱走"起步方案"，给出建议购买单品而不是报错）
    const wardrobeItems = await this.wardrobeService.getUserItems(req.userId);

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
      isStarter: result.isStarter,
      starterMessage: result.starterMessage,
    };
  }

  /**
   * 单品出发搭配 — 用户问"这件怎么搭"
   *
   * 以衣橱中一件单品为核心，结合用户其余单品与长期记忆，生成 3 套搭配方案。
   * 衣橱缺少的品类会以"建议购买"的形式给出，帮助不会穿搭的用户直接执行。
   */
  async styleItem(
    userId: string,
    itemId: string,
    occasion?: string,
  ): Promise<ItemStylingResult> {
    // 1. 焦点单品（校验属于该用户）
    const focusItem = await this.wardrobeService.getItemById(itemId);
    if (focusItem.userId !== userId) {
      throw new NotFoundException('衣物不存在');
    }

    // 2. 衣橱其余单品
    const wardrobeItems = await this.wardrobeService.getUserItems(userId);

    // 3. 读取用户长期记忆
    let memoryContext: AIMemoryContext | null = null;
    try {
      memoryContext = await this.memoryService.buildAIContext(userId, 'item_styling');
      this.logger.log(
        `单品搭配已加载用户记忆 | userId: ${userId} | 记忆摘要: ${memoryContext.memorySummary ? '有' : '无'}`,
      );
    } catch (err) {
      this.logger.warn(`读取用户记忆失败（不影响主流程）: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 4. 调用 AI skill
    const result = await this.itemStylingSkill.style({
      focusItem: this.toStylingItem(focusItem),
      wardrobeItems: wardrobeItems
        .filter((i) => i.id !== itemId)
        .map((i) => this.toStylingItem(i)),
      occasion,
      memoryContext,
    });

    // 用户进行单品搭配 → 自动更新记忆（best-effort）
    try {
      await this.memoryService.autoMergeFromBehavior(userId, {
        action: `查看了单品「${result.focusItemName || focusItem.subCategory}」的搭配方案`,
        extraContext: result.note,
      });
    } catch {
      // 静默处理
    }

    return result;
  }

  /** WardrobeItem → AI skill 单品摘要 */
  private toStylingItem(i: WardrobeItem) {
    return {
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
    for (const slot of ['hat', 'top', 'bottom', 'outerwear', 'shoes', 'bag', 'accessory'] as const) {
      const item = data.plan[slot];
      // 起步方案的建议单品没有真实 itemId，跳过
      if (item && item.itemId) {
        items.push({ itemId: item.itemId, position: position++ });
      }
    }

    if (items.length === 0) {
      throw new BadRequestException(
        '这套方案由建议购买的单品组成，请先添加衣物到衣橱后再保存',
      );
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

    const saved = await this.outfitRepo.save(outfit);

    // 用户保存穿搭 → 自动更新记忆（best-effort，不影响主流程）
    try {
      await this.memoryService.autoMergeFromBehavior(userId, {
        action: `采纳了AI推荐的「${data.plan.title}」穿搭方案（${data.plan.type === 'safe' ? '稳妥' : data.plan.type === 'flattering' ? '显瘦显高' : '氛围感'}）`,
        occasion: data.occasion,
        outfitDescription: data.plan.reason,
      });
    } catch {
      // 静默处理
    }

    return saved;
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

    // 用户进行购买评估 → 自动更新记忆（best-effort，不影响主流程）
    try {
      await this.memoryService.autoMergeFromBehavior(userId, {
        action: `进行了购买评估，决策：${result.decision === 'buy' ? '建议购买' : result.decision === 'consider' ? '可考虑' : '建议跳过'}（评分 ${result.score}）`,
        colors: result.betterColors,
        extraContext: result.reasons?.join('；'),
      });
    } catch {
      // 静默处理
    }

    return result;
  }
}
