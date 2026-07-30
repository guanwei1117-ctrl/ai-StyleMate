import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildOutfitRecommendationPrompt } from './prompts';
import {
  OutfitRecommendationInput,
  OutfitRecommendationResult,
  OutfitRecommendationPlan,
} from './outfit-recommendation.dto';

const VALID_TYPES = ['safe', 'flattering', 'vibe'];

@Injectable()
export class OutfitRecommendationSkill {
  private readonly logger = new Logger(OutfitRecommendationSkill.name);

  constructor(private readonly llmFactory: LLMFactory) {}

  async recommend(input: OutfitRecommendationInput): Promise<OutfitRecommendationResult> {
    if (input.wardrobeItems.length === 0) {
      throw new BadRequestException('衣橱里还没有衣服，先去添加几件吧');
    }

    const systemPrompt = buildOutfitRecommendationPrompt(input);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请基于我的衣橱和今天的情况，推荐 3 套穿搭方案。' },
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
    return parsed;
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
          top: this.parseItem(p.top),
          bottom: this.parseItem(p.bottom),
          outerwear: this.parseItem(p.outerwear),
          shoes: this.parseItem(p.shoes),
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
