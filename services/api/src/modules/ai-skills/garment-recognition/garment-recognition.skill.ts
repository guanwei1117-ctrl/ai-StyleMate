import { Injectable, Logger } from '@nestjs/common';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import { GARMENT_RECOGNITION_SYSTEM_PROMPT } from './prompts';
import { GarmentRecognitionInput, GarmentRecognitionResult } from './garment-recognition.dto';

const VALID_CATEGORIES = ['top', 'bottom', 'outerwear', 'dress', 'shoes', 'accessory'];

@Injectable()
export class GarmentRecognitionSkill {
  private readonly logger = new Logger(GarmentRecognitionSkill.name);

  constructor(private readonly llmFactory: LLMFactory) {}

  async recognize(input: GarmentRecognitionInput): Promise<GarmentRecognitionResult> {
    const messages: ChatMessage[] = [
      { role: 'system', content: GARMENT_RECOGNITION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: '请识别这件衣物并返回结构化 JSON 标签。',
        imageBase64: input.imageBase64,
      },
    ];

    this.logger.log('开始衣物识别 AI 调用');
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.3,
      maxTokens: 1200,
      timeoutMs: 60000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(`衣物识别完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model}`);
    return parsed;
  }

  private parseResponse(content: string): GarmentRecognitionResult {
    let jsonStr = content.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    const category = VALID_CATEGORIES.includes(String(parsed.category))
      ? String(parsed.category)
      : 'top';

    return {
      category,
      subCategory: String(parsed.subCategory ?? ''),
      color: String(parsed.color ?? '未知'),
      colorHex: String(parsed.colorHex ?? '#CCCCCC'),
      pattern: String(parsed.pattern ?? '纯色'),
      material: String(parsed.material ?? '未知'),
      season: Array.isArray(parsed.season) ? parsed.season.map(String) : [],
      styleTags: Array.isArray(parsed.styleTags) ? parsed.styleTags.map(String) : [],
      occasionTags: Array.isArray(parsed.occasionTags) ? parsed.occasionTags.map(String) : [],
      formalityScore: this.clamp(Number(parsed.formalityScore ?? 2), 1, 5),
      warmthScore: this.clamp(Number(parsed.warmthScore ?? 2), 1, 5),
      matchabilityScore: this.clamp(Number(parsed.matchabilityScore ?? 5), 1, 10),
      fitRisk: String(parsed.fitRisk ?? '无'),
      matchColors: Array.isArray(parsed.matchColors) ? parsed.matchColors.map(String) : [],
      matchCategories: Array.isArray(parsed.matchCategories)
        ? parsed.matchCategories.map(String)
        : [],
      aiSummary: String(parsed.aiSummary ?? ''),
    };
  }

  private clamp(value: number, min: number, max: number): number {
    const n = Math.round(value);
    return Math.max(min, Math.min(max, n));
  }
}
