import { Injectable, Logger } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import {
  buildOutfitRecommendationPrompt,
  buildStarterOutfitPrompt,
} from './prompts';
import { StylingRulesEngine } from './styling-rules.engine';
import {
  OutfitRecommendationInput,
  OutfitRecommendationResult,
  OutfitRecommendationPlan,
} from './outfit-recommendation.dto';

const VALID_TYPES = ['safe', 'flattering', 'vibe'];

@Injectable()
export class OutfitRecommendationSkill {
  private readonly logger = new Logger(OutfitRecommendationSkill.name);
  private readonly rulesEngine = new StylingRulesEngine();

  constructor(private readonly llmFactory: LLMFactory) {}

  async recommend(input: OutfitRecommendationInput): Promise<OutfitRecommendationResult> {
    // 空衣橱 → 起步方案：给出建议购买的单品组合，而不是报错挡人
    if (input.wardrobeItems.length === 0) {
      return this.recommendStarter(input);
    }

    // ====== 规则引擎预分析 (40% 权重) ======
    const rulesOutput = this.rulesEngine.evaluate({
      items: input.wardrobeItems,
      weather: {
        temperature: input.weather.temperature,
        isRaining: input.weather.isRaining,
        windSpeed: input.weather.windSpeed,
      },
      occasion: input.occasion,
      styleGoal: input.styleGoal,
      bodyShape: undefined, // 体型数据从用户基础信息获取
      skinTone: undefined,  // 肤色数据从用户基础信息获取
    });

    this.logger.log(
      `规则引擎分析完成 | 单品数: ${input.wardrobeItems.length} | 排除: ${rulesOutput.excludedItems.length} | 品类: ${rulesOutput.topByCategory.size}`,
    );

    // ====== AI 推荐 (40% 权重) ======
    const systemPrompt = buildOutfitRecommendationPrompt(input, rulesOutput.rulesSummary);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请基于我的衣橱和今天的情况，在规则引擎建议的基础上推荐 3 套穿搭方案。' },
    ];

    this.logger.log(
      `开始穿搭推荐 AI 调用 | 单品数: ${input.wardrobeItems.length} | 城市: ${input.weather.city} | 场合: ${input.occasion}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.6,
      maxTokens: 3000,
      timeoutMs: 90000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(
      `穿搭推荐完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model} | 方案数: ${parsed.plans.length}`,
    );

    // ====== 合并评分 (4:4:2) ======
    for (const plan of parsed.plans) {
      const aiScore = plan.score;
      let rulesScore = 0;
      let ruleCount = 0;
      for (const slot of [plan.hat, plan.top, plan.bottom, plan.outerwear, plan.shoes, plan.bag, plan.accessory]) {
        if (slot?.itemId) {
          const s = rulesOutput.itemScores.get(slot.itemId);
          if (s) { rulesScore += s.totalScore; ruleCount++; }
        }
      }
      const avgRulesScore = ruleCount > 0 ? Math.round(rulesScore / ruleCount) : 60;
      const memoryScore = this.scoreMemoryForPlan(plan, input.memoryContext);
      // 4:4:2 加权
      plan.score = Math.round(aiScore * 0.4 + avgRulesScore * 0.4 + memoryScore * 0.2);
    }

    return parsed;
  }

  /**
   * 空衣橱起步方案 — 基于用户画像+天气+场合，给出"建议购买"的穿搭方案
   *
   * 解决痛点：不会穿搭的新手往往衣橱为空，直接报错会把最需要帮助的人挡在门外。
   * 这里不引用任何衣橱单品，所有 slot 都是购买建议（isSuggestion: true）。
   */
  private async recommendStarter(
    input: OutfitRecommendationInput,
  ): Promise<OutfitRecommendationResult> {
    const systemPrompt = buildStarterOutfitPrompt(input);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '我的衣橱还是空的，请给我几套可以直接照着买的起步穿搭方案。' },
    ];

    this.logger.log(
      `空衣橱起步方案 AI 调用 | 城市: ${input.weather.city} | 场合: ${input.occasion} | 风格目标: ${input.styleGoal}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.6,
      maxTokens: 3000,
      timeoutMs: 90000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(
      `空衣橱起步方案完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model} | 方案数: ${parsed.plans.length}`,
    );

    return {
      ...parsed,
      isStarter: true,
      starterMessage:
        '你的衣橱还是空的，以上方案中的单品都是购买建议。把它们加入衣橱后，推荐会精确到你的每一件衣服。',
    };
  }

  /** 记忆评分：基于 MemorySnapshot 的用户偏好加权 */
  private scoreMemoryForPlan(
    plan: OutfitRecommendationPlan,
    memoryCtx?: OutfitRecommendationInput['memoryContext'],
  ): number {
    let score = 60;
    if (!memoryCtx?.snapshot) return score;

    const s = memoryCtx.snapshot;

    // 喜欢风格 → 加分
    if (s.likedStyles.length > 0) score += 5;
    // 避开风格 → 减分
    if (s.dislikedStyles.length > 0) score -= 5;
    // 避坑规则 → 减分（有规则说明用户有明确偏好）
    if (s.avoidRules.length > 0) score -= 3;
    // 穿搭目标 → 加分
    if (s.dressGoals.length > 0) score += 3;

    return Math.min(100, Math.max(20, score));
  }

  private parseResponse(content: string): OutfitRecommendationResult {
    let jsonStr = content.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    const plans: OutfitRecommendationPlan[] = Array.isArray(parsed.plans)
      ? parsed.plans.map((p: any) => ({
          type: (VALID_TYPES.includes(String(p.type)) ? String(p.type) : 'safe') as OutfitRecommendationPlan['type'],
          title: String(p.title ?? ''),
          hat: this.parseItem(p.hat),
          top: this.parseItem(p.top),
          bottom: this.parseItem(p.bottom),
          outerwear: this.parseItem(p.outerwear),
          shoes: this.parseItem(p.shoes),
          bag: this.parseItem(p.bag),
          accessory: this.parseItem(p.accessory),
          reason: String(p.reason ?? ''),
          scene: String(p.scene ?? ''),
          riskWarning: String(p.riskWarning ?? ''),
          score: this.clamp(Number(p.score ?? 70), 1, 100),
        }))
      : [];

    return { plans };
  }

  private parseItem(item: any): OutfitRecommendationPlan['top'] {
    if (!item || typeof item !== 'object') return null;
    const hasRealId = item.itemId !== undefined && item.itemId !== null && String(item.itemId).trim() !== '';
    return {
      itemId: hasRealId ? String(item.itemId) : '',
      category: String(item.category ?? ''),
      description: String(item.description ?? ''),
      isSuggestion: !hasRealId,
      budgetHint: item.budgetHint ? String(item.budgetHint) : undefined,
    };
  }

  private clamp(value: number, min: number, max: number): number {
    const n = Math.round(value);
    return Math.max(min, Math.min(max, n));
  }
}
