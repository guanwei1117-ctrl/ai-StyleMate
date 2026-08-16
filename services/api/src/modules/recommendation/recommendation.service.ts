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
import { WardrobeGapSkill } from '../ai-skills/wardrobe-gap/wardrobe-gap.skill';
import { WardrobeGapResult } from '../ai-skills/wardrobe-gap/wardrobe-gap.dto';
import { WeatherService, WeatherInfo } from './weather.service';
import { ShoppingListItem } from './entities/shopping-list-item.entity';
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

/** 购物清单新增单品 */
export interface ShoppingListInputItem {
  category: string;
  subCategory?: string;
  description?: string;
  color?: string;
  budgetRange?: string;
  priority?: number;
  reason?: string;
  source?: string;
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
    private readonly wardrobeGapSkill: WardrobeGapSkill,
    private readonly weatherService: WeatherService,
    private readonly memoryService: MemoryService,
    @InjectRepository(Outfit)
    private readonly outfitRepo: Repository<Outfit>,
    @InjectRepository(ShoppingListItem)
    private readonly shoppingListRepo: Repository<ShoppingListItem>,
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
   * 分析衣橱缺口 — 优先 AI 个性化分析（结合风格档案+季节+预算），失败回退硬编码规则
   */
  async analyzeWardrobeGaps(userId: string, season?: string): Promise<WardrobeGapResult> {
    const items = await this.wardrobeService.getUserItems(userId);

    // 读取用户长期记忆（AI 分析需要）
    let memoryContext: AIMemoryContext | null = null;
    try {
      memoryContext = await this.memoryService.buildAIContext(userId, 'wardrobe_gap');
    } catch (err) {
      this.logger.warn(`读取用户记忆失败（回退规则分析）: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 预算档位：从记忆中取不到就用 null
    const budgetLevel = (memoryContext?.styleProfile as any)?.budgetLevel ?? undefined;
    const currentSeason = season ?? this.currentSeason();

    try {
      const result = await this.wardrobeGapSkill.analyze({
        wardrobeItems: items.map((i) => ({
          id: i.id,
          category: i.category,
          subCategory: i.subCategory ?? '',
          color: i.color,
          season: i.season ?? [],
          styleTags: i.styleTags ?? [],
          occasionTags: i.occasionTags ?? [],
          formalityScore: i.formalityScore,
          warmthScore: i.warmthScore,
          matchabilityScore: i.matchabilityScore,
        })),
        season: currentSeason,
        budgetLevel,
        memoryContext,
      });
      this.logger.log(`衣橱缺口 AI 分析完成 | userId: ${userId} | 缺口数: ${result.gaps.length}`);
      return { ...result, personalized: true };
    } catch (err) {
      this.logger.warn(`衣橱缺口 AI 分析失败，回退规则分析: ${err instanceof Error ? err.message : String(err)}`);
      return this.ruleBasedGapAnalysis(items);
    }
  }

  /** 规则回退：硬编码品类阈值（AI 不可用时兜底） */
  private ruleBasedGapAnalysis(items: WardrobeItem[]): WardrobeGapResult {
    const categoryCount: Record<string, number> = {};
    items.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const essentials: Record<string, { min: number; label: string }> = {
      top: { min: 3, label: '上装' },
      bottom: { min: 3, label: '下装' },
      outerwear: { min: 2, label: '外套' },
      dress: { min: 1, label: '连衣裙' },
      shoes: { min: 3, label: '鞋子' },
      accessory: { min: 2, label: '配饰' },
    };

    const gaps = Object.entries(essentials)
      .filter(([cat, cfg]) => (categoryCount[cat] || 0) < cfg.min)
      .map(([cat, cfg]) => ({
        category: cat,
        current: categoryCount[cat] || 0,
        recommended: cfg.min,
        missing: Math.max(0, cfg.min - (categoryCount[cat] || 0)),
        priority: 2 as const,
        reason: `${cfg.label}数量低于基础搭配所需`,
        suggestion: {
          subCategory: '',
          color: '',
          styleTags: [] as string[],
          budgetRange: '',
        },
      }))
      .sort((a, b) => b.missing - a.missing);

    return {
      summary: gaps.length > 0 ? `衣橱基础品类还不均衡，建议优先补充 ${gaps[0].category}` : '衣橱基础品类已比较均衡',
      gaps,
      personalized: false,
    };
  }

  /** 当前季节（北半球简化判断） */
  private currentSeason(): string {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return '春季';
    if (m >= 6 && m <= 8) return '夏季';
    if (m >= 9 && m <= 11) return '秋季';
    return '冬季';
  }

  async getUserOutfits(userId: string): Promise<Outfit[]> {
    return this.outfitRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 买前判断 — 用户上传商品图片，AI 结合衣橱+记忆判断是否值得购买
   *
   * 衣橱为空时也可用：仅结合风格档案判断商品本身是否适合，
   * possibleOutfits 会给出"如果买，建议搭配什么"的购买建议。
   */
  async purchaseEvaluate(
    userId: string,
    imageBase64: string,
  ): Promise<PurchaseEvaluationResult> {
    // 1. 获取衣橱单品（允许为空：空衣橱时仅基于风格档案判断）
    const wardrobeItems = await this.wardrobeService.getUserItems(userId);

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

  // ==================== 购物清单 ====================

  async getShoppingList(userId: string): Promise<ShoppingListItem[]> {
    return this.shoppingListRepo.find({
      where: { userId },
      order: { priority: 'ASC', purchased: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 批量加入购物清单
   *
   * 同一用户同品类同描述（或 subCategory）的未购买项去重，避免重复加入。
   */
  async addShoppingItems(
    userId: string,
    items: ShoppingListInputItem[],
  ): Promise<ShoppingListItem[]> {
    if (!items || items.length === 0) return this.getShoppingList(userId);

    const existing = await this.shoppingListRepo.find({
      where: { userId, purchased: false },
    });

    const toCreate: Partial<ShoppingListItem>[] = [];
    for (const item of items) {
      const dupKey = item.description || item.subCategory || item.category;
      const dup = existing.find((e) => {
        const eKey = e.description || e.subCategory || e.category;
        return e.category === item.category && eKey === dupKey;
      });
      if (dup) continue; // 已存在，跳过
      toCreate.push({
        userId,
        category: item.category,
        subCategory: item.subCategory,
        description: item.description,
        color: item.color,
        budgetRange: item.budgetRange,
        priority: item.priority ?? 2,
        reason: item.reason,
        source: item.source ?? 'manual',
      });
    }

    if (toCreate.length > 0) {
      await this.shoppingListRepo.save(this.shoppingListRepo.create(toCreate));
      this.logger.log(`购物清单新增 ${toCreate.length} 件 | userId: ${userId}`);
    }

    return this.getShoppingList(userId);
  }

  async updateShoppingItem(
    userId: string,
    id: string,
    patch: { purchased?: boolean; priority?: number; description?: string },
  ): Promise<ShoppingListItem> {
    const item = await this.shoppingListRepo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('购物清单单品不存在');
    if (patch.purchased !== undefined) item.purchased = patch.purchased;
    if (patch.priority !== undefined) item.priority = patch.priority;
    if (patch.description !== undefined) item.description = patch.description;
    return this.shoppingListRepo.save(item);
  }

  async deleteShoppingItem(userId: string, id: string): Promise<void> {
    const item = await this.shoppingListRepo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('购物清单单品不存在');
    await this.shoppingListRepo.remove(item);
  }
}
