/**
 * 穿搭风格问卷 —— 类型定义
 */

/** 问卷步骤枚举 */
export type StepId =
  | 'photo'
  | 'body'
  | 'style_pick'
  | 'interests'
  | 'budget'
  | 'result';

/** 性别 */
export type Gender = 'male' | 'female' | 'other';

/** 体型分类（后端/规则推导结果） */
export type BodyShape =
  | 'pear'      // 梨形
  | 'apple'     // 苹果形
  | 'hourglass' // 沙漏形
  | 'rectangle' // H 形
  | 'inverted_triangle' // 倒三角
  | 'unknown';

export const BODY_SHAPE_LABELS: Record<BodyShape, string> = {
  pear: '梨形',
  apple: '苹果形',
  hourglass: '沙漏形',
  rectangle: 'H 形',
  inverted_triangle: '倒三角',
  unknown: '待分析',
};

/** 肤色类型 */
export type SkinTone = 'cool' | 'warm' | 'neutral' | 'unknown';

export const SKIN_TONE_LABELS: Record<SkinTone, string> = {
  cool: '冷色调',
  warm: '暖色调',
  neutral: '中性调',
  unknown: '待分析',
};

/** 兴趣标签 */
export const INTEREST_OPTIONS = [
  { label: '阅读', value: 'reading', emoji: '📚' },
  { label: '音乐', value: 'music', emoji: '🎵' },
  { label: '运动健身', value: 'fitness', emoji: '🏋️' },
  { label: '旅行', value: 'travel', emoji: '✈️' },
  { label: '咖啡/美食', value: 'food', emoji: '☕' },
  { label: '摄影', value: 'photography', emoji: '📷' },
  { label: '电影', value: 'movie', emoji: '🎬' },
  { label: '艺术/设计', value: 'art', emoji: '🎨' },
  { label: '游戏', value: 'gaming', emoji: '🎮' },
  { label: '宠物', value: 'pets', emoji: '🐾' },
  { label: '户外探险', value: 'outdoor', emoji: '🏕️' },
  { label: '科技数码', value: 'tech', emoji: '💻' },
] as const;

/** 预算档位 */
export const BUDGET_OPTIONS = [
  {
    label: '平价实惠',
    value: 'budget',
    range: '¥0-300/件',
    emoji: '💰',
    description: '快时尚品牌、基础款为主',
  },
  {
    label: '中等价位',
    value: 'mid',
    range: '¥300-1000/件',
    emoji: '💵',
    description: '设计师品牌、品质基础款',
  },
  {
    label: '轻奢品质',
    value: 'premium',
    range: '¥1000+/件',
    emoji: '💎',
    description: '高级成衣、奢侈品牌',
  },
] as const;

export type BudgetLevel = typeof BUDGET_OPTIONS[number]['value'];

/** 问卷完整答案 */
export interface OnboardingAnswers {
  // Step 1: 照片
  photo: File | null;
  photoPreview: string | null;

  // Step 2: 身体数据
  gender: Gender | null;
  height: number | null;       // cm, 必填
  weight: number | null;       // kg, 必填
  bust: number | null;         // cm, 选填
  waist: number | null;        // cm, 选填
  hip: number | null;          // cm, 选填

  // Step 3: 风格偏好 (多选，从 STYLES 里选)
  preferredStyleIds: string[];

  // Step 4: 兴趣爱好 (多选)
  interests: string[];

  // Step 5: 预算
  budget: BudgetLevel | null;
}

/** AI 照片分析结果（预留接口） */
export interface PhotoAnalysisResult {
  skinTone: SkinTone;
  faceShape: string;
  confidence: number; // 0-1
}

/** 风格匹配结果 */
export interface StyleMatchResult {
  styleId: string;
  styleName: string;
  category: string;
  score: number;       // 0-100
  matchReasons: string[];
  matchBreakdown: {
    bodyShape: number; // 0-25
    preference: number; // 0-25
    difficulty: number; // 0-20
    budget: number;     // 0-15
    interests: number;  // 0-10
    skinTone: number;   // 0-5
  };
}

/** 默认问卷答案 */
export function createDefaultAnswers(): OnboardingAnswers {
  return {
    photo: null,
    photoPreview: null,
    gender: null,
    height: null,
    weight: null,
    bust: null,
    waist: null,
    hip: null,
    preferredStyleIds: [],
    interests: [],
    budget: null,
  };
}
