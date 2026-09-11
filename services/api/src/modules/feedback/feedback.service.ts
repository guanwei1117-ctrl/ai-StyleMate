import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { MemoryService } from '../memory/memory.service';
import type { RecordFeedbackDto } from '../memory/memory.dto';

/** 细粒度反馈类型枚举（与 RecordFeedbackDto.feedbackType 对齐） */
type DetailedFeedbackType =
  | 'like'
  | 'dislike'
  | 'too_fat'
  | 'too_formal'
  | 'too_plain'
  | 'uncomfortable'
  | 'color_dislike'
  | 'occasion_mismatch';

/** 细粒度类型 → 给用户看的可感知文案（让"AI 记住了"具体到原因） */
const REASON_TYPE_NOTES: Record<DetailedFeedbackType, string> = {
  like: '👍 记住了你喜欢这种风格',
  dislike: '👎 记住了你不喜欢这种风格',
  too_fat: '记住了：避免宽松上衣+宽松下装，优先高腰/直筒/短外套',
  too_formal: '记住了：减少西装/衬衫/皮鞋等高正式度组合',
  too_plain: '记住了：避免过于普通的搭配',
  uncomfortable: '记住了：减少紧身/高跟/厚重材质，优先舒适',
  color_dislike: '记住了：不喜欢的颜色已加入避雷清单',
  occasion_mismatch: '记住了：避免这类搭配用在不合适场合',
};

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(Feedback)
    private readonly repo: Repository<Feedback>,
    // 注入 MemoryService：让 /feedback 接口的反馈也写入长期记忆（之前漏了，
    // 导致用户在 daily-recommend 点赞/踩不会更新画像，"AI 记住我"是空话）
    // MemoryModule 是 @Global()，无需在 feedback.module.ts 显式导入
    private readonly memoryService: MemoryService,
  ) {}

  async submit(dto: {
    userId: string;
    reaction: 'like' | 'dislike';
    rating?: number;
    comment?: string;
    planTitle?: string;
    plan?: Record<string, any>;
    /**
     * 细粒度反馈类型列表（多选），每个会单独触发一次记忆写入。
     * 留空时只按 reaction（like/dislike）写入一次。
     */
    reasonTypes?: DetailedFeedbackType[];
  }) {
    // 1) 保留：写入 feedback 表（用于历史、统计、详情展示）
    const fb = this.repo.create({
      userId: dto.userId,
      reaction: dto.reaction ?? 'like',
      rating: dto.rating ?? 0,
      comment: dto.comment,
      planTitle: dto.planTitle,
      plan: dto.plan,
    });
    const saved = await this.repo.save(fb);

    // 2) 同步写入长期记忆（让"AI 记住我"在产品上真实生效）
    //    - 决定本次要触发的 feedbackType 列表：
    //      a) reasonTypes 非空：每个元素触发一次（细粒度）
    //      b) reasonTypes 为空：按 reaction 触发一次（粗粒度，向后兼容）
    const baseContext = {
      planTitle: dto.planTitle,
      planType: dto.plan?.type,
      planScore: dto.plan?.score,
      rating: dto.rating,
      colors: dto.plan?.colors,
      styles: dto.plan?.styleTags ?? (dto.plan?.type ? [dto.plan.type] : undefined),
    };

    const typesToApply: DetailedFeedbackType[] =
      dto.reasonTypes && dto.reasonTypes.length > 0
        ? dto.reasonTypes
        : [dto.reaction === 'like' ? 'like' : 'dislike'];

    let memoryUpdated = false;
    const notes: string[] = [];
    const failedTypes: string[] = [];

    for (const t of typesToApply) {
      try {
        await this.memoryService.recordOutfitFeedback(dto.userId, {
          feedbackType: t,
          reason: dto.comment,
          context: baseContext,
        });
        notes.push(REASON_TYPE_NOTES[t]);
        memoryUpdated = true;
      } catch (err) {
        // 单条失败不阻塞其他条
        failedTypes.push(t);
        this.logger.warn(
          `/feedback 同步单条记忆失败 | type: ${t} | err: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 给用户的可感知回应（让"AI 记住了"在产品上立刻可见）
    // 多条原因时展示第一条 + "等其他 X 条"
    let aiMemoryNote: string;
    if (notes.length === 0) {
      aiMemoryNote = '反馈已收到，但同步记忆失败，稍后重试';
    } else if (notes.length === 1) {
      aiMemoryNote = `${notes[0]}，下次推荐会调整`;
    } else {
      aiMemoryNote = `${notes[0]}（还有 ${notes.length - 1} 条偏好已记住），下次推荐会调整`;
    }
    if (failedTypes.length > 0) {
      aiMemoryNote += `（${failedTypes.length} 条记忆同步失败，可稍后重试）`;
    }

    this.logger.log(
      `/feedback 完成 | userId: ${dto.userId} | reaction: ${dto.reaction} | reasonTypes: ${typesToApply.join(',')} | ok: ${notes.length} | failed: ${failedTypes.length}`,
    );

    return {
      // 平铺 Feedback 实体字段（向后兼容：旧调用方可继续用 response.id / response.reaction 等）
      id: saved.id,
      userId: saved.userId,
      reaction: saved.reaction,
      rating: saved.rating,
      comment: saved.comment,
      planTitle: saved.planTitle,
      plan: saved.plan,
      createdAt: (saved as any).createdAt,
      // 新增字段（让"AI 记住了"在产品上立刻可见）
      aiMemoryNote,
      memoryUpdated,
      appliedReasonTypes: notes.length > 0 ? typesToApply : undefined,
    };
  }

  async list(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async stats(userId: string) {
    const all = await this.repo.find({ where: { userId } });
    const likes = all.filter((f) => f.reaction === 'like').length;
    const dislikes = all.filter((f) => f.reaction === 'dislike').length;
    const rated = all.filter((f) => f.rating > 0);
    const avgRating = rated.length
      ? rated.reduce((s, f) => s + f.rating, 0) / rated.length
      : 0;
    return { total: all.length, likes, dislikes, avgRating };
  }
}
