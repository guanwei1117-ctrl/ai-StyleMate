// ============================================================
// StyleMate 共享类型定义
// ============================================================

// ---------- 衣物分类体系 ----------
export * from './categories';
import type { ClothingCategory } from './categories';

// ---------- 用户相关 ----------
export interface User {
  id: string;
  phone?: string;
  email?: string;
  wechatOpenId?: string;
  nickname: string;
  avatarUrl?: string;
  gender: 'male' | 'female' | 'other' | null;
  birthday?: string;
  height?: number; // cm
  weight?: number; // kg
  createdAt: string;
  updatedAt: string;
}

export interface UserBodyProfile {
  id: string;
  userId: string;
  bodyShape: BodyShape | null;
  skinTone: SkinTone | null;
  skinSeasonType: SkinSeasonType | null;
  shoulderWidth?: number;
  chest?: number;
  waist?: number;
  hip?: number;
}

export type BodyShape = 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted_triangle';
export type SkinTone = 'cool' | 'warm' | 'neutral';
export type SkinSeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export interface UserStylePreference {
  id: string;
  userId: string;
  preferredStyles: StyleType[];
  dislikedStyles: StyleType[];
  budgetLevel: 'budget' | 'mid' | 'premium';
  favoriteColors: string[];
}

export type StyleType =
  | 'japanese'
  | 'korean'
  | 'french'
  | 'american'
  | 'minimal'
  | 'street'
  | 'y2k'
  | 'vintage'
  | 'business'
  | 'sporty';

// ---------- 用户生活方式画像（现实约束 + 行为偏好） ----------

/** 年龄段 */
export type AgeGroup =
  | 'under_18'    // 18岁以下
  | '18_24'       // 18-24
  | '25_29'       // 25-29
  | '30_39'       // 30-39
  | '40_49'       // 40-49
  | '50_plus';    // 50岁以上

/** 穿衣目标（多选） */
export type DressingGoal =
  | 'look_polished'        // 看起来得体精致
  | 'express_personality'  // 表达个性
  | 'comfort_first'        // 舒适至上
  | 'look_slim'            // 显瘦显高
  | 'professional'         // 职场专业感
  | 'try_new_style'        // 尝试新风格
  | 'build_wardrobe';      // 建立精简胶囊衣橱

/** 穿衣优先级维度（排序） */
export type PriorityDimension = 'comfort' | 'slimming' | 'texture' | 'personality';

/** 气候区域（由城市推导或手填） */
export type ClimateZone = 'cold' | 'mild' | 'hot' | 'variable';

/**
 * 用户生活方式画像 — 现实约束 + 行为偏好
 *
 * 与 UserBodyProfile（审美适配）共同构成完整画像：
 *   审美适配（体型/肤色）+ 现实约束（年龄/场景/气候/预算）+ 行为偏好（目标/优先级/接受度）
 *
 * 核心理念：适合 ≠ 会穿。一个人适合法式，不代表愿意天天穿法式；
 *           适合极简，不代表预算支持高质感极简单品。
 */
export interface UserLifestyleProfile {
  id: string;
  userId: string;
  /** 年龄段（必填） */
  ageGroup: AgeGroup | null;
  /** 职业 / 使用场景（选填） */
  occupation?: string;
  /** 所在城市（选填） */
  city?: string;
  /** 气候区域（选填，由城市推导或手填） */
  climate?: ClimateZone;
  /** 月度服装预算下限（选填，元） */
  monthlyBudgetMin?: number;
  /** 月度服装预算上限（选填，元） */
  monthlyBudgetMax?: number;
  /** 单件预算档位（与 UserStylePreference.budgetLevel 对齐） */
  budgetLevel: 'budget' | 'mid' | 'premium';
  /** 穿衣目标（必填多选） */
  dressingGoals: DressingGoal[];
  /** 优先级排序（必填：舒适度/显瘦/质感/个性，按重要性从高到低） */
  priorities: PriorityDimension[];
  /** 风格接受度（选填）：愿意尝试的风格强度 1-5，5 为最高 */
  styleOpenness?: number;
  /** 是否愿意尝试新风格（选填） */
  openToNewStyles?: boolean;
}

