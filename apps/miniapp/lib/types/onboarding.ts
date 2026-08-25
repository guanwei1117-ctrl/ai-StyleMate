/**
 * 穿搭风格问卷 —— 类型定义（从 Web 端复制，适配小程序）
 */

export type StepId =
  | 'photo'
  | 'body'
  | 'style_pick'
  | 'interests'
  | 'budget'
  | 'lifestyle'
  | 'result';

export type Gender = 'male' | 'female' | 'other';

export type BodyShape =
  | 'pear'
  | 'apple'
  | 'hourglass'
  | 'rectangle'
  | 'inverted_triangle'
  | 'unknown';

export const BODY_SHAPE_LABELS: Record<BodyShape, string> = {
  pear: '梨形',
  apple: '苹果形',
  hourglass: '沙漏形',
  rectangle: 'H 形',
  inverted_triangle: '倒三角',
  unknown: '待分析',
};

export type SkinTone = 'cool' | 'warm' | 'neutral' | 'unknown';

export const SKIN_TONE_LABELS: Record<SkinTone, string> = {
  cool: '冷色调',
  warm: '暖色调',
  neutral: '中性调',
  unknown: '待分析',
};

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

export const BUDGET_OPTIONS = [
  { label: '平价实惠', value: 'budget', range: '¥0-300/件', emoji: '💰', description: '快时尚品牌、基础款为主' },
  { label: '中等价位', value: 'mid', range: '¥300-1000/件', emoji: '💵', description: '设计师品牌、品质基础款' },
  { label: '轻奢品质', value: 'premium', range: '¥1000+/件', emoji: '💎', description: '高级成衣、奢侈品牌' },
] as const;

export type BudgetLevel = typeof BUDGET_OPTIONS[number]['value'];

export const AGE_GROUP_OPTIONS = [
  { label: '18 岁以下', value: 'under_18', emoji: '🎒' },
  { label: '18-24 岁', value: '18_24', emoji: '🎓' },
  { label: '25-29 岁', value: '25_29', emoji: '💼' },
  { label: '30-39 岁', value: '30_39', emoji: '🏡' },
  { label: '40-49 岁', value: '40_49', emoji: '🌟' },
  { label: '50 岁以上', value: '50_plus', emoji: '🌸' },
] as const;

export type AgeGroup = typeof AGE_GROUP_OPTIONS[number]['value'];

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  under_18: '18 岁以下',
  '18_24': '18-24 岁',
  '25_29': '25-29 岁',
  '30_39': '30-39 岁',
  '40_49': '40-49 岁',
  '50_plus': '50 岁以上',
};

export const OCCUPATION_OPTIONS = [
  { label: '学生', value: 'student', emoji: '🎓' },
  { label: '上班族/白领', value: 'office_worker', emoji: '🏢' },
  { label: '创意/自由职业', value: 'creative', emoji: '🎨' },
  { label: '管理/商务', value: 'management', emoji: '📊' },
  { label: '服务行业', value: 'service', emoji: '🛎️' },
  { label: '医疗/教育', value: 'medical_education', emoji: '⚕️' },
  { label: '全职居家', value: 'homemaker', emoji: '🏡' },
  { label: '其他', value: 'other', emoji: '✏️' },
] as const;

export type Occupation = typeof OCCUPATION_OPTIONS[number]['value'];

export const OCCUPATION_LABELS: Record<Occupation, string> = {
  student: '学生',
  office_worker: '上班族/白领',
  creative: '创意/自由职业',
  management: '管理/商务',
  service: '服务行业',
  medical_education: '医疗/教育',
  homemaker: '全职居家',
  other: '其他',
};

export const DAILY_SCENE_OPTIONS = [
  { label: '上学', value: 'school' },
  { label: '通勤', value: 'commute' },
  { label: '办公室', value: 'office' },
  { label: '见客户', value: 'client_meeting' },
  { label: '面试', value: 'interview' },
  { label: '约会', value: 'date' },
  { label: '出街', value: 'street' },
  { label: '聚会', value: 'party' },
  { label: '旅行', value: 'travel' },
  { label: '拍照', value: 'photo_shoot' },
  { label: '运动', value: 'workout' },
  { label: '居家', value: 'home' },
  { label: '正式场合', value: 'wedding_formal' },
  { label: '音乐节/演出', value: 'music_festival' },
  { label: '带娃/亲子', value: 'parenting' },
  { label: '上镜/直播', value: 'on_camera' },
] as const;

export type DailyScene = typeof DAILY_SCENE_OPTIONS[number]['value'];

export const DAILY_SCENE_LABELS: Record<DailyScene, string> = Object.fromEntries(
  DAILY_SCENE_OPTIONS.map((item) => [item.value, item.label]),
) as Record<DailyScene, string>;

export const CLIMATE_OPTIONS = [
  { label: '寒冷（冬季漫长）', value: 'cold', emoji: '❄️' },
  { label: '温和（四季分明）', value: 'mild', emoji: '🌤️' },
  { label: '炎热（夏季漫长）', value: 'hot', emoji: '☀️' },
  { label: '多变（温差较大）', value: 'variable', emoji: '🌡️' },
] as const;

export type ClimateZone = typeof CLIMATE_OPTIONS[number]['value'];

