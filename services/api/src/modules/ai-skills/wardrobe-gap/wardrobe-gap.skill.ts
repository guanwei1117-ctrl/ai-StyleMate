import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildWardrobeGapPrompt } from './prompts';
import {
  WardrobeGapInput,
  WardrobeGapResult,
  WardrobeGapItem,
} from './wardrobe-gap.dto';

const VALID_CATEGORIES = ['top', 'outerwear', 'bottom', 'dress', 'shoes', 'bag', 'hat', 'accessory'];

@Injectable()
export class WardrobeGapSkill {
  private readonly logger = new Logger(WardrobeGapSkill.name);

  constructor(private readonly llmFactory: LLMFactory) {}

  /**
   * 个性化衣橱缺口分析
   */
  async analyze(input: WardrobeGapInput): Promise<WardrobeGapResult> {
    const systemPrompt = buildWardrobeGapPrompt(input);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请分析我的衣橱缺口，告诉我该先买什么。' },
    ];

    this.logger.log(
      `衣橱缺口分析 AI 调用 | 单品数: ${input.wardrobeItems.length} | 季节: ${input.season}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.4,
      maxTokens: 2000,
      timeoutMs: 90000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(
      `衣橱缺口分析完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model} | 缺口数: ${parsed.gaps.length}`,
    );

    return { ...parsed, personalized: true };
  }

  private parseResponse(content: string): Omit<WardrobeGapResult, 'personalized'> {
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

    const rawGaps: unknown[] = Array.isArray(parsed.gaps) ? parsed.gaps : [];
    const gaps: WardrobeGapItem[] = rawGaps
      .map((raw): WardrobeGapItem => {
        const g = raw as Record<string, any>;
        return {
          category: VALID_CATEGORIES.includes(String(g.category)) ? String(g.category) : 'top',
          current: this.toInt(g.current),
          recommended: this.toInt(g.recommended),
          missing: Math.max(0, this.toInt(g.missing)),
          priority: [1, 2, 3].includes(Number(g.priority)) ? Number(g.priority) : 2,
          reason: String(g.reason ?? ''),
          suggestion: {
            subCategory: String(g.suggestion?.subCategory ?? ''),
            color: String(g.suggestion?.color ?? ''),
            styleTags: Array.isArray(g.suggestion?.styleTags)
              ? (g.suggestion.styleTags as unknown[]).map(String)
              : [],
            budgetRange: String(g.suggestion?.budgetRange ?? ''),
          },
        };
      })
      .sort((a, b) => a.priority - b.priority);

    return {
      summary: String(parsed.summary ?? ''),
      gaps,
    };
  }

  private toInt(value: unknown): number {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? n : 0;
  }
}
