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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
