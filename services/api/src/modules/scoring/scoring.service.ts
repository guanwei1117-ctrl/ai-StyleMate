import { Injectable, Logger } from '@nestjs/common';
import { LLMFactory } from '../llm/llm-factory';
import { STYLE_PROFILE_TEMPERATURE } from './scoring-settings';
import { ChatMessage } from '../llm/llm-provider.interface';
import { buildSystemPrompt } from './prompts/system-prompts';
import { getBloggerById } from './bloggers/blogger-profiles';
import { buildDimensionsPrompt } from './prompts/scoring-dimensions';
import { StructuredOutfitSkill } from '../ai-skills/structured-outfit/structured-outfit.skill';
import { StructuredOutfitResult } from '../ai-skills/structured-outfit/structured-outfit.dto';
import { MemoryService } from '../memory/memory.service';
import {
  EvaluateOutfitResponse,
  DimensionScore,
  ScoringDimensionKey,
  BloggerPersona,
} from '@stylemate/shared';
import { AnalyzeStyleProfileRequestDto } from './dto/analyze-style-profile.dto';

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

  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly structuredOutfitSkill: StructuredOutfitSkill,
    private readonly memoryService: MemoryService,
  ) {}

  async analyzeStyleProfile(dto: AnalyzeStyleProfileRequestDto) {
    const hasFaceImage = !!dto.faceImageBase64;
    const hasFullBodyImage = !!dto.fullBodyImageBase64;
    const blogger = dto.bloggerId ? getBloggerById(dto.bloggerId) : undefined;
    const systemPrompt = this.buildStyleProfileSystemPrompt(blogger);
    const profilePrompt = this.buildStyleProfileUserPrompt(dto);

    const messages: ChatMessage[] = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: `${profilePrompt}\n\n请先结合文字与候选风格做整体判断。`,
      },
    ];

    if (hasFaceImage) {
      messages.push({
        role: 'user' as const,
        content: '这是用户上传的正脸照。请只分析穿搭相关的视觉信息，例如脸部量感、气质、肤色倾向、五官给人的风格方向，不要做身份识别。',
        imageBase64: dto.faceImageBase64,
      });
    }

    if (hasFullBodyImage) {
      messages.push({
        role: 'user' as const,
        content: '这是用户上传的全身照。请分析身材比例、视觉重心、肩腰胯比例、适合的廓形和需要避开的版型。',
        imageBase64: dto.fullBodyImageBase64,
      });
    }

    this.logger.log(
      `开始 AI 风格档案分析 | 正脸照: ${hasFaceImage ? '是' : '否'} | 全身照: ${hasFullBodyImage ? '是' : '否'} | 候选: ${dto.candidates.length}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: STYLE_PROFILE_TEMPERATURE,
      maxTokens: 2600,
      timeoutMs: 90000,
    });

    const parsed = this.parseStyleProfileResponse(response.content);
    this.logger.log(`AI 风格档案分析完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model}`);

    // 自动将 AI 分析结果写入长期记忆（best-effort，不影响主流程）
    if (dto.userId && parsed.memoryMerge) {
      try {
        await this.memoryService.updateStyleProfile(dto.userId, parsed.memoryMerge);
        this.logger.log(`已自动更新用户 ${dto.userId} 的长期记忆`);
      } catch (err) {
        this.logger.warn(`自动写入记忆失败（不影响分析结果）: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return {
      aiEnabled: true,
      providerModel: response.model,
      ...parsed,
    };
  }

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

    // 4. 构建 User Message（含图片）—— 图片真正传给 LLM
    const userMessage = this.buildUserMessage(imageBase64, userContext?.occasion);

    // 5. 调用 LLM（图片放在 user message 的 imageBase64 字段）
    this.logger.log(`开始评分 | 博主: ${blogger.name} | 含图片: 是`);
    const startTime = Date.now();

    const response = await this.llmFactory.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage, imageBase64 },
      ],
      { temperature: 0.7, maxTokens: 2048, timeoutMs: 60000 },
    );

    const elapsed = Date.now() - startTime;
    this.logger.log(`评分完成 | 耗时 ${elapsed}ms | 模型: ${response.model}`);

    // 6. 解析 JSON 结果
    const parsed = this.parseResponse(response.content, blogger.name);

    // 7. 并行调用结构化分析 skill（复用同一张图片，生成可被数字衣柜/推荐复用的结构化结果）
    let structured: StructuredOutfitResult | undefined;
    try {
      structured = await this.structuredOutfitSkill.analyze({
        imageBase64,
        occasion: userContext?.occasion,
      });
    } catch (err) {
      this.logger.warn(
        `结构化穿搭分析失败，仅返回评分结果: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return {
      bloggerName: blogger.name,
      bloggerId: blogger.id,
      greeting: parsed.greeting,
      overallComment: parsed.overallComment,
      dimensions: this.validateDimensions(parsed.dimensions),
      itemComments: parsed.itemComments || [],
      improvements: parsed.improvements || [],
      structured,
    };
  }

  private buildStyleProfileSystemPrompt(blogger?: BloggerPersona): string {
    const bloggerToneSection = blogger
      ? `\n\n## 语言风格（用户选择的博主风格）
你将使用以下博主的说话风格来撰写报告，但分析逻辑保持专业客观：
- 博主：${blogger.name}（${blogger.platform}）
- 风格签名：${blogger.styleSignature}
- 人设：${blogger.toneProfile.personality}
- 夸赞方式：${blogger.toneProfile.praiseStyle}
- 批评方式：${blogger.toneProfile.critiqueStyle}
- 标志性用语：${blogger.toneProfile.signaturePhrases.join('、')}
请让 summary、visualAnalysis、intentAnalysis.cleanedStatement、avoidanceAdvice、nextActions 的语言风格贴近该博主人设，但 reasons/notices 保持简洁事实。`
      : '';

    return `你是 StyleMate 的专业形象顾问，服务 16-25 岁年轻用户。你的任务是把用户照片、基础画像、自述想法和本地候选风格，整合成一个真实可执行的风格档案。

表达要求：
- 专业但年轻化，不油腻，不营销。
- 先给简洁结论，再展开原因。
- 可以明确指出"不适合"，但语气保持尊重，给替代方案。
- 不要声称识别了身份、年龄、种族或敏感属性；只分析穿搭相关视觉特征。
- 如果照片缺失，就说明该部分依据文字和基础画像判断。${bloggerToneSection}

必须只返回 JSON，不要 markdown，不要解释 JSON 外的文字。结构如下：
{
  "summary": "一句话核心结论",
  "visualAnalysis": {
    "face": "正脸照相关观察；没有照片则说明未提供",
    "body": "全身照/身材比例相关观察；没有照片则说明未提供",
    "confidence": 0.0
  },
  "intentAnalysis": {
    "likedKeywords": ["..."],
    "dislikedKeywords": ["..."],
    "desiredImpression": ["..."],
    "scenes": ["..."],
    "constraints": ["..."],
    "cleanedStatement": "把用户凌乱自述整理成适合推荐系统使用的一段话"
  },
  "recommendedStyles": [
    {
      "styleId": "候选风格 ID，只能来自候选列表",
      "score": 0,
      "reasons": ["为什么适合，2-4条"],
      "notices": ["需要注意或不适合的点，1-3条"]
    }
  ],
  "avoidanceAdvice": ["明确不建议的版型/元素/搭法"],
  "nextActions": ["下一步可执行建议"],
  "memoryMerge": {
    "suitableStyles": ["适合的风格 ID，仅限候选中的 styleId"],
    "likedStyles": ["用户主观喜欢的风格中文标签"],
    "dislikedStyles": ["用户不喜欢的风格中文标签"],
    "preferredColors": ["推荐的颜色，中文色名"],
    "dislikedColors": ["不建议的颜色"],
    "bodyConcerns": ["身材顾虑，如 显胯宽、腿型修饰"],
    "dressGoals": ["穿搭目标，如 显高、通勤得体"],
    "commonOccasions": ["日常场景，如 通勤、周末出街"],
    "avoidRules": [{"rule": "避免的穿搭规则", "source": "ai:style_analysis", "weight": 1}]
  }
}`;
  }

  private buildStyleProfileUserPrompt(dto: AnalyzeStyleProfileRequestDto): string {
    const profile = dto.profile;
    const candidates = dto.candidates.slice(0, 12).map((candidate) => ({
      styleId: candidate.styleId,
      styleName: candidate.styleName,
      category: candidate.category,
      localScore: candidate.localScore,
      description: candidate.description,
      keyItems: candidate.keyItems,
      localReasons: candidate.matchReasons,
      dimension: candidate.dimension,
      dimensionLabel: candidate.dimensionLabel,
      pillars: candidate.pillars,
      breakdown: candidate.breakdown,
      philosophy: candidate.philosophy,
      difficulty: candidate.difficulty,
      silhouette: candidate.silhouette,
      colorPalette: candidate.colorPalette,
    }));

    return `用户填写信息如下，请把性别、身高体重、三围、职业、日常场景、自定义场景、城市气候、预算、目标、偏好和自述全部纳入判断：
${JSON.stringify(profile, null, 2)}

风格库候选如下。每个候选包含本地规则分数、三支柱分、风格维度、理念、难度、廓形、核心单品、颜色和本地匹配理由。请综合用户填写信息 + 候选风格库信息，重排和选择最适合的风格，不要编造不存在的 styleId：
${JSON.stringify(candidates, null, 2)}`;
  }

  private parseStyleProfileResponse(content: string) {
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
  private parseMemoryMerge(raw: any) {
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
