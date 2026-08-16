import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 用户本地数据同步条目（周计划 / 风格档案等）
 *
 * key 取值：
 *  - weekPlan     周穿搭计划（stylemate.plan）
 *  - styleProfile 风格档案（stylemate.styleProfile.v1）
 *
 * value 存 JSON 字符串；updatedAt 为客户端写入时间（用于跨设备合并）。
 */
@Entity('user_sync_entries')
@Index(['userId', 'key'], { unique: true })
export class UserSyncEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  key: string;

  @Column({ type: 'text' })
  value: string;

  /** 客户端写入时间（ISO），用于"谁新用谁"合并 */
  @Column({ name: 'client_updated_at' })
  clientUpdatedAt: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
