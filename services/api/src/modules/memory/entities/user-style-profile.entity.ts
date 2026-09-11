import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 用户长期风格画像记忆
 *
 * "适合"与"喜欢"分开保存：
 * - suitableStyles: 适合的风格（基于身材/肤色等客观条件）
 * - likedStyles: 喜欢的风格（主观偏好）
 * - dislikedStyles: 明确不喜欢的风格
 *
 * 推荐时需综合"适合"与"喜欢"，而不是只按其中一个判断。
 */
@Entity('user_style_profiles')
export class UserStyleProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'varchar', unique: true })
  userId: string;

  /** 体型（pear / apple / hourglass / rectangle / inverted_triangle） */
  @Column({ name: 'body_type', type: 'varchar', nullable: true })
  bodyType: string;

  /** 身高区间（如 "160-165"） */
  @Column({ name: 'height_range', type: 'varchar', nullable: true })
  heightRange: string;

  /** 肤色色调（cool / warm / neutral） */
  @Column({ name: 'skin_tone', type: 'varchar', nullable: true })
  skinTone: string;

  /** 脸型风格描述 */
  @Column({ name: 'face_style', type: 'varchar', nullable: true })
  faceStyle: string;

  /** 适合的风格（客观条件推导） */
  @Column('simple-array', { name: 'suitable_styles', nullable: true })
  suitableStyles: string[];

  /** 喜欢的风格（主观偏好） */
  @Column('simple-array', { name: 'liked_styles', nullable: true })
  likedStyles: string[];

  /** 不喜欢的风格 */
  @Column('simple-array', { name: 'disliked_styles', nullable: true })
  dislikedStyles: string[];

  /** 偏好的颜色 */
  @Column('simple-array', { name: 'preferred_colors', nullable: true })
  preferredColors: string[];

  /** 不喜欢的颜色 */
  @Column('simple-array', { name: 'disliked_colors', nullable: true })
  dislikedColors: string[];

  /** 身材顾虑（如 "显胖"、"腿型"、"肩宽"） */
  @Column('simple-array', { name: 'body_concerns', nullable: true })
  bodyConcerns: string[];

  /** 穿搭目标（如 "显瘦"、"显高"、"通勤"、"舒适"） */
  @Column('simple-array', { name: 'dress_goals', nullable: true })
  dressGoals: string[];

  /** 常见穿搭场景 */
  @Column('simple-array', { name: 'common_occasions', nullable: true })
  commonOccasions: string[];

  /**
   * 避坑规则 JSON
   * 示例: [{ "rule": "避免宽松上衣+宽松下装", "source": "feedback:太显胖", "weight": 3 }]
   */
  @Column('json', { name: 'avoid_rules', nullable: true })
  avoidRules: Array<{ rule: string; source: string; weight: number }>;

  // ============== M14 教练模式字段 ==============

  /**
   * 穿搭水平自评 (0-10)
   * 0=完全不懂  5=知道基本规则  10=非常专业
   * 由 onboarding 第 1 步的滑块问题得到
   */
  @Column({ name: 'style_proficiency', type: 'int', nullable: true })
  styleProficiency: number | null;

  /**
   * 用户困惑类型 JSON 数组
   * ['buy' | 'wear' | 'match'] 的任意子集（多选）
   * - 'buy':   不知道怎么买衣服
   * - 'wear':  不知道怎么穿（什么场合穿什么）
   * - 'match': 不知道怎么搭（单品组合）
   * 由 onboarding 第 1 步的"你最困惑什么？"问题得到
   * 决定 AI 教练子模式：shopping / occasion / combination / mixed
   */
  @Column('json', { name: 'confusion_types', nullable: true })
  confusionTypes: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
