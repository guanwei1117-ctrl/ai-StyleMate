import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Feedback } from '../feedback/feedback.entity';
import { Suggestion } from '../suggestion/suggestion.entity';
import { LlmCallLog } from '../llm/entities/llm-call-log.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Suggestion)
    private readonly suggestionRepo: Repository<Suggestion>,
    @InjectRepository(LlmCallLog)
    private readonly llmCallLogRepo: Repository<LlmCallLog>,
  ) {}

  /** 概览：总用户数、今日新增、建档完成率 */
  async overview() {
    const totalUsers = await this.userRepo.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await this.userRepo
      .createQueryBuilder('u')
      .where('u.createdAt >= :today', { today })
      .getCount();

    // 建档完成率：有 user_style_profiles 记录的用户数 / 总用户数
    let profileCount = 0;
    try {
      profileCount = await this.dataSource.query(
        `SELECT COUNT(DISTINCT user_id) FROM user_style_profiles`,
      ).then((r: any[]) => parseInt(r[0]?.count ?? '0'));
    } catch {
      // 表可能不存在
    }
    const profileRate = totalUsers > 0 ? (profileCount / totalUsers) * 100 : 0;

    const totalFeedback = await this.feedbackRepo.count();
    const totalSuggestions = await this.suggestionRepo.count();
    const newSuggestions = await this.suggestionRepo.count({ where: { status: 'new' } });

    return {
      totalUsers,
      newToday,
      profileRate: Math.round(profileRate * 10) / 10,
      totalFeedback,
      totalSuggestions,
      newSuggestions,
    };
  }

  /** 用户新增趋势（按天聚合） */
  async usersTrend(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const rows = await this.dataSource.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM users
       WHERE created_at >= $1
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [since],
    );
    return rows.map((r: any) => ({ date: r.date, count: parseInt(r.count) }));
  }

  /** 画像分布：体型、风格偏好 */
  async profileDistribution() {
    let bodyTypes: { value: string; count: number }[] = [];
    let likedStyles: { value: string; count: number }[] = [];

    try {
      const bodyRows = await this.dataSource.query(
        `SELECT body_type AS value, COUNT(*) AS count
         FROM user_style_profiles
         WHERE body_type IS NOT NULL
         GROUP BY body_type
         ORDER BY count DESC`,
      );
      bodyTypes = bodyRows.map((r: any) => ({ value: r.value, count: parseInt(r.count) }));
    } catch {
      // 表不存在
    }

    try {
      // liked_styles 是 simple-array，用 unnest 展开
      const styleRows = await this.dataSource.query(
        `SELECT style AS value, COUNT(*) AS count
         FROM user_style_profiles, unnest(string_to_array(liked_styles, ',')) AS style
         WHERE liked_styles IS NOT NULL AND liked_styles != ''
         GROUP BY style
         ORDER BY count DESC
         LIMIT 10`,
      );
      likedStyles = styleRows.map((r: any) => ({ value: r.value, count: parseInt(r.count) }));
    } catch {
      // 表不存在或列不存在
    }

    return { bodyTypes, likedStyles };
  }

  /** 反馈统计：总数、like/dislike、平均评分、负面反馈列表 */
  async feedbackStats() {
    const total = await this.feedbackRepo.count();
    const likes = await this.feedbackRepo.count({ where: { reaction: 'like' } });
    const dislikes = await this.feedbackRepo.count({ where: { reaction: 'dislike' } });

    const avgResult = await this.feedbackRepo
      .createQueryBuilder('f')
      .select('AVG(f.rating)', 'avg')
      .where('f.rating > 0')
      .getRawOne();
    const avgRating = avgResult?.avg ? Math.round(parseFloat(avgResult.avg) * 10) / 10 : 0;

    // 负面反馈：dislike 或 rating <= 2
    const negative = await this.feedbackRepo
      .createQueryBuilder('f')
      .where('f.reaction = :reaction OR f.rating <= 2', { reaction: 'dislike' })
      .orderBy('f.createdAt', 'DESC')
      .take(20)
      .getMany();

    return { total, likes, dislikes, avgRating, negative };
  }

  /** AI 调用统计：次数、失败率、平均耗时、各 provider 占比 */
  async llmStats(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const total = await this.llmCallLogRepo
      .createQueryBuilder('l')
      .where('l.createdAt >= :since', { since })
      .getCount();

    const successCount = await this.llmCallLogRepo
      .createQueryBuilder('l')
      .where('l.createdAt >= :since', { since })
      .andWhere('l.status = :status', { status: 'success' })
      .getCount();

    const failedCount = await this.llmCallLogRepo
      .createQueryBuilder('l')
      .where('l.createdAt >= :since', { since })
      .andWhere('l.status != :status', { status: 'success' })
      .getCount();

    const avgResult = await this.llmCallLogRepo
      .createQueryBuilder('l')
      .select('AVG(l.elapsedMs)', 'avg')
      .where('l.createdAt >= :since', { since })
      .getRawOne();
    const avgElapsed = avgResult?.avg ? Math.round(parseFloat(avgResult.avg)) : 0;

    // 各 provider 占比
    const providerRows = await this.dataSource.query(
      `SELECT provider, COUNT(*) AS count
       FROM llm_call_logs
       WHERE created_at >= $1
       GROUP BY provider
       ORDER BY count DESC`,
      [since],
    );
    const providers = providerRows.map((r: any) => ({
      provider: r.provider,
      count: parseInt(r.count),
    }));

    const failRate = total > 0 ? Math.round((failedCount / total) * 1000) / 10 : 0;

    return {
      total,
      success: successCount,
      failed: failedCount,
      failRate,
      avgElapsed,
      providers,
    };
  }
}