// ---------- 衣橱相关 ----------
export interface WardrobeItem {
  id: string;
  userId: string;
  category: ClothingCategory;
  subCategory?: string;
  color: string;
  colorHex?: string;
  pattern?: string;
  material?: string;
  season: Season[];
  brand?: string;
  size?: string;
  imageUrls: string[];
  aiTags?: AITags;
  purchaseUrl?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type ItemStatus = 'available' | 'washing' | 'donated' | 'archived';

export interface AITags {
  styleType?: StyleType;
  occasion?: Occasion[];
  colorFamily?: string;
  texture?: string;
  fit?: 'loose' | 'regular' | 'slim' | 'oversized';
}

// ---------- 搭配相关 ----------
export interface Outfit {
  id: string;
  userId: string;
  name: string;
  items: OutfitItem[];
  occasion: Occasion[];
  season: Season[];
  styleTags: StyleType[];
  imageUrl?: string;
  isAiGenerated: boolean;
  createdAt: string;
}

export interface OutfitItem {
  itemId: string;
  position: number; // 穿着顺序
}

export type Occasion =
  | 'daily_commute'
  | 'date'
  | 'interview'
  | 'sport'
  | 'vacation'
  | 'banquet'
  | 'casual'
  | 'party';

// ---------- OOTD 记录 ----------
export interface OOTDRecord {
  id: string;
  userId: string;
  outfitId?: string;
  date: string;
  weather?: WeatherInfo;
  occasion: Occasion;
  rating?: number;
  notes?: string;
  imageUrls: string[];
}

export interface WeatherInfo {
  temperature: number;
  condition: string; // sunny, cloudy, rainy, etc.
  humidity?: number;
}

// ---------- AI 推荐相关 ----------
export interface RecommendationRequest {
  userId: string;
  occasion?: Occasion;
  weather?: WeatherInfo;
  date?: string;
  budget?: 'budget' | 'mid' | 'premium';
}

export interface RecommendationResult {
  outfits: Outfit[];
  reasoning: string;
  missingItems?: string[];
  shoppingSuggestions?: ShoppingSuggestion[];
}

export interface ShoppingSuggestion {
  category: ClothingCategory;
  reason: string;
  styleDescription: string;
  budgetRange: string;
}

// ---------- 风格 DNA 系统 ----------

/** 脸型 */
export type FaceShape = 'round' | 'oval' | 'square' | 'heart' | 'long' | 'diamond';

/** 五官线条 — 锐度与曲直 */
export type FacialLineType = 'sharp' | 'blunt' | 'straight' | 'curved' | 'mixed';

/** 骨架粗细 */
export type FrameSize = 'light' | 'medium' | 'heavy';

/** 量感 — 五官存在感的强弱（面部留白多少） */
export type VolumeSense = 'low' | 'medium_low' | 'medium' | 'medium_high' | 'high';

/** 身高类别 */
export type HeightCategory = 'petite' | 'average' | 'tall';

/** 肤色季型（十二季型精简版） */
export type ColorSeason =
  | 'spring_light'   // 浅春 — 暖调浅色
  | 'spring_warm'    // 暖春 — 暖调鲜亮
  | 'summer_light'   // 浅夏 — 冷调浅色
  | 'summer_cool'    // 冷夏 — 冷调柔和
  | 'autumn_warm'    // 暖秋 — 暖调浓郁
  | 'autumn_deep'    // 深秋 — 深暖色
  | 'winter_cool'    // 冷冬 — 冷调鲜明
  | 'winter_deep';   // 深冬 — 深冷色

/** 原生气质 */
export type Temperament =
  | 'gentle'      // 温柔
  | 'capable'     // 干练
  | 'cool'        // 清冷
  | 'lively'      // 活泼
  | 'steady'      // 沉稳
  | 'artistic';   // 文艺

/** 用户风格 DNA — 五维度画像 */
export interface UserStyleDNA {
  /** 骨相维度 */
  boneStructure: {
    faceShape: FaceShape;
    facialLineType: FacialLineType;
    frameSize: FrameSize;
  };
  /** 量感维度 */
  volumeSense: VolumeSense;
  /** 体型维度 */
  bodyType: {
    shape: BodyShape;
    heightCategory: HeightCategory;
    height: number; // cm
    weight: number; // kg
  };
  /** 肤色维度 */
  skinTone: {
    baseTone: SkinTone;
    colorSeason: ColorSeason;
    contrastLevel: 'low' | 'medium' | 'high';
  };
  /** 气质维度 */
  temperament: {
    primary: Temperament;
    secondary: Temperament;
    lifestyle: Lifestyle[];
  };
}

export type Lifestyle =
  | 'office_9to5'
  | 'student'
  | 'creative_freelancer'
  | 'stay_at_home'
  | 'social_butterfly'
  | 'outdoor_enthusiast'
  | 'urban_commuter';

/** 风格适配维度详情（后端五维） */
export interface DimensionMatch {
  dimension: 'bone_structure' | 'volume_sense' | 'body_type' | 'skin_tone' | 'temperament';
  score: number;          // 0-100
  level: 'excellent' | 'good' | 'moderate' | 'weak';
  reasoning: string;      // 中文解释
  tips: string;           // 调整建议
}

/** 三支柱评分明细（前端） */
export interface PillarBreakdown {
  bodyShape: number;   // 0-20
  preference: number;  // 0-25
  skinTone: number;    // 0-5
  budget: number;      // 0-12
  ageFit: number;      // 0-8
  scene: number;       // 0-10
  priority: number;    // 0-10
  goal: number;        // 0-5
  openness: number;    // 0-5
}

/** 三支柱汇总（前端） */
export interface PillarSummary {
  aesthetic: number;   // 审美适配 0-50
  realistic: number;   // 现实约束 0-30
  behavioral: number;  // 行为偏好 0-20
}

/**
 * 统一风格匹配结果
 *
 * 同时包含：
 * - 后端五维详情（dimensions）
 * - 前端三支柱摘要（matchBreakdown + pillars）
 * - 公共字段（styleId, styleName, score, category 等）
 */
export interface UnifiedStyleMatch {
  styleId: string;
  styleName: string;
  /** 综合得分 0-100 */
  score: number;
  /** 匹配分类 */
  category: string;
  /** 匹配理由 */
  matchReasons: string[];
  /** 后端五维详情 */
  dimensions: DimensionMatch[];
  /** 前端三支柱明细 */
  matchBreakdown: PillarBreakdown;
  /** 前端三支柱汇总 */
  pillars: PillarSummary;
  /** 一句话总结 */
  summary: string;
  /** 推荐标志单品 */
  recommendedItems: string[];
  /** 推荐色系 hex */
  colorPalette: string[];
  /** 入门难度 1-5 */
  difficulty: number;
}

/** 向后兼容别名 */
export type StyleMatchResult = UnifiedStyleMatch;

/** 用户风格分析报告 */
export interface StyleAnalysisReport {
  userDNA: UserStyleDNA;
  matches: StyleMatchResult[];
  coreStyles: StyleMatchResult[];      // 得分 70+
  exploreStyles: StyleMatchResult[];   // 得分 50-70
  challengeStyles: StyleMatchResult[]; // 得分 <50
  roadmap: StyleRoadmapStep[];
}

/** 风格路线图步骤 */
export interface StyleRoadmapStep {
  phase: 1 | 2 | 3;
  title: string;
  description: string;
  styles: string[];
  focus: string;
}

// ---------- API 通用响应 ----------
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================
// 统一风格系统（前后端共享）
// ============================================================

/** 风格四大维度（前端分类） */
export type StyleDimension = '地域文化' | '视觉元素' | '场景圈层' | '人物原型';

/** 风格子类标签（前端分类） */
export type StyleCategory = string;

/** 风格卡片（前端展示用） */
export interface StyleCard {
  id: string;
  name: string;
  dimension: StyleDimension;
  category: string;
  description: string;
  philosophy: string;
  difficulty: number;
  silhouette: string[];
  keyItems: string[];
  colorPalette: string[];
  imageUrl?: string;
}

/** 后端风格分类 */
export type BackendStyleCategory =
  | 'japanese' | 'korean' | 'european' | 'american' | 'chinese'
  | 'minimal' | 'street' | 'feminine' | 'vintage' | 'avant_garde';

/** 骨骼结构规则 */
export interface BoneStructureRules {
  idealFaceShapes: string[];
  adaptableFaceShapes: string[];
  idealFacialLines: string[];
  adaptableFacialLines: string[];
  idealFrameSizes: string[];
  adaptableFrameSizes: string[];
}

/** 量感规则 */
export interface VolumeSenseRules {
  importance: number;
  ideal: string[];
  adaptable: string[];
}

/** 体型规则 */
export interface BodyTypeRules {
  importance: number;
  idealBodyShapes: string[];
  adaptableBodyShapes: string[];
  idealHeight: string[];
  adaptableHeight: string[];
  flatteringPower: 'strong' | 'moderate' | 'limited';
  flatteringNote: string;
}

/** 肤色规则 */
export interface SkinToneRules {
  importance: number;
  idealSeasons: string[];
  adaptableSeasons: string[];
  idealContrast: string[];
  adaptableContrast: string[];
  colorFamily: string[];
  avoidColors: string[];
  colorNote: string;
}

/** 气质规则 */
export interface TemperamentRules {
  importance: number;
  idealTemperaments: string[];
  adaptableTemperaments: string[];
  idealLifestyles: string[];
  adaptableLifestyles: string[];
  innerRequirement: string;
}

/** 统一风格定义（合并前端 StyleCard + 后端 StyleDefinition） */
export interface UnifiedStyleDefinition {
  id: string;
  name: string;
  alias?: string[];
  dimension?: StyleDimension;
  category: string;
  backendCategory?: BackendStyleCategory;
  description: string;
  philosophy: string;
  difficulty: number;
  silhouette: string[];
  keyItems: string[];
  colorPalette: string[];
  details?: string[];
  imageUrl?: string;
  /** 五维适配规则（后端使用） */
  boneRules?: BoneStructureRules;
  volumeRules?: VolumeSenseRules;
  bodyRules?: BodyTypeRules;
  skinRules?: SkinToneRules;
  temperamentRules?: TemperamentRules;
}

// ============================================================
// AI 自动评分系统类型
// ============================================================

/** 评分维度键名 */
export type ScoringDimensionKey =
  | 'proportion'
  | 'color'
  | 'occasion'
  | 'coherence'
  | 'trend'
  | 'creativity'
  | 'bodyFit'
  | 'practicality';

/** 评分维度定义 */
export interface ScoringDimension {
  key: ScoringDimensionKey;
  label: string;
  description: string;
  maxScore: number;
  rubric: string;
}

/** 维度评分结果 */
export interface DimensionScore {
  key: ScoringDimensionKey;
  label: string;
  score: number;
  comment: string;
}

/** 评分请求 */
export interface EvaluateOutfitRequest {
  /** 穿搭照片 base64 */
  imageBase64: string;
  /** 用户上下文（可选） */
  userContext?: {
    bodyShape?: string;
    gender?: string;
    height?: number;
    weight?: number;
    occasion?: string;
  };
}

/** 结构化穿搭分析 — 单品项 */
export interface StructuredOutfitItem {
  type: ClothingCategory;
  name: string;
  color: string;
  style: string[];
  season: string[];
  formality: number;
  matchability: number;
}

/** 结构化穿搭分析结果 */
export interface StructuredOutfitResult {
  items: StructuredOutfitItem[];
  body_suggestions: string[];
  style_tags: string[];
  problems: string[];
  improvements: string[];
}

/** 评分响应 */
export interface EvaluateOutfitResponse {
  greeting: string;
  overallComment: string;
  dimensions: DimensionScore[];
  itemComments: string[];
  improvements: string[];
  /** 结构化分析结果（Phase 1 新增），用于数字衣柜/推荐等功能复用 */
  structured?: StructuredOutfitResult;
}
