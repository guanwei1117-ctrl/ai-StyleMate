import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 行为反馈记忆 — 记录用户每次对穿搭/商品的反馈
 *
 * 反馈类型包括：喜欢、不喜欢、今天穿了、太显胖、太正式、太普通、不舒服、颜色不喜欢、场合不合适
 * 这些反馈会影响后续推荐权重和避坑规则。
 */
@Entity('outfit_feedbacks')
export class OutfitFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  /** 关联的穿搭方案 ID（可选） */
  @Column({ name: 'outfit_id', type: 'varchar', nullable: true })
  outfitId: string;

  /** 关联的衣橱单品 ID 列表 */
  @Column('simple-array', { name: 'item_ids', nullable: true })
  itemIds: string[];

  /**
   * 反馈类型
   * like | dislike | worn_today | too_fat | too_formal | too_plain | uncomfortable | color_dislike | occasion_mismatch
   */
  @Column({
    name: 'feedback_type',
    type: 'enum',
    enum: [
      'like',
      'dislike',
      'worn_today',
      'too_fat',
      'too_formal',
      'too_plain',
      'uncomfortable',
      'color_dislike',
      'occasion_mismatch',
    ],
  })
  feedbackType: string;

  /** 反馈原因 / 文字说明 */
  @Column({ type: 'text', nullable: true })
  reason: string;

  /** 反馈关联的方案快照（JSON，便于后续分析） */
  @Column('json', { nullable: true })
  context: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
