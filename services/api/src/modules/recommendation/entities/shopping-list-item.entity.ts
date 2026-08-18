import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 购物清单单品
 *
 * 来源：
 *  - gap-analysis：衣橱缺口分析建议
 *  - starter-plan：空衣橱起步方案建议
 *  - item-styling：单品搭配的建议补充单品
 *  - manual：手动添加
 */
@Entity('shopping_list_items')
@Index(['userId', 'purchased'])
export class ShoppingListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  /** 品类 */
  @Column({ type: 'varchar' })
  category: string;

  /** 二级子类（如"大衣""托特包"） */
  @Column({ name: 'sub_category', type: 'varchar', nullable: true })
  subCategory?: string;

  /** 具体描述（颜色+品类，如"驼色羊毛大衣"） */
  @Column({ type: 'varchar', nullable: true })
  description?: string;

  /** 颜色 */
  @Column({ type: 'varchar', nullable: true })
  color?: string;

  /** 预算区间（如"¥400-800"） */
  @Column({ name: 'budget_range', type: 'varchar', nullable: true })
  budgetRange?: string;

  /** 优先级 1=先买 2=其次 3=可缓 */
  @Column({ type: 'int', default: 2 })
  priority: number;

  /** 为什么需要 */
  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  /** 是否已购买 */
  @Column({ type: 'boolean', default: false })
  purchased: boolean;

  /** 来源 */
  @Column({ type: 'varchar', nullable: true })
  source?: string;

  @CreateDateColumn({ name: 'cr