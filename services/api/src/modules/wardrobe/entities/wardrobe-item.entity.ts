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

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['top', 'outerwear', 'bottom', 'dress', 'shoes', 'bag', 'hat', 'accessory'],
  })
  category: string;

  @Column({ name: 'sub_category', type: 'varchar', nullable: true })
  subCategory: string;

  @Column({ type: 'varchar' })
  color: string;

  @Column({ name: 'color_hex', type: 'varchar', nullable: true })
  colorHex: string;

  @Column({ type: 'varchar', nullable: true })
  pattern: string;

  @Column({ type: 'varchar', nullable: true })
  material: string;

  @Column('simple-array', { nullable: true })
  season: string[];

  @Column({ type: 'varchar', nullable: true })
  brand: string;

  @Column({ type: 'varchar', nullable: true })
  size: string;

  @Column({ name: 'image_urls', type: 'text', nullable: true, transformer: {
    to: (value: string[]) => value?.length ? JSON.stringify(value) : null,
    from: (value: string | null) => {
      if (!value) return [];
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
      catch { return []; }
    },
  }})
  imageUrls: string[];

  @Column('simple-json', { name: 'ai_tags', nullable: true })
  aiTags: Record<string, unknown>;

  @Column({ name: 'purchase_url', type: 'varchar', nullable: true })
  purchaseUrl: string;

  @Column({
    type: 'enum',
    enum: ['available', 'washing', 'donated', 'archived'],
    default: 'available',
  })
  status: string;

  // --- Phase 1 新增字段：AI 结构化标�?---
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

  @Column({ name: 'ai_summary', type: 'varchar', nullable: true })
  aiSummary: string;

  @Column({ name: 'last_worn_at', type: 'timestamptz', nullable: true })
  lastWornAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}