export interface User {
    id: string;
    phone?: string;
    email?: string;
    wechatOpenId?: string;
    nickname: string;
    avatarUrl?: string;
    gender: 'male' | 'female' | 'other' | null;
    birthday?: string;
    height?: number;
    weight?: number;
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
export type StyleType = 'japanese' | 'korean' | 'french' | 'american' | 'minimal' | 'street' | 'y2k' | 'vintage' | 'business' | 'sporty';
/** 年龄段 */
export type AgeGroup = 'under_18' | '18_24' | '25_29' | '30_39' | '40_49' | '50_plus';
/** 穿衣目标（多选） */
export type DressingGoal = 'look_polished' | 'express_personality' | 'comfort_first' | 'look_slim' | 'professional' | 'try_new_style' | 'build_wardrobe';
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
    position: number;
}
export type Occasion = 'daily_commute' | 'date' | 'interview' | 'sport' | 'vacation' | 'banquet' | 'casual' | 'party';
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
    condition: string;
    humidity?: number;
}
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
export type ColorSeason = 'spring_light' | 'spring_warm' | 'summer_light' | 'summer_cool' | 'autumn_warm' | 'autumn_deep' | 'winter_cool' | 'winter_deep';
/** 原生气质 */
export type Temperament = 'gentle' | 'capable' | 'cool' | 'lively' | 'steady' | 'artistic';
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
        height: number;
        weight: number;
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
export type Lifestyle = 'office_9to5' | 'student' | 'creative_freelancer' | 'stay_at_home' | 'social_butterfly' | 'outdoor_enthusiast' | 'urban_commuter';
/** 风格适配维度详情 */
export interface DimensionMatch {
    dimension: 'bone_structure' | 'volume_sense' | 'body_type' | 'skin_tone' | 'temperament';
    score: number;
    level: 'excellent' | 'good' | 'moderate' | 'weak';
    reasoning: string;
    tips: string;
}
/** 风格匹配结果 */
export interface StyleMatchResult {
    styleId: string;
    styleName: string;
    overallScore: number;
    category: 'core' | 'explore' | 'challenge';
    dimensions: DimensionMatch[];
    summary: string;
    recommendedItems: string[];
    colorPalette: string[];
    difficulty: number;
}
/** 用户风格分析报告 */
export interface StyleAnalysisReport {
    userDNA: UserStyleDNA;
    matches: StyleMatchResult[];
    coreStyles: StyleMatchResult[];
    exploreStyles: StyleMatchResult[];
    challengeStyles: StyleMatchResult[];
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
/** 博主人格档案 */
export interface BloggerPersona {
    id: string;
    name: string;
    platform: string;
    avatarUrl?: string;
    styleSignature: string;
    description: string;
    /** 话术风格 */
    toneProfile: {
        personality: string;
        greeting: string;
        praiseStyle: string;
        critiqueStyle: string;
        signaturePhrases: string[];
    };
    /** 各维度评分权重（总和不需要为 100，相对值） */
    dimensionWeights: Record<ScoringDimensionKey, number>;
    /** 审美偏好 */
    preferences: {
        lovedElements: string[];
        dislikedElements: string[];
        colorPalette: string[];
        keySilhouettes: string[];
    };
}
/** 评分维度键名 */
export type ScoringDimensionKey = 'proportion' | 'color' | 'occasion' | 'coherence' | 'trend' | 'creativity' | 'bodyFit' | 'practicality';
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
    /** 博主 ID */
    bloggerId: string;
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
    type: 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory';
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
    bloggerName: string;
    bloggerId: string;
    greeting: string;
    overallComment: string;
    dimensions: DimensionScore[];
    itemComments: string[];
    improvements: string[];
    /** 结构化分析结果（Phase 1 新增），用于数字衣柜/推荐等功能复用 */
    structured?: StructuredOutfitResult;
}
//# sourceMappingURL=index.d.ts.map