import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * OOTD 社区帖子
 *
 * imageData 存分享卡图片的 base64 data URL（MVP 方案，量大了再上对象存储）。
 */
@Entity('ootd_posts')
@Index(['createdAt'])
export class OotdPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  /** 分享卡图片 data URL（JPEG/PNG base64） */
  @Column({ name: 'image_data', type: 'text' })
  imageData: string;

  /** 文案（默认取诊断整体评价） */
  @Column({ type: 'text', nullable: true })
  caption?: string;

  /** 平均分（0-100） */
  @Column({ name: 'score_avg', type: 'int', nullable: true })
  scoreAvg?: number;

  /** 8 维评分快照 JSON（字符串） */
  @Column({ name: 'score_json', type: 'text', nullable: true })
  scoreJson?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
