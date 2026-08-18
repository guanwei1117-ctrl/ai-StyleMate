import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 当前意图记忆 — 用户近期正在关注的穿搭或购物目标
 *
 * 示例：用户最近在找一条通勤裤，下次打开 App 时系统继续围绕此需求服务。
 */
@Entity('user_current_intents')
export class UserCurrentIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'varchar', unique: true })
  userId: string;

  /** 正在寻找什么（如 "通勤裤"、"白色衬衫"） */
  @Column({ name: 'looking_for', type: 'varchar', nullable: true })
  lookingFor: string;

  /** 预算范围 JSON: { min, max, currency } */
  @Column('json', { name: 'budget_range', nullable: true })
  budgetRange: { min?: number; max?: number; currency?: string };

  /** 目标场景（如 "通勤"、"约会"） */
  @Column({ name: 'target_occasion', type: 'varchar', nullable: true })
  targetOccasion: string;

  /** 偏好品牌列表 */
  @Column('simple-array', { name: 'preferred_brands', nullable: true })
  preferredBrands: string[];

  /** 近期被拒绝的商品（AI 判断过但不买的） */
  @Column('json', { name: 'recent_rejected_items', nullable: true })
  recentRejectedItems: Array<{ name: string; reason: string; at: string }>;

  /** 近期购买候选 */
  @Column('json', { name: 'recent_purchase_candidates', nullable: true })
  recentPurchaseCandidates: Array<{ name: string; reason: string; at: string }>;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
