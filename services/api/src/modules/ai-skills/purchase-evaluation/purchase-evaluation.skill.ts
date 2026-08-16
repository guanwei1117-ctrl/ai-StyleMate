import { Injectable, Logger } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildPurchaseEvaluationPrompt } from './prompts';
import {
  PurchaseEvaluationInput,
  PurchaseEvaluationResult,
  MatchedWardrobeItem,
} from './purchase-evaluation.dto';

const VALID_DECISIONS = ['buy', 'consider', 'skip'] as const;
const VALID_RISK_LEVELS = ['low', 'medium', 'high'] as const;

@Injectable()
export class PurchaseEvaluationSkill {
  private readonly logger = new Logger(PurchaseEvaluationSkill.name);

  constructor(private readonly llmFactory: LLMFactory) {}

  async evaluate(input: PurchaseEvaluationInput): Promise<PurchaseEvaluationResult> {
    const systemPrompt = buildPurchaseEvaluationPrompt(input);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: '请判断这件商品是否值得购买，返回结构化 JSON 结果。',
        imageBase64: input.imageBase64,
      },
    ];

    this.logger.log(
      `开始买前判断 AI 调用 | 单品数: ${input.wardrobeItems.length}${input.wardrobeItems.length === 0 ? '（空衣橱，仅基于风格档案判断）' : ''}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.5,
      maxTokens: 3000,
      timeoutMs: 90000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(
      `买前判断完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model} | 决策: ${parsed.decision} | 评分: ${parsed.score}`,
    );
    return parsed;
  }

  private parseResponse(content: string): PurchaseEvaluationResult {
    let jsonStr = content.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    const decision = VALID_DECISIONS.includes(parsed.decision)
      ? parsed.decision
      : 'consider';

    return {
      decision,
      score: this.clamp(Number(parsed.score ?? 50), 0, 100),
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      matchedWardrobeItems: Array.isArray(parsed.matchedWardrobeItems)
        ? parsed.matchedWardrobeItems.map((m: any) => ({
            id: String(m.id ?? ''),
            name: String(m.name ?? ''),
            reason: String(m.reason ?? ''),
          }))
        : [],
      possibleOutfits: Array.isArray(parsed.possibleOutfits)
        ? parsed.possibleOutfits.map(String)
        : [],
      duplicateRisk: VALID_RISK_LEVELS.includes(parsed.duplicateRisk)
        ? parsed.duplicateRisk
        : 'medium',
      idleRisk: VALID_RISK_LEVELS.includes(parsed.idleRisk)
        ? parsed.idleRisk
        : 'medium',
      betterColors: Array.isArray(parsed.betterColors)
        ? parsed.betterColors.map(String)
        : [],
      recommendedCategory: parsed.recommendedCategory
        ? String(parsed.recommendedCategory)
        : undefined,
      skipReasons: Array.isArray(parsed.skipReasons)
        ? parsed.skipReasons.map(String)
        : undefined,
    };
  }

  private clamp(value: number, min: number, max: number): number {
    const n = Math.round(value);
    return Math.max(min, Math.min(max, n));
  }
}
