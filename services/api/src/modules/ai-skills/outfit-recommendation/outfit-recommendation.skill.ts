import { Injectable, Logger, Optional } from '@nestjs/common';
import { RagService } from '../../rag/rag.service';
import { LLMFactory } from '../../llm/llm-factory';
import { ChatMessage } from '../../llm/llm-provider.interface';
import {
  buildOutfitRecommendationPrompt,
  buildStarterOutfitPrompt,
} from './prompts';
import { StylingRulesEngine } from './styling-rules.engine';
import { applyWardrobePreFilter } from './wardrobe-pre-filter';
import {
  OutfitRecommendationInput,
  OutfitRecommendationResult,
  OutfitRecommendationPlan,
} from './outfit-recommendation.dto';

const VALID_TYPES = ['safe', 'flattering', 'vibe'];

@Injectable()
export class OutfitRecommendationSkill {
  private readonly logger = new Logger(OutfitRecommendationSkill.name);
  private readonly rulesEngine = new StylingRulesEngine();

  constructor(
    private readonly llmFactory: LLMFactory,
    // @Optional：RagModule 仅在 ENABLE_DB=true 时加载；未加载时 ragService 为 undefined，走降级
    @Optional() private readonly ragService?: RagService,
  ) {}

  async recommend(input: OutfitRecommendationInput): Promise<OutfitRecommendationResult> {
    // 空衣橱 → 起步方案：给出建议购买的单品组合，而不是报错挡人
    if (input.wardrobeItems.length === 0) {
      return this.recommendStarter(input);
    }

    // ====== 规则引擎预分析 (40% 权重) ======
    const rulesOutput = this.rulesEngine.evaluate({
      items: input.wardrobeItems,
      weather: {
        temperature: input.weather.temperature,
        isRaining: input.weather.isRaining,
        windSpeed: input.weather.windSpeed,
      },
      occasion: input.occasion,
      styleGoal: input.styleGoal,
      bodyShape: undefined, // 体型数据从用户基础信息获取
      skinTone: undefined,  // 肤色数据从用户基础信息获取
    });

    this.logger.log(
      `规则引擎分析完成 | 单品数: ${input.wardrobeItems.length} | 排除: ${rulesOutput.excludedItems.length} | 品类: ${rulesOutput.topByCategory.size}`,
    );

    // ====== M3：衣橱前置过滤（500 → 20） ======
    // 目的：省 token + 提速 + 提质。规则引擎看全部衣橱（精细打分），
    // 但 AI prompt 只看"今日相关"的 top 20 件。
    const excludedIds = new Set(rulesOutput.excludedItems.map((e) => e.itemId));
    const preFilterResult = applyWardrobePreFilter(input.wardrobeItems, {
      weather: input.weather,
      occasion: input.occasion,
      styleGoal: input.styleGoal,
      memorySnapshot: input.memoryContext?.snapshot ?? undefined,
      excludedItemIds: excludedIds,
      maxItems: 20,
    });
    this.logger.log(`衣橱预过滤: ${preFilterResult.summary}`);
    // 用 filteredInput 注入 prompt；规则引擎评分仍用原始 input（不影响现有评分逻辑）
    const filteredInput: OutfitRecommendationInput = {
      ...input,
      wardrobeItems: preFilterResult.items,
    };

    // ====== AI 推荐 (40% 权重) ======
    const { text: knowledgeText, titles: knowledgeTitles } = await this.retrieveKnowledge(input);
    const systemPrompt = buildOutfitRecommendationPrompt(filteredInput, rulesOutput.rulesSummary, knowledgeText);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请基于我的衣橱和今天的情况，在规则引擎建议的基础上推荐 3 套穿搭方案。' },
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

    // ====== 合并评分 (4:4:2) ======
    for (const plan of parsed.plans) {
      const aiScore = plan.score;
      let rulesScore = 0;
      let ruleCount = 0;
      for (const slot of [plan.hat, plan.top, plan.bottom, plan.outerwear, plan.shoes, plan.bag, plan.accessory]) {
        if (slot?.itemId) {
          const s = rulesOutput.itemScores.get(slot.itemId);
          if (s) { rulesScore += s.totalScore; ruleCount++; }
        }
      }
      const avgRulesScore = ruleCount > 0 ? Math.round(rulesScore / ruleCount) : 60;
      const memoryScore = this.scoreMemoryForPlan(plan, input.memoryContext);
      // 4:4:2 加权
      plan.score = Math.round(aiScore * 0.4 + avgRulesScore * 0.4 + memoryScore * 0.2);
    }

    return {
      ...parsed,
      ...(knowledgeTitles.length ? { knowledgeUsed: knowledgeTitles } : {}),
      ...(this.buildMemoryEcho(input.memoryContext?.snapshot).length
        ? { memoryEcho: this.buildMemoryEcho(input.memoryContext?.snapshot) }
        : {}),
    };
  }

