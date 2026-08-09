import { Injectable, Logger } from '@nestjs/common';
import { DimensionScore, ScoringDimensionKey } from '@stylemate/shared';

export const REQUIRED_DIMENSION_KEYS: ScoringDimensionKey[] = [
  'proportion',
  'color',
  'occasion',
  'coherence',
  'trend',
  'creativity',
  'bodyFit',
  'practicality',
];

@Injectable()
export class ResponseParserService {
  private readonly logger = new Logger(ResponseParserService.name);

  /**
   * 解析 LLM 返回的穿搭评分 JSON
   */
  parseEvaluateResponse(content: string): {
    greeting: string;
    overallComment: string;
    dimensions: DimensionScore[];
    itemComments: string[];
    improvements: string[];
  } {
    let jsonStr = content;

    const jsonBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1];
    }

    jsonStr = jsonStr.trim();
    const parsed = JSON.parse(jsonStr);

    if (!parsed.dimensions || !Array.isArray(parsed.dimensions)) {
      this.logger.warn('LLM 返回的 dimensions 格式不正确，使用默认值');
      parsed.dimensions = REQUIRED_DIMENSION_KEYS.map((key) => ({
        key,
        score: 70,
        comment: 'AI 评分异常，请稍后重试',
      }));
    }

    return {
      greeting: parsed.greeting || '嘿！让我看看～',
      overallComment: parsed.overallComment || '整体搭配不错，但有些细节可以优化。',
      dimensions: parsed.dimensions,
      itemComments: parsed.itemComments || [],
      improvements: parsed.improvements || [],
    };
  }

  /**
   * 解析 LLM 返回的风格档案 JSON
   */
  parseStyleProfileResponse(content: string) {
    let jsonStr = content.trim();
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    const recommendedStyles = Array.isArray(parsed.recommendedStyles)
      ? parsed.recommendedStyles.map((item: any) => ({
          styleId: String(item.styleId ?? ''),
          score: Math.max(0, Math.min(100, Math.round(Number(item.score ?? 70)))),
          reasons: Array.isArray(item.reasons) ? item.reasons.map(String).slice(0, 4) : [],
          notices: Array.isArray(item.notices) ? item.notices.map(String).slice(0, 3) : [],
        })).filter((item: { styleId: string }) => item.styleId)
      : [];

    return {
      summary: String(parsed.summary ?? '已完成 AI 风格分析。'),
      visualAnalysis: {
        face: String(parsed.visualAnalysis?.face ?? '未提供正脸照，暂不做脸部视觉分析。'),
        body: String(parsed.visualAnalysis?.body ?? '未提供全身照，暂不做全身比例视觉分析。'),
        confidence: Number(parsed.visualAnalysis?.confidence ?? 0.6),
      },
      intentAnalysis: {
        likedKeywords: Array.isArray(parsed.intentAnalysis?.likedKeywords) ? parsed.intentAnalysis.likedKeywords.map(String) : [],
        dislikedKeywords: Array.isArray(parsed.intentAnalysis?.dislikedKeywords) ? parsed.intentAnalysis.dislikedKeywords.map(String) : [],
        desiredImpression: Array.isArray(parsed.intentAnalysis?.desiredImpression) ? parsed.intentAnalysis.desiredImpression.map(String) : [],
        scenes: Array.isArray(parsed.intentAnalysis?.scenes) ? parsed.intentAnalysis.scenes.map(String) : [],
        constraints: Array.isArray(parsed.intentAnalysis?.constraints) ? parsed.intentAnalysis.constraints.map(String) : [],
        cleanedStatement: String(parsed.intentAnalysis?.cleanedStatement ?? ''),
      },
      recommendedStyles,
      avoidanceAdvice: Array.isArray(parsed.avoidanceAdvice) ? parsed.avoidanceAdvice.map(String).slice(0, 6) : [],
      nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions.map(String).slice(0, 6) : [],
      memoryMerge: this.parseMemoryMerge(parsed.memoryMerge),
    };
  }

  /** 解析并清洗 AI 返回的 memoryMerge 字段，确保类型安全 */
  parseMemoryMerge(raw: any) {
    if (!raw || typeof raw !== 'object') return null;
    const arr = (v: unknown) => Array.isArray(v) ? v.map(String).filter(Boolean) : [];
    const rules = (v: unknown) => Array.isArray(v)
      ? v.filter((r: any) => r && typeof r.rule === 'string').map((r: any) => ({
          rule: String(r.rule),
          source: String(r.source || 'ai:style_analysis'),
          weight: Math.max(0, Math.min(10, Number(r.weight ?? 1))),
        }))
      : [];
    return {
      suitableStyles: arr(raw.suitableStyles),
      likedStyles: arr(raw.likedStyles),
      dislikedStyles: arr(raw.dislikedStyles),
      preferredColors: arr(raw.preferredColors),
      dislikedColors: arr(raw.dislikedColors),
      bodyConcerns: arr(raw.bodyConcerns),
      dressGoals: arr(raw.dressGoals),
      commonOccasions: arr(raw.commonOccasions),
      avoidRules: rules(raw.avoidRules),
    };
  }

  /**
   * 校验并补全维度评分
   */
  validateDimensions(dimensions: DimensionScore[]): DimensionScore[] {
    return REQUIRED_DIMENSION_KEYS.map((key) => {
      const existing = dimensions.find((d) => d.key === key);
      if (existing && typeof existing.score === 'number') {
        return {
          key,
          label: existing.label || this.getLabel(key),
          score: Math.max(0, Math.min(100, Math.round(existing.score))),
          comment: existing.comment || '暂无评价',
        };
      }
      return {
        key,
        label: this.getLabel(key),
        score: 70,
        comment: 'AI 未返回该维度评分',
      };
    });
  }

  private getLabel(key: ScoringDimensionKey): string {
    const labels: Record<ScoringDimensionKey, string> = {
      proportion: '比例与廓形',
      color: '色彩协调',
      occasion: '场合适配',
      coherence: '风格一致性',
      trend: '潮流度',
      creativity: '创意度',
      bodyFit: '体型适配',
      practicality: '实穿性',
    };
    return labels[key] || key;
  }
}
