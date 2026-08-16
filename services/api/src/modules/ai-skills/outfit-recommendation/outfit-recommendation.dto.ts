/**
 * 穿搭推荐 AI Skill
 *
 * 输入：用户衣橱单品摘要 + 天气 + 场合 + 风格目标 + 限制条件 + 长期记忆上下文
 * 输出：3 套穿搭方案（稳妥/显瘦显高/氛围感）
 */

export interface OutfitRecommendationItem {
  /** 引用的衣橱单品 ID */
  itemId: string;
  /** 品类 */
  category: string;
  /** 简述（如"白色棉质 T 恤"） */
  description: string;
}

export interface OutfitRecommendationPlan {
  /** 方案类型：safe / flattering / vibe */
  type: 'safe' | 'flattering' | 'vibe';
  /** 方案标题 */
  title: string;
  /** 帽子 */
  hat: OutfitRecommendationItem | null;
  /** 上衣 */
  top: OutfitRecommendationItem | null;
  /** 下装 */
  bottom: OutfitRecommendationItem | null;
  /** 外套 */
  outerwear: OutfitRecommendationItem | null;
  /** 鞋子 */
  shoes: OutfitRecommendationItem | null;
  /** 包 */
  bag: OutfitRecommendationItem | null;
  /** 配饰（腰带/项链等） */
  accessory: OutfitRecommendationItem | null;
  /** 为什么适合今天 */
  reason: string;
  /** 适合什么场景 */
  scene: string;
  /** 风险提醒 */
  riskWarning: string;
  /** 评分 1-100 */
  score: number;
}

export interface OutfitRecommendationInput {
  /** 衣橱单品摘要列表 */
  wardrobeItems: Array<{
    id: string;
    category: string;
    subCategory: string;
    color: string;
    material: string;
    season: string[];
    styleTags: string[];
    occasionTags: string[];
    formalityScore: number;
    warmthScore: number;
    matchabilityScore: number;
    matchColors: string[];
    matchCategories: string[];
  }>;
  /** 天气信息 */
  weather: {
    city: string;
    condition: string;
    temperature: number;
    apparentTemperature: number;
    windSpeed: number;
    humidity: number;
    isRaining: boolean;
  };
  /** 场合 */
  occasion: string;
  /** 风格目标 */
  styleGoal: string;
  /** 用户限制条件 */
  constraints: string[];
  /** 长期记忆上下文（AI 调用前读取） */
  memoryContext?: import('../../memory/memory.dto').AIMemoryContext | null;
}

export interface OutfitRecommendationResult {
  plans: OutfitRecommendationPlan[];
}
