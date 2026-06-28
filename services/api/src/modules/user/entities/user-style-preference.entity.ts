import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_style_preferences')
export class UserStylePreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column('simple-array', { name: 'preferred_styles', nullable: true })
  preferredStyles: string[];

  @Column('simple-array', { name: 'disliked_styles', nullable: true })
  dislikedStyles: string[];

  @Column({
    name: 'budget_level',
    type: 'enum',
    enum: ['budget', 'mid', 'premium'],
    default: 'mid',
  })
  budgetLevel: string;

  @Column('simple-array', { name: 'favorite_colors', nullable: true })
  favoriteColors: string[];
}
