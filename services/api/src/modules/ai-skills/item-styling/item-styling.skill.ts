import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildItemStylingPrompt } from './prompts';
import {
  ItemStylingInput,
  ItemStylingResult,
  ItemStylingPlan,
  ItemStylingSlotItem,
} from './item-styling.dto';

const VALID_TYPES = ['safe', 'flattering', 'vibe'];
const SLOT_KEYS = ['hat', 'top', 'bottom', 'outerwear', 'shoes', 'bag', 'accessory'] as const;

@Injectable()
export class ItemStylingSkill {
  private readonly logger = new Logger(ItemStylingSkill.name);

  constructor(private readonly llmFactory: LLMFactory) {}

  /**
   * 以焦点单品为核心生成 3 套搭配方案
   */
  async style(input: ItemStylingInput): Promise<ItemStylingResult> {
    const systemPrompt = buildItemStylingPrompt(input);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请围绕「${input.focusItem.color} ${input.focusItem.subCategory || input.focusItem.category}」给我 3 套搭配方案。` },
    ];

    this.logger.log(
      `单品搭配 AI 调用 | 焦点单品: ${input.focusItem.id} | 衣橱单品: ${input.wardrobeItems.length} | 场合: ${input.occasion ?? '不限'}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.6,
      maxTokens: 3000,
      timeoutMs: 90000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(
      `单品搭配完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model} | 方案数: ${parsed.plans.length}`,
    );

    return parsed;
  }

  private parseResponse(content: string): ItemStylingResult {
    let jsonStr = content.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new BadRequestException('AI 返回内容解析失败，请稍后重试');
    }

    const plans: ItemStylingPlan[] = Array.isArray(parsed.plans)
      ? parsed.plans.map((p: any) => {
          const plan: any = {
            type: (VALID_TYPES.includes(String(p.type)) ? String(p.type) : 'safe') as ItemStylingPlan['type'],
            title: String(p.title ?? ''),
            reason: String(p.reason ?? ''),
            scene: String(p.scene ?? ''),
            riskWarning: String(p.riskWarning ?? '无'),
            score: this.clamp(Number(p.score ?? 70), 1, 100),
          };
          for (const key of SLOT_KEYS) {
            plan[key] = this.parseSlotItem(p[key]);
          }
          return plan as ItemStylingPlan;
        })
      : [];

    return {
      focusItemName: String(parsed.focusItemName ?? ''),
      note: String(parsed.note ?? ''),
      plans,
    };
  }

  private parseSlotItem(item: any): ItemStylingSlotItem | null {
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
