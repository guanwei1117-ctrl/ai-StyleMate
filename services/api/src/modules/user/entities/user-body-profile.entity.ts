import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_body_profiles')
export class UserBodyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'body_shape',
    type: 'enum',
    enum: ['pear', 'apple', 'hourglass', 'rectangle', 'inverted_triangle'],
    nullable: true,
  })
  bodyShape: string;

  @Column({
    name: 'skin_tone',
    type: 'enum',
    enum: ['cool', 'warm', 'neutral'],
    nullable: true,
  })
  skinTone: string;

  @Column({
    name: 'skin_season_type',
    type: 'enum',
    enum: ['spring', 'summer', 'autumn', 'winter'],
    nullable: true,
  })
  skinSeasonType: string;

  @Column({ name: 'shoulder_width', type: 'decimal', precision: 5, scale: 1, nullable: true })
  shoulderWidth: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  chest: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  waist: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  hip: number;
}