  /**
   * 空衣橱起步方案 — 基于用户画像+天气+场合，给出"建议购买"的穿搭方案
   *
   * 解决痛点：不会穿搭的新手往往衣橱为空，直接报错会把最需要帮助的人挡在门外。
   * 这里不引用任何衣橱单品，所有 slot 都是购买建议（isSuggestion: true）。
   */
  private async recommendStarter(
    input: OutfitRecommendationInput,
  ): Promise<OutfitRecommendationResult> {
    const { text: knowledgeText, titles: knowledgeTitles } = await this.retrieveKnowledge(input);
    const systemPrompt = buildStarterOutfitPrompt(input, knowledgeText);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '我的衣橱还是空的，请给我几套可以直接照着买的起步穿搭方案。' },
    ];

    this.logger.log(
      `空衣橱起步方案 AI 调用 | 城市: ${input.weather.city} | 场合: ${input.occasion} | 风格目标: ${input.styleGoal}`,
    );
    const startTime = Date.now();
    const response = await this.llmFactory.chat(messages, {
      temperature: 0.6,
      maxTokens: 3000,
      timeoutMs: 90000,
    });

    const parsed = this.parseResponse(response.content);
    this.logger.log(
      `空衣橱起步方案完成 | 耗时 ${Date.now() - startTime}ms | 模型: ${response.model} | 方案数: ${parsed.plans.length}`,
    );

    return {
      ...parsed,
      isStarter: true,
      starterMessage:
        '你的衣橱还是空的，以上方案中的单品都是购买建议。把它们加入衣橱后，推荐会精确到你的每一件衣服。',
      ...(knowledgeTitles.length ? { knowledgeUsed: knowledgeTitles } : {}),
      ...(this.buildMemoryEcho(input.memoryContext?.snapshot).length
        ? { memoryEcho: this.buildMemoryEcho(input.memoryContext?.snapshot) }
        : {}),
    };
  }

  /**
   * 检索穿搭知识并注入 prompt（RAG 接线）
   *
   * 使用 RagService.augmentForRecommendation 按 场合/天气/风格 从知识库检索专业建议。
   * 安全性设计：
   * - @Optional：RagModule 未加载（ENABLE_DB=false）时 ragService 为 undefined，直接跳过
   * - try/catch：DB 不可用 / 检索报错时降级为"无知识推荐"，绝不影响推荐主流程
   * - 无证据短路：检索为空时返回空，由规则引擎 + 通用审美兜底
   */
  private async retrieveKnowledge(
    input: OutfitRecommendationInput,
  ): Promise<{ text: string; titles: string[] }> {
    if (!this.ragService) {
      this.logger.debug('RAG 未启用（RagService 未注入），跳过知识检索');
      return { text: '', titles: [] };
    }

    try {
      const styleTags = input.memoryContext?.snapshot?.likedStyles?.slice(0, 3) ?? [];

      const text = await this.ragService.augmentForRecommendation({
        occasion: input.occasion,
        weather: `${input.weather.temperature}°C ${input.weather.condition}${input.weather.isRaining ? ' 下雨' : ''}`,
        styleTags,
      });

      if (!text) {
        this.logger.debug('RAG 未命中相关知识（无证据短路，走规则/通用推荐）');
        return { text: '', titles: [] };
      }

      // 提取标题用于可解释性（knowledgeUsed）
      const titles = (text.match(/【([^】]+)】/g) ?? []).map((t) => t.replace(/[【】]/g, ''));
      this.logger.log(`RAG 命中 ${titles.length} 条知识 | ${titles.join('、')}`);
      return { text, titles };
    } catch (err) {
      this.logger.warn(
        `RAG 检索失败，降级为无知识推荐: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { text: '', titles: [] };
    }
  }

  /**
   * 从用户记忆快照派生"我注意到你 X"短句列表（用户感知层核心）
   *
   * 设计意图：让"长期记忆"在产品上**被用户看见**——
   * 即使 LLM 输出的 reason 是通用的，前端也能展示"AI 真的读了你的偏好"。
   * 规则：
   * - 优先展示"避坑/不喜欢"类（用户最在意的差异化）
   * - 每个字段最多展示 2 个值，避免刷屏
   * - 总数上限 4 条，再多就只取前 4
   * - 空 snapshot 直接返回空数组（前端不展示）
   */
  private buildMemoryEcho(snapshot?: {
    summary?: string;
    likedStyles?: string[];
    dislikedStyles?: string[];
    preferredColors?: string[];
    dislikedColors?: string[];
    avoidRules?: string[];
    dressGoals?: string[];
    bodyConcerns?: string[];
    currentIntent?: string | null;
  } | null): string[] {
    if (!snapshot) return [];

    const echo: string[] = [];

    // 优先级 1：当前意图（最有"专属感"的信号）
    if (snapshot.currentIntent) {
      echo.push(`你最近在找「${snapshot.currentIntent}」`);
    }

    // 优先级 2：避坑规则（差异化最强）
    if (snapshot.avoidRules?.length) {
      echo.push(`你说过：${snapshot.avoidRules.slice(0, 1).join('；')}`);
    }

    // 优先级 3：不喜欢的颜色
    if (snapshot.dislikedColors?.length) {
      echo.push(`避开你不喜欢的颜色：${snapshot.dislikedColors.slice(0, 2).join('、')}`);
    }

    // 优先级 4：不喜欢的风格
    if (snapshot.dislikedStyles?.length) {
      echo.push(`避开你不喜欢的风格：${snapshot.dislikedStyles.slice(0, 2).join('、')}`);
    }

    // 优先级 5：喜欢的风格
    if (snapshot.likedStyles?.length) {
      echo.push(`基于你喜欢的风格：${snapshot.likedStyles.slice(0, 2).join('、')}`);
    }

    // 优先级 6：偏好颜色
    if (snapshot.preferredColors?.length) {
      echo.push(`偏好颜色：${snapshot.preferredColors.slice(0, 2).join('、')}`);
    }

    // 优先级 7：穿搭目标
    if (snapshot.dressGoals?.length) {
      echo.push(`穿搭目标：${snapshot.dressGoals.slice(0, 2).join('、')}`);
    }

    return echo.slice(0, 4);
  }

  /** 记忆评分：基于 MemorySnapshot 的用户偏好加权 */
  private scoreMemoryForPlan(
    plan: OutfitRecommendationPlan,
    memoryCtx?: OutfitRecommendationInput['memoryContext'],
  ): number {
    let score = 60;
    if (!memoryCtx?.snapshot) return score;

    const s = memoryCtx.snapshot;

    // 喜欢风格 → 加分
    if (s.likedStyles.length > 0) score += 5;
    // 避开风格 → 减分
    if (s.dislikedStyles.length > 0) score -= 5;
    // 避坑规则 → 减分（有规则说明用户有明确偏好）
    if (s.avoidRules.length > 0) score -= 3;
    // 穿搭目标 → 加分
    if (s.dressGoals.length > 0) score += 3;

    return Math.min(100, Math.max(20, score));
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
          hat: this.parseItem(p.hat),
          top: this.parseItem(p.top),
          bottom: this.parseItem(p.bottom),
          outerwear: this.parseItem(p.outerwear),
          shoes: this.parseItem(p.shoes),
          bag: this.parseItem(p.bag),
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
