// ============================================================
// StyleMate 共享类型定义
// ============================================================

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
  wearCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ClothingCategory = 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory';

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

/** 风格适配维度详情 */
export interface DimensionMatch {
  dimension: 'bone_structure' | 'volume_sense' | 'body_type' | 'skin_tone' | 'temperament';
  score: number;          // 0-100
  level: 'excellent' | 'good' | 'moderate' | 'weak';
  reasoning: string;      // 中文解释
  tips: string;           // 调整建议
}

/** 风格匹配结果 */
export interface StyleMatchResult {
  styleId: string;
  styleName: string;
  overallScore: number;         // 0-100 加权总分
  category: 'core' | 'explore' | 'challenge';
  dimensions: DimensionMatch[];
  summary: string;               // 一句话总结
  recommendedItems: string[];    // 推荐标志单品
  colorPalette: string[];        // 推荐色系 hex
  difficulty: number;            // 1-5 入门难度
}

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
