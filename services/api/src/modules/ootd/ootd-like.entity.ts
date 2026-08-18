import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('ootd_likes')
@Index(['postId'])
@Index(['userId', 'postId'], { unique: true })
export class OotdLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'post_id', type: 'varchar' })
  postId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
