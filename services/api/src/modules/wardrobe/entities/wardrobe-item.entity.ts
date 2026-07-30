import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wardrobe_items')
export class WardrobeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['top', 'bottom', 'outerwear', 'dress', 'shoes', 'accessory'],
  })
  category: string;

  @Column({ name: 'sub_category', nullable: true })
  subCategory: string;

  @Column()
  color: string;

  @Column({ name: 'color_hex', nullable: true })
  colorHex: string;

  @Column({ nullable: true })
  pattern: string;

  @Column({ nullable: true })
  material: string;

  @Column('simple-array', { nullable: true })
  season: string[];

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  size: string;

  @Column('simple-array', { name: 'image_urls', nullable: true })
  imageUrls: string[];

  @Column('simple-json', { name: 'ai_tags', nullable: true })
  aiTags: Record<string, unknown>;

  @Column({ name: 'purchase_url', nullable: true })
  purchaseUrl: string;

  @Column({
    type: 'enum',
    enum: ['available', 'washing', 'donated', 'archived'],
    default: 'available',
  })
  status: string;

  @Column({ name: 'wear_count', default: 0 })
  wearCount: number;

  // --- Phase 1 新增字段：AI 结构化标签 ---
  @Column('simple-array', { name: 'style_tags', nullable: true })
  styleTags: string[];

  @Column('simple-array', { name: 'occasion_tags', nullable: true })
  occasionTags: string[];

  @Column({ name: 'formality_score', default: 3 })
  formalityScore: number;

  @Column({ name: 'warmth_score', default: 3 })
  warmthScore: number;

  @Column({ name: 'matchability_score', default: 5 })
  matchabilityScore: number;

  @Column({ name: 'fit_risk', nullable: true })
  fitRisk: string;

  @Column('simple-array', { name: 'match_colors', nullable: true })
  matchColors: string[];

  @Column('simple-array', { name: 'match_categories', nullable: true })
  matchCategories: string[];

  @Column({ name: 'ai_summary', nullable: true })
  aiSummary: string;

  @Column({ name: 'last_worn_at', type: 'timestamptz', nullable: true })
  lastWornAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
