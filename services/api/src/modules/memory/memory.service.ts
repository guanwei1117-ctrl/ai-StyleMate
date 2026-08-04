import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
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

      case 'worn_today':
        // 更新衣橱单品的 wearCount 和 lastWornAt
        if (dto.itemIds && dto.itemIds.length > 0) {
          for (const itemId of dto.itemIds) {
            try {
              await this.wardrobeItemRepo.increment({ id: itemId }, 'wearCount', 1);
              await this.wardrobeItemRepo.update(itemId, { lastWornAt: new Date() });
            } catch {
              // 单品可能已删除，忽略
            }
          }
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
   * 基于用户画像 + 衣柜 + 反馈，生成或更新摘要文本。
   * 这里使用规则拼装而非调用 LLM（避免每次刷新都消耗 AI 配额），
   * 如果需要更智能的总结，可后续接入 LLM。
   */
  async refreshMemorySummary(userId: string): Promise<UserMemorySummary> {
    const profile = await this.getStyleProfile(userId);
    const intent = await this.getCurrentIntent(userId);
    const feedbacks = await this.getRecentFeedbacks(userId, 50);
    const wardrobeItems = await this.wardrobeItemRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const lines: string[] = [];

    // 用户画像
    if (profile) {
      if (profile.likedStyles?.length) {
        lines.push(`用户喜欢的风格：${profile.likedStyles.join('、')}。`);
      }
      if (profile.dislikedStyles?.length) {
        lines.push(`不喜欢的风格：${profile.dislikedStyles.join('、')}。`);
      }
      if (profile.suitableStyles?.length) {
        lines.push(`适合的风格：${profile.suitableStyles.join('、')}。`);
      }
      if (profile.preferredColors?.length) {
        lines.push(`偏好的颜色：${profile.preferredColors.join('、')}。`);
      }
      if (profile.dislikedColors?.length) {
        lines.push(`不喜欢的颜色：${profile.dislikedColors.join('、')}。`);
      }
      if (profile.bodyConcerns?.length) {
        lines.push(`身材顾虑：${profile.bodyConcerns.join('、')}。`);
      }
      if (profile.dressGoals?.length) {
        lines.push(`穿搭目标：${profile.dressGoals.join('、')}。`);
      }
      if (profile.avoidRules?.length) {
        const avoidTexts = profile.avoidRules
          .filter((r) => r.weight > 0)
          .map((r) => r.rule);
        if (avoidTexts.length) {
          lines.push(`避坑规则：${avoidTexts.join('；')}。`);
        }
      }
    }

    // 衣柜摘要
    if (wardrobeItems.length > 0) {
      const categoryCount: Record<string, number> = {};
      wardrobeItems.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
      const topColors = this.getTopColors(wardrobeItems);
      lines.push(
        `衣橱共 ${wardrobeItems.length} 件，品类分布：${Object.entries(categoryCount)
          .map(([k, v]) => `${k} ${v}件`)
          .join('、')}。主色调：${topColors.join('、')}。`,
      );

      // 闲置单品
      const idle = wardrobeItems.filter(
        (i) => !i.lastWornAt || this.daysBetween(i.lastWornAt, new Date()) > 60,
      );
      if (idle.length > 0) {
        lines.push(`有 ${idle.length} 件单品超过 60 天未穿，可能需要清理或重新搭配。`);
      }
    }

    // 反馈摘要
    if (feedbacks.length > 0) {
      const typeCount: Record<string, number> = {};
      feedbacks.forEach((f) => {
        typeCount[f.feedbackType] = (typeCount[f.feedbackType] || 0) + 1;
      });
      const feedbackTexts = Object.entries(typeCount)
        .filter(([type]) => type !== 'like')
        .map(([type, count]) => `${this.feedbackTypeLabel(type)} ${count}次`);
      if (feedbackTexts.length) {
        lines.push(`近期反馈：${feedbackTexts.join('、')}。`);
      }
    }

    // 当前意图
    if (intent?.lookingFor) {
      lines.push(`近期想购买：${intent.lookingFor}。`);
    }
    if (intent?.targetOccasion) {
      lines.push(`目标场景：${intent.targetOccasion}。`);
    }

    // 计算置信度
    let confidence = 0.1;
    if (profile) confidence += 0.3;
    if (wardrobeItems.length > 0) confidence += 0.2;
    if (feedbacks.length > 0) confidence += 0.2;
    if (intent) confidence += 0.1;
    if (lines.length > 5) confidence += 0.1;
    confidence = Math.min(confidence, 0.99);

    const summary = lines.length > 0 ? lines.join('\n') : '暂无足够数据生成摘要。';

    let record = await this.summaryRepo.findOne({ where: { userId } });
    if (!record) {
      record = this.summaryRepo.create({ userId, summary, confidence });
    } else {
      record.summary = summary;
      record.confidence = confidence;
    }
    return this.summaryRepo.save(record);
  }

  // ==================== AI 上下文组装 ====================

  /**
   * 为 AI 调用组装上下文
   *
   * 所有 AI 功能调用前必须先调用此方法，获取用户长期记忆。
   */
  async buildAIContext(userId: string, taskType: TaskType): Promise<AIMemoryContext> {
    const [profile, intent, summary, wardrobeItems, feedbacks] = await Promise.all([
      this.getStyleProfile(userId),
      this.getCurrentIntent(userId),
      this.getMemorySummary(userId),
      this.wardrobeItemRepo.find({ where: { userId }, order: { createdAt: 'DESC' } }),
      this.getRecentFeedbacks(userId, 10),
    ]);

    // 衣柜关键数据
    let wardrobeSummary: AIMemoryContext['wardrobeSummary'] = null;
    if (wardrobeItems.length > 0) {
      const categoryCount: Record<string, number> = {};
      wardrobeItems.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      const now = new Date();
      const idleItems = wardrobeItems
        .filter((i) => !i.lastWornAt || this.daysBetween(i.lastWornAt, now) > 60)
        .slice(0, 5)
        .map((i) => ({
          id: i.id,
          description: `${i.color} ${i.subCategory ?? i.category}`,
          idleDays: i.lastWornAt ? this.daysBetween(i.lastWornAt, now) : 999,
        }));

      const topWorn = [...wardrobeItems]
        .sort((a, b) => b.wearCount - a.wearCount)
        .slice(0, 5)
        .map((i) => ({
          id: i.id,
          description: `${i.color} ${i.subCategory ?? i.category}`,
          wearCount: i.wearCount,
        }));

      wardrobeSummary = {
        totalItems: wardrobeItems.length,
        byCategory: categoryCount,
        idleItems,
        topWorn,
      };
    }

    // 最近反馈摘要
    let recentFeedbackSummary: string | null = null;
    if (feedbacks.length > 0) {
      recentFeedbackSummary = feedbacks
        .slice(0, 10)
        .map(
          (f) =>
            `${this.feedbackTypeLabel(f.feedbackType)}${f.reason ? `：${f.reason}` : ''}`,
        )
        .join('；');
    }

    return {
      styleProfile: profile,
      wardrobeSummary,
      recentFeedbackSummary,
      currentIntent: intent,
      memorySummary: summary?.summary ?? null,
      taskType,
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
