import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly repo: Repository<Feedback>,
  ) {}

  async submit(dto: {
    userId: string;
    reaction: 'like' | 'dislike';
    rating?: number;
    comment?: string;
    planTitle?: string;
    plan?: Record<string, any>;
  }) {
    const fb = this.repo.create({
      userId: dto.userId,
      reaction: dto.reaction ?? 'like',
      rating: dto.rating ?? 0,
      comment: dto.comment,
      planTitle: dto.planTitle,
      plan: dto.plan,
    });
    return this.repo.save(fb);
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
