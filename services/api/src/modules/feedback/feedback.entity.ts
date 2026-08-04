import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * 用户反馈表 —— 长期记忆的一部分。
 * 每次推荐后用户给出的「喜欢 / 不喜欢 + 评分 + 文字」，
 * 会被持久化下来，用于后续推荐的自适应修正。
 */
@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 16, default: 'like' })
  reaction: 'like' | 'dislike';

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'varchar', nullable: true })
  planTitle: string;

  @Column({ type: 'json', nullable: true })
  plan: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
