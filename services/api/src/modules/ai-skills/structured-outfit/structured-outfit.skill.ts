import { Injectable, Logger, Optional } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { buildStructuredOutfitPrompt } from './prompts';
import { RagService } from '../../rag/rag.service';
import {
  StructuredOutfitInput,
  StructuredOutfitItem,
  StructuredOutfitResult,
} from './structured-outfit.dto';

const VALID_TYPES = ['top', 'outerwear', 'bottom', 'dress', 'shoes', 'bag', 'hat', 'accessory'];

@Injectable()
export class StructuredOutfitSkill {
  private readonly logger = new Logger(StructuredOutfitSkill.name);

  constructor(
    private readonly llmFactory: LLMFactory,
    // M9：接 RAG（让图像分析输出的风格/场合标签更专业）
    @Optional() private readonly ragService?: RagService,
  ) {}

  async analyze(input: StructuredOutfitInput): Promise<StructuredOutfitResult> {
    const knowledge = await this.retrieveStyleKnowledge(input.occasion);
    const systemPrompt = buildStructuredOutfitPrompt(
      input.occasion,
      knowledge,
      input.coachMode,
      input.withBbox,
    );
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: '请分析这套穿搭并返回结构化 JSON。',
        imageBase64: input.imageBase64,
      },
    ];

    this.logger.log('开始结构化穿搭分析 AI 调用');
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.5,
      maxTokens: 1800,
      timeoutMs: 60000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(
      `结构化穿搭分析完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model}`,
    );
    return parsed;
  }

  /**
   * M9：检索风格百科 + 场合知识（让图像分析的 style / scene 标签更准）
   * - @Optional + try/catch 三层降级
   */
  private async retrieveStyleKnowledge(occasion?: string): Promise<string> {
    if (!this.ragService) {
      this.logger.debug('RAG 未启用，跳过结构化分析知识检索');
      return '';
    }
    const query = occasion ? `${occasion} 穿搭风格分析` : '穿搭风格分析';
    try {
      const text = await this.ragService.augmentWithContext(query, {
        domains: ['style_encyclopedia', 'occasion'],
        topK: 2,
      });
      if (text) {
        this.logger.log(`structured-outfit RAG 命中`);
      }
      return text;
    } catch (err) {
      this.logger.warn(
        `structured-outfit RAG 检索失败，降级: ${err instanceof Error ? err.message : String(err)}`,
      );
      return '';
    }
  }

  private parseResponse(content: string): StructuredOutfitResult {
    let jsonStr = content.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    const items: StructuredOutfitItem[] = Array.isArray(parsed.items)
      ? parsed.items.map((item: any) => ({
          type: (VALID_TYPES.includes(String(item.type)) ? String(item.type) : 'top') as StructuredOutfitItem['type'],
          name: String(item.name ?? ''),
          color: String(item.color ?? ''),
          style: Array.isArray(item.style) ? item.style.map(String) : [],
          season: Array.isArray(item.season) ? item.season.map(String) : [],
          formality: this.clamp(Number(item.formality ?? 3), 1, 5),
          matchability: this.clamp(Number(item.matchability ?? 5), 1, 10),
          bbox:
            Array.isArray(item.bbox) && item.bbox.length === 4
              ? (item.bbox.map(Number) as [number, number, number, number])
              : undefined,
        }))
      : [];

    return {
      items,
      body_suggestions: Array.isArray(parsed.body_suggestions)
        ? parsed.body_suggestions.map(String)
        : [],
      style_tags: Array.isArray(parsed.style_tags) ? parsed.style_tags.map(String) : [],
      problems: Array.isArray(parsed.problems) ? parsed.problems.map(String) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
    };
  }

  private clamp(value: number, min: number, max: number): number {
    const n = Math.round(value);
    return Math.max(min, Math.min(max, n));
  }
}
