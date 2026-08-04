import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * AI 总结记忆 — 将用户长期行为总结为一段可供 AI 调用的摘要
 *
 * 避免每次都把所有历史数据传给 AI，用 summary 字段提供浓缩上下文。
 *
 * 示例摘要：
 * 用户偏好简约、通勤、干净利落的穿搭。
 * 喜欢黑白灰、浅蓝、米色。
 * 不喜欢过于甜美、复杂图案、粉色系。
 * 身材顾虑是显胖和腿型，偏好高腰、直筒、短外套。
 * 近期想补充适合上班的深色下装。
 * 多次反馈西装套装太正式，因此推荐时应降低正式感。
 */
@Entity('user_memory_summaries')
export class UserMemorySummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', unique: true })
  userId: string;

  /** AI 生成的用户摘要文本 */
  @Column({ type: 'text' })
  summary: string;

  /** 置信度 0-1，基于数据量计算 */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.3 })
  confidence: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
