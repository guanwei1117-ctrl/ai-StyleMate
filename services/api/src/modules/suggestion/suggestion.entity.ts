import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type SuggestionCategory = 'bug' | 'feature' | 'other';
export type SuggestionStatus = 'new' | 'viewed';

/**
 * 用户建议表 —— 用户通过全局悬浮按钮提交的单向建议。
 * userId 可空（未登录用户也能提建议）。
 */
@Entity('suggestions')
export class Suggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'text', nullable: true })
  userId: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['bug', 'feature', 'other'], default: 'other' })
  category: SuggestionCategory;

  @Column({ type: 'enum', enum: ['new', 'viewed'], default: 'new' })
  status: SuggestionStatus;

  @Column({ name: 'page_url', type: 'varchar', nullable: true, length: 512 })
  pageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
