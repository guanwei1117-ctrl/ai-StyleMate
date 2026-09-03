import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LLMFactory } from '../llm/llm-factory';
import { UserStyleProfile } from './entities/user-style-profile.entity';
import { OutfitFeedback } from './entities/outfit-feedback.entity';
import { UserCurrentIntent } from './entities/user-current-intent.entity';
import { UserMemorySummary } from './entities/user-memory-summary.entity';
import { WardrobeItem } from '../wardrobe/entities/wardrobe-item.entity';
import {
  UpdateStyleProfileDto,
  RecordFeedbackDto,
  UpdateIntentDto,
  AIMemoryContext,
  MemorySnapshot,
  TaskType,
} from './memory.dto';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    @InjectRepository(UserStyleProfile)
    private readonly profileRepo: Repository<UserStyleProfile>,
    @InjectRepository(OutfitFeedback)
    private readonly feedbackRepo: Repository<OutfitFeedback>,
    @InjectRepository(UserCurrentIntent)
    private readonly intentRepo: Repository<UserCurrentIntent>,
    @InjectRepository(UserMemorySummary)
    private readonly summaryRepo: Repository<UserMemorySummary>,
    @InjectRepository(WardrobeItem)
    private readonly wardrobeItemRepo: Repository<WardrobeItem>,
    private readonly llmFactory: LLMFactory,
  ) {}

  // ==================== 用户长期画像 ====================

  /**
   * 获取用户长期画像，不存在返回 null
   */
  async getStyleProfile(userId: string): Promise<UserStyleProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  /**
   * 更新用户风格画像（部分更新，合并而非覆盖）
   */
  async updateStyleProfile(
    userId: string,
    data: UpdateStyleProfileDto,
  ): Promise<UserStyleProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId, ...data });
    } else {
      // 数组字段：追加去重而非覆盖
      const arrayFields = [
        'suitableStyles',
        'likedStyles',
        'dislikedStyles',
        'preferredColors',
        'dislikedColors',
        'bodyConcerns',
        'dressGoals',
        'commonOccasions',
      ] as const;
      for (const field of arrayFields) {
        if (data[field] && data[field]!.length > 0) {
          const existing = profile[field] ?? [];
          profile[field] = [...new Set([...existing, ...data[field]!])];
        }
      }
      // 非数组字段：直接覆盖
      const scalarFields = ['bodyType', 'heightRange', 'skinTone', 'faceStyle'] as const;
      for (const field of scalarFields) {
        if (data[field] !== undefined) {
          profile[field] = data[field]!;
        }
      }
      // avoidRules: 追加
      if (data.avoidRules && data.avoidRules.length > 0) {
        profile.avoidRules = [...(profile.avoidRules ?? []), ...data.avoidRules];
      }
    }
    return this.profileRepo.save(profile);
  }

  /**
   * 清空用户画像（隐私功能：一键清空）
   */
  async clearStyleProfile(userId: string): Promise<void> {
    await this.profileRepo.delete({ userId });
    await this.summaryRepo.delete({ userId });
    await this.intentRepo.delete({ userId });
    this.logger.log(`已清空用户 ${userId} 的全部长期记忆`);
  }

  /**
   * 删除单条记忆字段（前端编辑功能）
   */
  async removeProfileField(
    userId: string,
    field: string,
    value?: string,
  ): Promise<UserStyleProfile> {
    const profile = await this.getStyleProfile(userId);
    if (!profile) throw new NotFoundException('用户画像不存在');

    const arrayFields = [
      'suitableStyles',
      'likedStyles',
      'dislikedStyles',
      'preferredColors',
      'dislikedColors',
      'bodyConcerns',
      'dressGoals',
      'commonOccasions',
    ] as const;

    if ((arrayFields as readonly string[]).includes(field)) {
      const arr = profile[field as keyof UserStyleProfile] as string[] | undefined;
      if (value && arr) {
        (profile as any)[field] = arr.filter((v) => v !== value);
      } else {
        (profile as any)[field] = [];
      }
    } else if (field === 'avoidRules') {
      if (value) {
        profile.avoidRules = (profile.avoidRules ?? []).filter((r) => r.rule !== value);
      } else {
        profile.avoidRules = [];
      }
    } else {
      (profile as any)[field] = null;
    }

    return this.profileRepo.save(profile);
  }

  // ==================== 行为反馈 ====================

  /**
   * 记录用户反馈，并触发偏好权重更新
   */
  async recordOutfitFeedback(
    userId: string,
    dto: RecordFeedbackDto,
  ): Promise<OutfitFeedback> {
    const feedback = this.feedbackRepo.create({
      userId,
      outfitId: dto.outfitId,
      itemIds: dto.itemIds,
      feedbackType: dto.feedbackType,
      reason: dto.reason,
      context: dto.context,
    });
    const saved = await this.feedbackRepo.save(feedback);

    // 异步触发反馈到记忆的更新（不阻塞响应）
    this.applyFeedbackToMemory(userId, dto).catch((err) => {
      this.logger.error(`反馈更新记忆失败: ${err.message}`, err.stack);
    });

    return saved;
  }

  /**
   * 获取用户最近反馈列表
   */
  async getRecentFeedbacks(userId: string, limit = 20): Promise<OutfitFeedback[]> {
    return this.feedbackRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 反馈到记忆的核心更新逻辑
   *
   * 规则示例：
   * 1. like → 增加对应颜色、风格、版型权重
   * 2. dislike → 降低对应颜色、风格、版型权重
   * 3. worn_today → 更新 outfit 和 item 的 wearCount, lastWornAt
   * 4. too_fat → 记录避坑规则（避免宽松上衣+宽松下装，优先高腰/直筒/短外套）
   * 5. too_formal → 降低正式度偏好，记录避坑（减少西装/衬衫/皮鞋组合）
   * 6. uncomfortable → 记录舒适度避坑（减少紧身/高跟/厚重材质）
   * 7. color_dislike → 加入 dislikedColors
   * 8. occasion_mismatch → 记录场景避坑
   */
  private async applyFeedbackToMemory(
    userId: string,
    dto: RecordFeedbackDto,
  ): Promise<void> {
    const profile = await this.ensureProfile(userId);
    const ctx = dto.context ?? {};

    switch (dto.feedbackType) {
      case 'like':
        // 增加权重：从方案中提取颜色/风格加入 preferred
        if (ctx.colors && Array.isArray(ctx.colors)) {
          profile.preferredColors = [
            ...new Set([...(profile.preferredColors ?? []), ...ctx.colors]),
          ];
        }
        if (ctx.styles && Array.isArray(ctx.styles)) {
          profile.likedStyles = [
            ...new Set([...(profile.likedStyles ?? []), ...ctx.styles]),
          ];
        }
        break;

      case 'dislike':
        if (ctx.colors && Array.isArray(ctx.colors)) {
          profile.dislikedColors = [
            ...new Set([...(profile.dislikedColors ?? []), ...ctx.colors]),
          ];
        }
        if (ctx.styles && Array.isArray(ctx.styles)) {
          profile.dislikedStyles = [
            ...new Set([...(profile.dislikedStyles ?? []), ...ctx.styles]),
          ];
        }
        break;

      case 'too_fat':
        this.addAvoidRule(profile, '避免宽松上衣+宽松下装', 'feedback:too_fat');
        this.addAvoidRule(profile, '优先高腰、直筒、短外套', 'feedback:too_fat', true);
        if (!profile.bodyConcerns?.includes('显胖')) {
          profile.bodyConcerns = [...(profile.bodyConcerns ?? []), '显胖'];
        }
        break;

      case 'too_formal':
        this.addAvoidRule(
          profile,
          '减少西装、衬衫、皮鞋等高正式度组合',
          'feedback:too_formal',
        );
        this.addAvoidRule(
          profile,
          '降低正式度偏好，优先 casual/business_casual',
          'feedback:too_formal',
          true,
        );
        break;

      case 'too_plain':
        this.addAvoidRule(profile, '避免过于普通的搭配组合', 'feedback:too_plain');
        break;

      case 'uncomfortable':
        this.addAvoidRule(profile, '减少紧身、高跟、厚重材质', 'feedback:uncomfortable');
        this.addAvoidRule(
          profile,
          '优先舒适材质和宽松版型',
          'feedback:uncomfortable',
          true,
        );
        break;

      case 'color_dislike':
        if (ctx.color) {
          profile.dislikedColors = [
            ...new Set([...(profile.dislikedColors ?? []), ctx.color as string]),
          ];
        }
        break;

      case 'occasion_mismatch':
        if (ctx.occasion && ctx.wrongOccasion) {
          this.addAvoidRule(
            profile,
            `${ctx.occasion} 不适合 ${ctx.wrongOccasion} 场景`,
            'feedback:occasion_mismatch',
          );
        }
        break;
    }

    await this.profileRepo.save(profile);
    this.logger.log(
      `反馈 ${dto.feedbackType} 已更新用户 ${userId} 的记忆权重`,
    );

    // 反馈更新后自动刷新记忆快照
    this.refreshSnapshot(userId).catch(() => {});
  }

  private addAvoidRule(
    profile: UserStyleProfile,
    rule: string,
    source: string,
    isPositive = false,
  ): void {
    if (!profile.avoidRules) profile.avoidRules = [];
    // 正向规则（优先…）和避坑规则分开，但都存在 avoidRules 里
    // 避免重复添加相同规则
    const exists = profile.avoidRules.some((r) => r.rule === rule);
    if (!exists) {
      profile.avoidRules.push({ rule, source, weight: isPositive ? 0 : 1 });
    } else {
      // 已存在的避坑规则，增加权重
      const existing = profile.avoidRules.find((r) => r.rule === rule);
      if (existing && !isPositive) existing.weight += 1;
    }
  }

  // ==================== AI 自动行为合并 ====================

  /**
   * 基于用户行为自动分析并合并记忆
   *
   * 当用户使用推荐/评分/购买评估等功能时调用，
   * 由 AI 分析行为背后的偏好变化并自动更新记忆。
   */
  async autoMergeFromBehavior(
    userId: string,
    behavior: {
      action: string;        // 用户行为描述，如 "采纳了AI推荐的日系通勤穿搭"
      styles?: string[];     // 涉及的风格
      colors?: string[];     // 涉及的颜色
      occasion?: string;     // 场景
      outfitDescription?: string; // 穿搭描述
      extraContext?: string; // 额外上下文
    },
  ): Promise<void> {
    const profile = await this.getStyleProfile(userId);

    // 构建当前记忆摘要
    const profileSummary = profile
      ? [
          profile.likedStyles?.length ? `喜欢：${profile.likedStyles.join('、')}` : '',
          profile.dislikedStyles?.length ? `不喜欢：${profile.dislikedStyles.join('、')}` : '',
          profile.preferredColors?.length ? `偏好颜色：${profile.preferredColors.join('、')}` : '',
          profile.dislikedColors?.length ? `避开颜色：${profile.dislikedColors.join('、')}` : '',
          profile.bodyConcerns?.length ? `身材顾虑：${profile.bodyConcerns.join('、')}` : '',
          profile.dressGoals?.length ? `目标：${profile.dressGoals.join('、')}` : '',
        ].filter(Boolean).join('；')
      : '（新用户，暂无记忆）';

    const prompt = `你是 StyleMate 记忆合并助手。根据用户最新行为，判断需要更新哪些长期穿搭记忆。

## 当前记忆
${profileSummary || '（暂无）'}

## 最新行为
- 动作：${behavior.action}
${behavior.styles?.length ? `- 涉及风格：${behavior.styles.join('、')}` : ''}
${behavior.colors?.length ? `- 涉及颜色：${behavior.colors.join('、')}` : ''}
${behavior.occasion ? `- 场景：${behavior.occasion}` : ''}
${behavior.outfitDescription ? `- 穿搭：${behavior.outfitDescription}` : ''}
${behavior.extraContext ? `- 补充：${behavior.extraContext}` : ''}

## 规则
- 只输出需要新增/删除的字段，已有的正确记忆不要重复
- likedStyles/dislikedStyles 用中文风格标签
- preferredColors/dislikedColors 用中文色名
- 如果是正向行为（采纳/喜欢），加到 liked/preferred；负向（跳过/拒绝），加到 disliked
- avoidRules 只在明确需要避坑时才输出

只返回 JSON：
{"likedStyles":[],"dislikedStyles":[],"preferredColors":[],"dislikedColors":[],"bodyConcerns":[],"dressGoals":[],"commonOccasions":[],"avoidRules":[{"rule":"","source":"ai:behavior","weight":1}]}`;

    try {
      const response = await this.llmFactory.chat(
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, maxTokens: 400, timeoutMs: 15000 },
      );

      const jsonStr = response.content.replace(/```(?:json)?\s*\n?/g, '').trim();
      const merge = JSON.parse(jsonStr);

      // 过滤空数组
      const hasChanges = Object.values(merge).some(
        (v) => Array.isArray(v) && v.length > 0,
      );
      if (!hasChanges) return;

      await this.updateStyleProfile(userId, merge);
      this.logger.log(
        `行为自动合并完成 | userId: ${userId} | 动作: ${behavior.action} | 模型: ${response.model}`,
      );
    } catch (err) {
      this.logger.warn(
        `行为自动合并失败（静默）: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // ==================== 当前意图 ====================

  async getCurrentIntent(userId: string): Promise<UserCurrentIntent | null> {
    return this.intentRepo.findOne({ where: { userId } });
  }

  async updateCurrentIntent(
    userId: string,
    data: UpdateIntentDto,
  ): Promise<UserCurrentIntent> {
    let intent = await this.intentRepo.findOne({ where: { userId } });
    if (!intent) {
      intent = this.intentRepo.create({ userId, ...data });
    } else {
      Object.assign(intent, data);
    }
    return this.intentRepo.save(intent);
  }

  // ==================== AI 总结记忆 ====================

  async getMemorySummary(userId: string): Promise<UserMemorySummary | null> {
    return this.summaryRepo.findOne({ where: { userId } });
  }

  /**
   * 刷新 AI 总结记忆
   *
   * 收集用户画像 + 衣柜 + 反馈 + 意图，交由 LLM 生成智能总结。
   * LLM 失败时回退到规则拼接，保证可用性。
   */
  async refreshMemorySummary(userId: string): Promise<UserMemorySummary> {
    const [profile, intent, feedbacks, wardrobeItems] = await Promise.all([
      this.getStyleProfile(userId),
      this.getCurrentIntent(userId),
      this.getRecentFeedbacks(userId, 50),
      this.wardrobeItemRepo.find({ where: { userId }, order: { createdAt: 'DESC' } }),
    ]);

    // 构建数据摘要
    const data: string[] = [];

    if (profile) {
      const parts: string[] = [];
      if (profile.likedStyles?.length) parts.push(`喜欢的风格：${profile.likedStyles.join('、')}`);
      if (profile.dislikedStyles?.length) parts.push(`不喜欢的风格：${profile.dislikedStyles.join('、')}`);
      if (profile.suitableStyles?.length) parts.push(`适合的风格：${profile.suitableStyles.join('、')}`);
      if (profile.preferredColors?.length) parts.push(`偏好颜色：${profile.preferredColors.join('、')}`);
      if (profile.dislikedColors?.length) parts.push(`避开颜色：${profile.dislikedColors.join('、')}`);
      if (profile.bodyConcerns?.length) parts.push(`身材顾虑：${profile.bodyConcerns.join('、')}`);
      if (profile.dressGoals?.length) parts.push(`穿搭目标：${profile.dressGoals.join('、')}`);
      if (profile.commonOccasions?.length) parts.push(`日常场景：${profile.commonOccasions.join('、')}`);
      if (profile.bodyType) parts.push(`体型：${profile.bodyType}`);
      if (profile.skinTone) parts.push(`肤色：${profile.skinTone}`);
      if (parts.length) data.push(`【风格画像】\n${parts.join('\n')}`);
    }

    if (wardrobeItems.length > 0) {
      const cats: Record<string, number> = {};
      wardrobeItems.forEach((i) => { cats[i.category] = (cats[i.category] || 0) + 1; });
      data.push(`【衣橱】共 ${wardrobeItems.length} 件，${Object.entries(cats).map(([k, v]) => `${k}${v}件`).join('、')}。`);
    }

    if (feedbacks.length > 0) {
      const tc: Record<string, number> = {};
      feedbacks.forEach((f) => { tc[f.feedbackType] = (tc[f.feedbackType] || 0) + 1; });
      data.push(`【近期反馈】${Object.entries(tc).map(([t, c]) => `${this.feedbackTypeLabel(t)}${c}次`).join('、')}`);
    }

    if (intent?.lookingFor || intent?.targetOccasion) {
      data.push(`【当前意图】${[intent.lookingFor ? `想买：${intent.lookingFor}` : '', intent.targetOccasion ? `目标场景：${intent.targetOccasion}` : ''].filter(Boolean).join('；')}`);
    }

    // 尝试 LLM 生成
    let summary: string;
    let confidence: number;
    try {
      const prompt = `你是 StyleMate 的穿搭记忆总结助手。根据以下用户数据，生成一段 150 字以内的穿搭偏好总结，帮助推荐系统理解用户。

${data.join('\n\n') || '（新用户，数据极少）'}

要求：
- 第一句概括用户的核心穿搭偏好
- 提及风格倾向、颜色偏好、身材关注点
- 如果有数据，指出衣橱特征（品类是否均衡、有无闲置）
- 语气简洁专业，不编造不存在的信息
- 只返回总结文本，不要 markdown`;

      const response = await this.llmFactory.chat(
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, maxTokens: 300, timeoutMs: 15000 },
      );
      summary = response.content.trim();
      confidence = this.computeMemoryConfidence(profile, intent, feedbacks, wardrobeItems);
      this.logger.log(`LLM 记忆总结生成完成 | userId: ${userId} | 模型: ${response.model}`);
    } catch (err) {
      // 回退到规则拼接
      this.logger.warn(`LLM 记忆总结失败，回退规则拼接: ${err instanceof Error ? err.message : String(err)}`);
      const lines = this.buildRuleBasedSummary(profile, intent, feedbacks, wardrobeItems);
      summary = lines.length > 0 ? lines.join('\n') : '暂无足够数据生成摘要。';
      confidence = Math.min(0.5, this.computeMemoryConfidence(profile, intent, feedbacks, wardrobeItems));
    }

    let record = await this.summaryRepo.findOne({ where: { userId } });
    if (!record) {
      record = this.summaryRepo.create({ userId, summary, confidence });
    } else {
      record.summary = summary;
      record.confidence = confidence;
    }
    return this.summaryRepo.save(record);
  }

  private computeMemoryConfidence(
    profile: UserStyleProfile | null,
    intent: UserCurrentIntent | null,
    feedbacks: OutfitFeedback[],
    wardrobeItems: WardrobeItem[],
  ): number {
    let c = 0.1;
    if (profile) c += 0.3;
    if (wardrobeItems.length > 0) c += 0.2;
    if (feedbacks.length > 0) c += 0.2;
    if (intent) c += 0.1;
    return Math.min(c, 0.99);
  }

  /** 规则拼接回退（LLM 不可用时使用） */
  private buildRuleBasedSummary(
    profile: UserStyleProfile | null,
    intent: UserCurrentIntent | null,
    feedbacks: OutfitFeedback[],
    wardrobeItems: WardrobeItem[],
  ): string[] {
    const lines: string[] = [];
    if (profile) {
      if (profile.likedStyles?.length) lines.push(`用户喜欢的风格：${profile.likedStyles.join('、')}。`);
      if (profile.dislikedStyles?.length) lines.push(`不喜欢的风格：${profile.dislikedStyles.join('、')}。`);
      if (profile.suitableStyles?.length) lines.push(`适合的风格：${profile.suitableStyles.join('、')}。`);
      if (profile.preferredColors?.length) lines.push(`偏好的颜色：${profile.preferredColors.join('、')}。`);
      if (profile.dislikedColors?.length) lines.push(`不喜欢的颜色：${profile.dislikedColors.join('、')}。`);
      if (profile.bodyConcerns?.length) lines.push(`身材顾虑：${profile.bodyConcerns.join('、')}。`);
      if (profile.dressGoals?.length) lines.push(`穿搭目标：${profile.dressGoals.join('、')}。`);
    }
    if (wardrobeItems.length > 0) {
      const cats: Record<string, number> = {};
      wardrobeItems.forEach((i) => { cats[i.category] = (cats[i.category] || 0) + 1; });
      lines.push(`衣橱共 ${wardrobeItems.length} 件，${Object.entries(cats).map(([k, v]) => `${k}${v}件`).join('、')}。`);
    }
    if (intent?.lookingFor) lines.push(`近期想购买：${intent.lookingFor}。`);
    return lines;
  }

  // ==================== 记忆快照（核心优化）====================

  /**
   * 从原始数据构建预压缩记忆快照
   *
   * 核心优化：将用户画像、AI 总结、当前意图等压缩成 150 字以内的结构化摘要，
   * 避免每次 AI 调用都加载完整的原始数据。
   */
  async buildSnapshot(userId: string): Promise<MemorySnapshot | null> {
    const [profile, intent, summary] = await Promise.all([
      this.getStyleProfile(userId),
      this.getCurrentIntent(userId),
      this.getMemorySummary(userId),
    ]);

    if (!profile && !intent && !summary) return null;

    const avoidRules: string[] = [];
    if (profile?.avoidRules?.length) {
      profile.avoidRules
        .filter((r) => r.weight > 0)
        .forEach((r) => avoidRules.push(r.rule));
    }

    return {
      summary: summary?.summary ?? '',
      likedStyles: profile?.likedStyles ?? [],
      dislikedStyles: profile?.dislikedStyles ?? [],
      preferredColors: profile?.preferredColors ?? [],
      dislikedColors: profile?.dislikedColors ?? [],
      avoidRules,
      dressGoals: profile?.dressGoals ?? [],
      bodyConcerns: profile?.bodyConcerns ?? [],
      commonOccasions: profile?.commonOccasions ?? [],
      currentIntent: intent?.lookingFor ?? null,
      confidence: summary?.confidence ?? 0.1,
    };
  }

  /**
   * 刷新记忆快照（在关键时机调用）
   *
   * 触发时机：
   * - 对话结束转化记忆时
   * - 用户提交反馈时
   * - 用户手动编辑记忆时
   */
  async refreshSnapshot(userId: string): Promise<void> {
    // 先刷新 AI 总结（如果已有足够数据）
    try {
      await this.refreshMemorySummary(userId);
    } catch {
      // 静默处理
    }
    // 快照由 buildAIContext 在调用时实时构建（轻量操作，仅从 DB 读少量字段）
    this.logger.log(`记忆快照已刷新 | userId: ${userId}`);
  }

  // ==================== AI 上下文组装（按需加载）====================

  /**
   * 为 AI 调用组装上下文
   *
   * 核心优化：按 taskType 按需加载，只读取当前任务需要的字段。
   * 所有 AI 功能调用前必须先调用此方法。
   */
  async buildAIContext(userId: string, taskType: TaskType): Promise<AIMemoryContext> {
    // 所有任务都需要记忆快照（轻量，仅读 summary + profile 的数组字段）
    const snapshot = await this.buildSnapshot(userId);

    // 衣柜数据：仅 today_outfit / item_styling / wardrobe_gap 需要
    let wardrobeSummary: AIMemoryContext['wardrobeSummary'] = null;
    if (
      taskType === 'today_outfit' ||
      taskType === 'item_styling' ||
      taskType === 'wardrobe_gap'
    ) {
      const wardrobeItems = await this.wardrobeItemRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      if (wardrobeItems.length > 0) {
        const categoryCount: Record<string, number> = {};
        wardrobeItems.forEach((item) => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });

        wardrobeSummary = {
          totalItems: wardrobeItems.length,
          byCategory: categoryCount,
          idleItems: [],
          topWorn: [],
        };
      }
    }

    return {
      taskType,
      snapshot,
      wardrobeSummary,
    };
  }

  /**
   * 获取用户完整记忆（前端"AI 记住了什么"页面用）
   */
  async getUserMemory(userId: string) {
    const [profile, intent, summary, feedbacks] = await Promise.all([
      this.getStyleProfile(userId),
      this.getCurrentIntent(userId),
      this.getMemorySummary(userId),
      this.getRecentFeedbacks(userId, 50),
    ]);

    return {
      styleProfile: profile,
      currentIntent: intent,
      memorySummary: summary,
      recentFeedbacks: feedbacks,
    };
  }

  // ==================== 辅助方法 ====================

  private async ensureProfile(userId: string): Promise<UserStyleProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId });
      profile = await this.profileRepo.save(profile);
    }
    return profile;
  }

  private daysBetween(from: Date, to: Date): number {
    const ms = to.getTime() - from.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  private getTopColors(items: WardrobeItem[]): string[] {
    const colorCount: Record<string, number> = {};
    items.forEach((i) => {
      colorCount[i.color] = (colorCount[i.color] || 0) + 1;
    });
    return Object.entries(colorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  }

  private feedbackTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      like: '喜欢',
      dislike: '不喜欢',
      worn_today: '今天穿了',
      too_fat: '太显胖',
      too_formal: '太正式',
      too_plain: '太普通',
      uncomfortable: '不舒服',
      color_dislike: '颜色不喜欢',
      occasion_mismatch: '场合不合适',
    };
    return labels[type] ?? type;
  }
}
