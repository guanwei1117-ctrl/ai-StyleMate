import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { MemoryService } from '../memory/memory.service';
import type { RecordFeedbackDto } from '../memory/memory.dto';

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

    // 2) 新增：同步写入长期记忆（让"AI 记住我"在产品上真实生效）
    //    - like → likedStyles 累加 + preferredColors 累加
    //    - dislike → dislikedStyles 累加 + dislikedColors 累加
    //    - 其他更细粒度反馈（too_fat / uncomfortable 等）由用户在"反馈理由"
    //      选择触发，/feedback 接口暂不展开，留待前端埋点
    let memoryUpdated = false;
    let aiMemoryNote = '';
    try {
      const memoryDto: RecordFeedbackDto = {
        feedbackType: dto.reaction === 'like' ? 'like' : 'dislike',
        reason: dto.comment,
        context: {
          planTitle: dto.planTitle,
          planType: dto.plan?.type,
          planScore: dto.plan?.score,
          rating: dto.rating,
          colors: dto.plan?.colors,
          styles: dto.plan?.styleTags ?? (dto.plan?.type ? [dto.plan.type] : undefined),
        },
      };
      await this.memoryService.recordOutfitFeedback(dto.userId, memoryDto);
      memoryUpdated = true;
      // 给用户的可感知回应（让"AI 记住了"在产品上立刻可见）
      aiMemoryNote =
        dto.reaction === 'like'
          ? '👍 记住了你喜欢这种风格，下次会优先推荐类似的搭配'
          : '👎 记住了你不喜欢这种风格/颜色，下次推荐时会避开';
      this.logger.log(
        `/feedback 已同步到长期记忆 | userId: ${dto.userId} | reaction: ${dto.reaction} | plan: ${dto.planTitle ?? '(无)'}`,
      );
    } catch (err) {
      // 写记忆失败不能影响主反馈响应（feedback 表已成功写入）
      this.logger.warn(
        `/feedback 同步到长期记忆失败（不影响主反馈）: ${err instanceof Error ? err.message : String(err)}`,
      );
      aiMemoryNote = '反馈已收到，但同步记忆失败，稍后重试';
    }

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
