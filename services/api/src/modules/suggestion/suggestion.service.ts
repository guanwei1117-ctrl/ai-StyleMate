import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suggestion, SuggestionCategory } from './suggestion.entity';

@Injectable()
export class SuggestionService {
  private readonly logger = new Logger(SuggestionService.name);

  constructor(
    @InjectRepository(Suggestion)
    private readonly repo: Repository<Suggestion>,
  ) {}

  /** 用户提交建议（无需登录，userId 可空） */
  async submit(dto: {
    content: string;
    category?: SuggestionCategory;
    userId?: string | null;
    pageUrl?: string | null;
  }): Promise<Suggestion> {
    const item = this.repo.create({
      content: dto.content,
      category: dto.category ?? 'other',
      userId: dto.userId ?? null,
      pageUrl: dto.pageUrl ?? null,
    });
    return this.repo.save(item);
  }

  /** 管理端：分页查询建议列表 */
  async list(page = 1, pageSize = 20, status?: 'new' | 'viewed') {
    const where = status ? { status } : {};
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  /** 管理端：标记建议为已查看 */
  async markViewed(id: string): Promise<void> {
    await this.repo.update(id, { status: 'viewed' });
  }

  /** 管理端：统计 */
  async stats() {
    const total = await this.repo.count();
    const newCount = await this.repo.count({ where: { status: 'new' } });
    const viewedCount = await this.repo.count({ where: { status: 'viewed' } });
    return { total, new: newCount, viewed: viewedCount };
  }
}
