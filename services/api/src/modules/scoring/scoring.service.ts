import { Injectable, Logger, Optional } from '@nestjs/common';
import { LLMFactory } from '../llm/llm-factory';
import { STYLE_PROFILE_TEMPERATURE } from './scoring-settings';
import { ChatMessage } from '../llm/llm-provider.interface';
import { buildSystemPrompt } from './prompts/system-prompts';
import { StructuredOutfitSkill } from '../ai-skills/structured-outfit/structured-outfit.skill';
import { StructuredOutfitResult } from '../ai-skills/structured-outfit/structured-outfit.dto';
import { StyleChatSkill } from '../ai-skills/style-chat/style-chat.skill';
import {
  StyleChatInput,
  StyleChatResult,
} from '../ai-skills/style-chat/style-chat.dto';
import { MemoryService } from '../memory/memory.service';
import { ResponseParserService } from './response-parser.service';
import { PromptBuilderService } from './prompt-builder.service';
import { AiResponseCache } from './ai-response-cache';
import { EvaluateOutfitResponse } from '@stylemate/shared';
import { AnalyzeStyleProfileRequestDto } from './dto/analyze-style-profile.dto';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly structuredOutfitSkill: StructuredOutfitSkill,
    private readonly styleChatSkill: StyleChatSkill,
    private readonly responseParser: ResponseParserService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly aiCache: AiResponseCache,
    @Optional() private readonly memoryService: MemoryService,
  ) {}

  /**
   * 引导式测评对话：返回 AI 的下一个问题或最终总结
   */
  async chatStyle(input: StyleChatInput): Promise<StyleChatResult> {
    return this.styleChatSkill.chat(input);
  }

  async analyzeStyleProfile(dto: AnalyzeStyleProfileRequestDto) {
    const hasFaceImage = !!dto.faceImageBase64;
    const hasFullBodyImage = !!dto.fullBodyImageBase64;
    const systemPrompt = this.promptBuilder.buildStyleProfileSystemPrompt();
    const profilePrompt = this.promptBuilder.buildStyleProfileUserPrompt(dto);

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

    const parsed = this.responseParser.parseStyleProfileResponse(response.content);
    this.logger.log(`AI 风格档案分析完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model}`);

    // 自动将 AI 分析结果写入长期记忆（best-effort，不影响主流程）
    if (dto.userId && parsed.memoryMerge && this.memoryService) {
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
   */
  async evaluateOutfit(
    imageBase64: string,
    userContext?: { bodyShape?: string; gender?: string; height?: number; weight?: number; occasion?: string },
    userId?: string,
  ): Promise<EvaluateOutfitResponse> {
    // 构建用户上下文字符串（基础画像 + 长期记忆）
    let userContextStr = userContext
      ? `- 性别：${userContext.gender ?? '未知'}\n- 体型：${userContext.bodyShape ?? '未知'}\n- 身高：${userContext.height ? userContext.height + 'cm' : '未知'}\n- 体重：${userContext.weight ? userContext.weight + 'kg' : '未知'}\n- 场合：${userContext.occasion ?? '日常'}`
      : '';

    // 读取用户长期记忆并注入 prompt（best-effort，不影响主流程）
    if (userId && this.memoryService) {
      try {
        const memory = await this.memoryService.buildAIContext(userId, 'outfit_scoring');
        const parts: string[] = [];
        const p = memory.styleProfile;
        if (p?.suitableStyles?.length) parts.push(`适合风格：${p.suitableStyles.join('、')}`);
        if (p?.likedStyles?.length) parts.push(`偏好风格：${p.likedStyles.join('、')}`);
        if (p?.dislikedStyles?.length) parts.push(`避开风格：${p.dislikedStyles.join('、')}`);
        if (p?.preferredColors?.length) parts.push(`偏好颜色：${p.preferredColors.join('、')}`);
        if (p?.dislikedColors?.length) parts.push(`避开颜色：${p.dislikedColors.join('、')}`);
        if (p?.bodyConcerns?.length) parts.push(`身材顾虑：${p.bodyConcerns.join('、')}`);
        if (p?.dressGoals?.length) parts.push(`穿搭目标：${p.dressGoals.join('、')}`);
        if (p?.commonOccasions?.length) parts.push(`日常场景：${p.commonOccasions.join('、')}`);
        if (memory.memorySummary) parts.push(`记忆总结：${memory.memorySummary}`);
        if (memory.recentFeedbackSummary) parts.push(`近期反馈：${memory.recentFeedbackSummary}`);
        if (parts.length > 0) {
          userContextStr = `${userContextStr}\n- 用户长期记忆：${parts.join('；')}`;
        }
        this.logger.log(`评分已加载用户记忆 | userId: ${userId}`);
      } catch (err) {
        this.logger.warn(`读取用户记忆失败（不影响评分）: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const systemPrompt = buildSystemPrompt(userContextStr);
    const userMessage = this.promptBuilder.buildUserMessage(userContext?.occasion);

    // 检查缓存（key 包含 userId 防止跨用户泄漏）
    const cacheContext = `evaluate:${userId ?? 'anon'}:${userContext?.occasion ?? 'default'}`;
    const cached = this.aiCache.get<EvaluateOutfitResponse>(imageBase64, cacheContext);
    if (cached) {
      this.logger.log('评分缓存命中');
      return cached;
    }

    this.logger.log('开始评分 | 含图片: 是');
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

    const parsed = this.responseParser.parseEvaluateResponse(response.content);

    // 并行调用结构化分析 skill
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

    const result: EvaluateOutfitResponse = {
      greeting: parsed.greeting,
      overallComment: parsed.overallComment,
      dimensions: this.responseParser.validateDimensions(parsed.dimensions),
      itemComments: parsed.itemComments || [],
      improvements: parsed.improvements || [],
      structured,
    };

    // 缓存结果
    this.aiCache.set(imageBase64, cacheContext, result);

    // 评分完成后自动更新记忆（best-effort，不阻塞响应）
    if (userId && this.memoryService) {
      try {
        await this.memoryService.autoMergeFromBehavior(userId, {
          action: '上传了穿搭照进行 AI 评分诊断',
          occasion: userContext?.occasion,
          outfitDescription: parsed.overallComment,
        });
      } catch {
        // 静默处理
      }
    }

    return result;
  }
}
