import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('outfits')
export class Outfit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column('simple-json')
  items: Array<{ itemId: string; position: number }>;

  @Column('simple-array', { nullable: true })
  occasion: string[];

  @Column('simple-array', { nullable: true })
  season: string[];

  @Column('simple-array', { name: 'style_tags', nullable: true })
  styleTags: string[];

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'is_ai_generated', default: false })
  isAiGenerated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
