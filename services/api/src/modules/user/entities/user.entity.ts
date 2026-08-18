import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ name: 'wechat_open_id', type: 'varchar', unique: true, nullable: true })
  wechatOpenId: string;

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'date', nullable: true })
  birthday: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true, select: false })
  passwordHash: string;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  weight: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