export const CLIMATE_LABELS: Record<ClimateZone, string> = {
  cold: '寒冷', mild: '温和', hot: '炎热', variable: '多变',
};

export const DRESSING_GOAL_OPTIONS = [
  { label: '看起来得体精致', value: 'look_polished', emoji: '✨' },
  { label: '表达个性与态度', value: 'express_personality', emoji: '🎨' },
  { label: '舒适至上', value: 'comfort_first', emoji: '🛋️' },
  { label: '显瘦显高', value: 'look_slim', emoji: '📏' },
  { label: '职场专业感', value: 'professional', emoji: '👔' },
  { label: '尝试新风格', value: 'try_new_style', emoji: '🧪' },
  { label: '建立精简胶囊衣橱', value: 'build_wardrobe', emoji: '📦' },
] as const;

export type DressingGoal = typeof DRESSING_GOAL_OPTIONS[number]['value'];

export const DRESSING_GOAL_LABELS: Record<DressingGoal, string> = {
  look_polished: '得体精致',
  express_personality: '表达个性',
  comfort_first: '舒适至上',
  look_slim: '显瘦显高',
  professional: '职场专业',
  try_new_style: '尝试新风格',
  build_wardrobe: '胶囊衣橱',
};

export const PRIORITY_OPTIONS = [
  { label: '舒适度', value: 'comfort', desc: '面料柔软、版型宽松不束缚' },
  { label: '显瘦', value: 'slimming', desc: '修饰身形、优化比例' },
  { label: '质感', value: 'texture', desc: '面料高级、剪裁讲究' },
  { label: '个性表达', value: 'personality', desc: '独特辨识度、不撞款' },
] as const;

export type PriorityDimension = typeof PRIORITY_OPTIONS[number]['value'];

export const PRIORITY_LABELS: Record<PriorityDimension, string> = {
  comfort: '舒适度',
  slimming: '显瘦',
  texture: '质感',
  personality: '个性表达',
};

export const STYLE_OPENNESS_OPTIONS = [
  { label: '保守', value: 1, desc: '只穿经典安全款' },
  { label: '偏保守', value: 2, desc: '偶尔尝试小变化' },
  { label: '适中', value: 3, desc: '愿意在安全范围内尝试' },
  { label: '开放', value: 4, desc: '乐于尝试不同风格' },
  { label: '非常开放', value: 5, desc: '享受突破与实验' },
] as const;

export interface OnboardingAnswers {
  photo: string | null;
  photoPreview: string | null;
  fullBodyPhoto: string | null;
  fullBodyPhotoPreview: string | null;
  gender: Gender | null;
  height: number | null;
  weight: number | null;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  preferredStyleIds: string[];
  interests: string[];
  budget: BudgetLevel | null;
  ageGroup: AgeGroup | null;
  occupation: Occupation | null;
  dailyScenes: DailyScene[];
  customScene: string;
  city: string;
  climate: ClimateZone | null;
  monthlyBudgetMin: number | null;
  monthlyBudgetMax: number | null;
  dressingGoals: DressingGoal[];
  priorities: PriorityDimension[];
  styleOpenness: number | null;
  openToNewStyles: boolean | null;
  userStatement: string;
}

export interface PhotoAnalysisResult {
  skinTone: SkinTone;
  faceShape: string;
  confidence: number;
}

export interface StyleMatchResult {
  styleId: string;
  styleName: string;
  category: string;
  score: number;
  matchReasons: string[];
  matchBreakdown: {
    bodyShape: number;
    preference: number;
    skinTone: number;
    budget: number;
    ageFit: number;
    scene: number;
    priority: number;
    goal: number;
    openness: number;
  };
  pillars: {
    aesthetic: number;
    realistic: number;
    behavioral: number;
  };
}

export interface BodyExplain {
  featureDesc: string;
  advantages: string[];
  silhouetteAdvice: string;
  colorAdvice: string;
  auraDescription: string;
}

export type AvoidanceCategory = 'silhouette' | 'item' | 'color' | 'budget' | 'general';

export interface AvoidanceAdvice {
  category: AvoidanceCategory;
  warning: string;
  reason: string;
  alternatives: string[];
}

export interface MultiDimensionScore {
  coreStyles: StyleMatchResult[];
  secondaryStyles: StyleMatchResult[];
  cautionStyles: StyleMatchResult[];
  colorScore: number;
  silhouetteScore: number;
  sceneScore: number;
  bestSilhouettes: string[];
  bestColors: string[];
  riskFlags: string[];
}

export interface StyleExplanation {
  bodyExplain: BodyExplain;
  avoidanceAdvice: AvoidanceAdvice[];
  multiDimension: MultiDimensionScore;
}

export function createDefaultAnswers(): OnboardingAnswers {
  return {
    photo: null,
    photoPreview: null,
    fullBodyPhoto: null,
    fullBodyPhotoPreview: null,
    gender: null,
    height: null,
    weight: null,
    bust: null,
    waist: null,
    hip: null,
    preferredStyleIds: [],
    interests: [],
    budget: null,
    ageGroup: null,
    occupation: null,
    dailyScenes: [],
    customScene: '',
    city: '',
    climate: null,
    monthlyBudgetMin: null,
    monthlyBudgetMax: null,
    dressingGoals: [],
    priorities: [],
    styleOpenness: null,
    openToNewStyles: null,
    userStatement: '',
  };
}