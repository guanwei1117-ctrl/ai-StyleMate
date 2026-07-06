import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 用户生活方式画像 — 现实约束 + 行为偏好
 *
 * 审美适配（user_body_profiles）+ 现实约束 + 行为偏好 = 完整用户画像
 */
@Entity('user_lifestyle_profiles')
export class UserLifestyleProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'age_group',
    type: 'enum',
    enum: ['under_18', '18_24', '25_29', '30_39', '40_49', '50_plus'],
    nullable: true,
  })
  ageGroup: string;

  @Column({ name: 'occupation', type: 'varchar', length: 64, nullable: true })
  occupation: string;

  @Column({ name: 'city', type: 'varchar', length: 64, nullable: true })
  city: string;

  @Column({
    name: 'climate',
    type: 'enum',
    enum: ['cold', 'mild', 'hot', 'variable'],
    nullable: true,
  })
  climate: string;

  @Column({ name: 'monthly_budget_min', type: 'int', nullable: true })
  monthlyBudgetMin: number;

  @Column({ name: 'monthly_budget_max', type: 'int', nullable: true })
  monthlyBudgetMax: number;

  @Column({
    name: 'budget_level',
    type: 'enum',
    enum: ['budget', 'mid', 'premium'],
    default: 'mid',
  })
  budgetLevel: string;

  @Column('simple-array', { name: 'dressing_goals', nullable: true })
  dressingGoals: string[];

  @Column('simple-array', { name: 'priorities', nullable: true })
  priorities: string[];

  @Column({ name: 'style_openness', type: 'int', nullable: true })
  styleOpenness: number;

  @Column({ name: 'open_to_new_styles', type: 'boolean', nullable: true })
  openToNewStyles: boolean;
}
