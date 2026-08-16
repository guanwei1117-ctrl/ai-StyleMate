import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildOutfitRecommendationPrompt } from './prompts';
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
    if (input.wardrobeItems.length === 0) {
      throw new BadRequestException('衣橱里还没有衣服，先去添加几件吧');
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
      bodyShape: input.memoryContext?.styleProfile?.bodyType ?? undefined,
      skinTone: input.memoryContext?.styleProfile?.skinTone ?? undefined,
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

  /** 记忆评分：用户偏好加权 */
  private scoreMemoryForPlan(
    plan: OutfitRecommendationPlan,
    memoryCtx?: OutfitRecommendationInput['memoryContext'],
  ): number {
    let score = 60;
    if (!memoryCtx) return score;

    const p = memoryCtx.styleProfile as any;
    if (!p) return score;

    const slots = [plan.hat, plan.top, plan.bottom, plan.outerwear, plan.shoes, plan.bag, plan.accessory];
    for (const slot of slots) {
      if (!slot?.itemId) continue;
      const item = (memoryCtx as any).wardrobeSummary?.topWorn?.find((w: any) => w.id === slot.itemId);
      if (item) {
        if (item.wearCount >= 5) score += 5;  // 常用 → 喜欢
        if (item.wearCount === 0) score += 2;  // 鼓励使用闲置
      }
    }

    if (p.likedStyles?.length > 0) score += 5;
    if (p.dislikedStyles?.length > 0) score -= 5;

    // 最近反馈加权
    if (memoryCtx.recentFeedbackSummary) {
      if (memoryCtx.recentFeedbackSummary.includes('喜欢')) score += 5;
      if (memoryCtx.recentFeedbackSummary.includes('不喜欢')) score -= 10;
    }

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
    if (!item || item.itemId === undefined || item.itemId === null) return null;
    return {
      itemId: String(item.itemId),
      category: String(item.category ?? ''),
      description: String(item.description ?? ''),
    };
  }

  private clamp(value: number, min: number, max: number): number {
    const n = Math.round(value);
    return Math.max(min, Math.min(max, n));
  }
}
