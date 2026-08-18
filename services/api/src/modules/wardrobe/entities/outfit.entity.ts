import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('outfits')
export class Outfit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column('simple-json')
  items: Array<{ itemId: string; position: number }>;

  @Column('simple-array', { nullable: true })
  occasion: string[];

  @Column('simple-array', { nullable: true })
  season: string[];

  @Column('simple-array', { name: 'style_tags', nullable: true })
  styleTags: string[];

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ name: 'is_ai_generated', type: 'boolean', default: false })
  isAiGenerated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // --- 今天穿什么 新增字段 ---

  /** 穿搭标题，AI 生成的简短描述（如"稳妥通勤·针织衫+阔腿裤"） */
  @Column({ type: 'varchar', nullable: true })
  title: string;

  /** 生成时的天气信息快照 */
  @Column('simple-json', { nullable: true })
  weather: Record<string, unknown>;

  /** 风格目标（显瘦/显高/舒服/精致等） */
  @Column({ name: 'style_goal', type: 'varchar', nullable: true })
  styleGoal: string;

  /** AI 评分 1-100 */
  @Column({ type: 'int', nullable: true })
  score: number;

  /** AI 推荐理由 */
  @Column({ name: 'ai_reason', type: 'text', nullabl