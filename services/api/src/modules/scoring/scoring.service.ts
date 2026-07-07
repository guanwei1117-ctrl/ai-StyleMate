import { Injectable, Logger } from '@nestjs/common';
import { LLMFactory } from './llm/llm-factory';
import { buildSystemPrompt } from './prompts/system-prompts';
import { getBloggerById } from './bloggers/blogger-profiles';
import { buildDimensionsPrompt } from './prompts/scoring-dimensions';
import {
  EvaluateOutfitResponse,
  DimensionScore,
  ScoringDimensionKey,
} from '@stylemate/shared';

const REQUIRED_DIMENSION_KEYS: ScoringDimensionKey[] = [
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
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly llmFactory: LLMFactory) {}

  /**
   * 对穿搭照片进行多维度评分
   *
   * @param imageBase64 照片 base64 字符串
   * @param bloggerId 博主 ID
   * @param userContext 用户上下文（体型、性别等）
   */
  async evaluateOutfit(
    imageBase64: string,
    bloggerId: string,
    userContext?: { bodyShape?: string; gender?: string; height?: number; weight?: number; occasion?: string },
  ): Promise<EvaluateOutfitResponse> {
    // 1. 获取博主档案
    const blogger = getBloggerById(bloggerId);
    if (!blogger) {
      throw new Error(`博主不存在: ${bloggerId}`);
    }

    // 2. 构建用户上下文描述
    const userContextStr = userContext
      ? `- 性别：${userContext.gender ?? '未知'}\n- 体型：${userContext.bodyShape ?? '未知'}\n- 身高：${userContext.height ? userContext.height + 'cm' : '未知'}\n- 体重：${userContext.weight ? userContext.weight + 'kg' : '未知'}\n- 场合：${userContext.occasion ?? '日常'}`
      : '';

    // 3. 构建 System Prompt
    const systemPrompt = buildSystemPrompt(blogger, userContextStr);

    // 4. 构建 User Message（含图片）
    const userMessage = this.buildUserMessage(imageBase64, userContext?.occasion);

    // 5. 调用 LLM
    this.logger.log(`开始评分 | 博主: ${blogger.name} | 上下文: ${userContextStr}`);
    const startTime = Date.now();

    const response = await this.llmFactory.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0.7, maxTokens: 2048, timeoutMs: 30000 },
    );

    const elapsed = Date.now() - startTime;
    this.logger.log(`评分完成 | 耗时 ${elapsed}ms | 模型: ${response.model}`);

    // 6. 解析 JSON 结果
    const parsed = this.parseResponse(response.content, blogger.name);

    return {
      bloggerName: blogger.name,
      bloggerId: blogger.id,
      greeting: parsed.greeting,
      overallComment: parsed.overallComment,
      dimensions: this.validateDimensions(parsed.dimensions),
      itemComments: parsed.itemComments || [],
      improvements: parsed.improvements || [],
    };
  }

  /**
   * 构建 User Message，附上图片
   */
  private buildUserMessage(imageBase64: string, occasion?: string): string {
    const occasionHint = occasion
      ? `\n穿搭场合：${occasion}`
      : '\n穿搭场合：日常通勤/出街';

    return `请分析这套穿搭。${occasionHint}

注意：你要像一个懂穿搭的朋友一样评价，直接、不废话、给真实建议。严格按照 JSON 格式输出结果。`;
  }

  /**
   * 解析 LLM 返回的 JSON
   */
  private parseResponse(content: string, bloggerName: string): {
    greeting: string;
    overallComment: string;
    dimensions: DimensionScore[];
    itemComments: string[];
    improvements: string[];
  } {
    // 尝试从 markdown 代码块中提取 JSON
    let jsonStr = content;

    const jsonBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1];
    }

    // 清理可能的控制字符
    jsonStr = jsonStr.trim();

    const parsed = JSON.parse(jsonStr);

    // 兜底：如果 LLM 返回不符合预期
    if (!parsed.dimensions || !Array.isArray(parsed.dimensions)) {
      this.logger.warn('LLM 返回的 dimensions 格式不正确，使用默认值');
      parsed.dimensions = REQUIRED_DIMENSION_KEYS.map((key) => ({
        key,
        score: 70,
        comment: 'AI 评分异常，请稍后重试',
      }));
    }

    return {
      greeting: parsed.greeting || `嘿！让我看看～`,
      overallComment:
        parsed.overallComment || `整体搭配不错，但有些细节可以优化。`,
      dimensions: parsed.dimensions,
      itemComments: parsed.itemComments || [],
      improvements: parsed.improvements || [],
    };
  }

  /**
   * 校验并补全维度评分
   */
  private validateDimensions(dimensions: DimensionScore[]): DimensionScore[] {
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
      // 缺失维度兜底
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
