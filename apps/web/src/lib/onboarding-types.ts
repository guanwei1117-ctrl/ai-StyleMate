/**
 * 穿搭风格问卷 —— 类型定义
 *
 * 用户画像三支柱：
 *   审美适配（体型/肤色/偏好）+ 现实约束（年龄/场景/气候/预算）+ 行为偏好（目标/优先级/接受度）
 * 因为"适合"不等于"会穿"。
 */

/** 问卷步骤枚举 */
export type StepId =
  | 'photo'
  | 'body'
  | 'style_pick'
  | 'interests'
  | 'budget'
  | 'lifestyle'
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

/** 预算档位（单件） */
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

// ============================================================
// 生活方式画像 —— 现实约束 + 行为偏好
// ============================================================

/** 年龄段（必填） */
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

/** 职业 / 使用场景（选填） */
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

/** 日常穿搭场景（选填，可多选） */
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

/** 气候区域（选填） */
export const CLIMATE_OPTIONS = [
  { label: '寒冷（冬季漫长）', value: 'cold', emoji: '❄️' },
  { label: '温和（四季分明）', value: 'mild', emoji: '🌤️' },
  { label: '炎热（夏季漫长）', value: 'hot', emoji: '☀️' },
  { label: '多变（温差较大）', value: 'variable', emoji: '🌡️' },
] as const;

export type ClimateZone = typeof CLIMATE_OPTIONS[number]['value'];

export const CLIMATE_LABELS: Record<ClimateZone, string> = {
  cold: '寒冷',
  mild: '温和',
  hot: '炎热',
  variable: '多变',
};

/** 穿衣目标（必填多选） */
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

/** 穿衣优先级维度（必填排序：舒适度/显瘦/质感/个性） */
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

/** 风格接受度档位（选填，1-5） */
export const STYLE_OPENNESS_OPTIONS = [
  { label: '保守', value: 1, desc: '只穿经典安全款' },
  { label: '偏保守', value: 2, desc: '偶尔尝试小变化' },
  { label: '适中', value: 3, desc: '愿意在安全范围内尝试' },
  { label: '开放', value: 4, desc: '乐于尝试不同风格' },
  { label: '非常开放', value: 5, desc: '享受突破与实验' },
] as const;

/** 问卷完整答案 */
export interface OnboardingAnswers {
  // Step 1: 照片
  photo: File | null;
  photoPreview: string | null;
  fullBodyPhoto: File | null;
  fullBodyPhotoPreview: string | null;

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

  // Step 5: 单件预算
  budget: BudgetLevel | null;

  // Step 6: 生活方式 —— 现实约束 + 行为偏好
  ageGroup: AgeGroup | null;               // 必填
  occupation: Occupation | null;            // 选填
  dailyScenes: DailyScene[];                // 选填多选
  customScene: string;                      // 选填，自定义场景
  city: string;                             // 选填
  climate: ClimateZone | null;              // 选填
  monthlyBudgetMin: number | null;          // 选填，元
  monthlyBudgetMax: number | null;          // 选填，元
  dressingGoals: DressingGoal[];            // 必填多选
  priorities: PriorityDimension[];          // 必填排序
  styleOpenness: number | null;             // 选填 1-5
  openToNewStyles: boolean | null;          // 选填

  // 用户自述：由选项自动生成，用户可以继续编辑补充
  userStatement: string;
}

/** AI 照片分析结果（预留接口） */
export interface PhotoAnalysisResult {
  skinTone: SkinTone;
  faceShape: string;
  confidence: number; // 0-1
}

/**
 * 风格匹配结果
 *
 * 打分三支柱（满分 100）：
 *   审美适配 50：体型(20) + 偏好(25) + 肤色(5)
 *   现实约束 30：预算(12) + 年龄适配(8) + 场景适配(10)
 *   行为偏好 20：优先级(10) + 目标(5) + 接受度(5)
 *
 * 类型定义从 @stylemate/shared 统一导入。
 */
import type { UnifiedStyleMatch } from '@stylemate/shared';
export type StyleMatchResult = UnifiedStyleMatch;

// ============================================================
// 顾问级输出类型 —— 解释机制 + 避雷建议 + 多维评分
// ============================================================

/**
 * 体型解读 —— 自然语言解释
 *
 * 把"为什么推荐"翻译成用户能听懂的话，
 * 让产品从"工具"变成"顾问"。
 */
export interface BodyExplain {
  /** 体貌特征描述，如"肩线较平、下半身重心略明显" */
  featureDesc: string;
  /** 身材优势 2-3 条 */
  advantages: string[];
  /** 版型推荐理由，解释为什么某些廓形更适合 */
  silhouetteAdvice: string;
  /** 配色建议，基于肤色/年龄/场景 */
  colorAdvice: string;
  /** 气质定位描述，基于年龄段和穿衣目标 */
  auraDescription: string;
}

/** 避雷建议类别 */
export type AvoidanceCategory =
  | 'silhouette'  // 版型雷区
  | 'item'        // 单品雷区
  | 'color'       // 配色雷区
  | 'budget'      // 预算雷区
  | 'general';    // 通用误区

/**
 * 避雷建议 —— 主动告知不适合什么 + 替代方案
 *
 * 用户更在意"我不适合什么""一直穿错在哪里"，
 * 比正向推荐更有传播性和被理解感。
 */
export interface AvoidanceAdvice {
  category: AvoidanceCategory;
  /** 雷区描述，如"不建议过长上衣压身高" */
  warning: string;
  /** 原因，如"会破坏身材比例，显矮显拖沓" */
  reason: string;
  /** 替代方案 1-2 条，如"高腰直筒裤 / 短款外套" */
  alternatives: string[];
}

/**
 * 多维评分结果 —— 从"标签"升级为"结构化维度"
 *
 * 不再只输出"你属于韩系风"，
 * 而是输出核心风格/次级可尝试/慎选风格 + 最佳版型/配色 + 风险提示。
 */
export interface MultiDimensionScore {
  /** 核心风格 Top1-2（综合分 ≥ 75） */
  coreStyles: StyleMatchResult[];
  /** 次级可尝试 Top3-5 */
  secondaryStyles: StyleMatchResult[];
  /** 慎选风格 Top6-8 或低分高难度项 */
  cautionStyles: StyleMatchResult[];
  /** 色彩适配度 0-100 */
  colorScore: number;
  /** 廓形适配度 0-100 */
  silhouetteScore: number;
  /** 场景适配度 0-100 */
  sceneScore: number;
  /** 推荐最佳版型列表（从核心风格聚合） */
  bestSilhouettes: string[];
  /** 推荐最佳配色列表（从核心风格聚合） */
  bestColors: string[];
  /** 风险提示，如"高难度风格超出预算" */
  riskFlags: string[];
}

/** 顾问级解释结果（聚合三者，供结果页使用） */
export interface StyleExplanation {
  bodyExplain: BodyExplain;
  avoidanceAdvice: AvoidanceAdvice[];
  multiDimension: MultiDimensionScore;
}

/** 默认问卷答案 */
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

// ============================================================
// Zustand 全局状态管理
// ============================================================

import { create } from 'zustand';

/** 评分流程状态 */
export interface ScoringState {
  step: StepId;
  answers: OnboardingAnswers;
  bodyShape: BodyShape | null;
  results: StyleMatchResult[];
  aiAnalysis: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
}

/** 评分流程操作 */
export interface ScoringActions {
  setStep: (step: StepId) => void;
  setAnswers: (answers: OnboardingAnswers) => void;
  updateAnswers: (partial: Partial<OnboardingAnswers>) => void;
  setBodyShape: (shape: BodyShape | null) => void;
  setResults: (results: StyleMatchResult[]) => void;
  setAiAnalysis: (analysis: Record<string, unknown> | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ScoringStore = ScoringState & ScoringActions;

const initialScoringState: ScoringState = {
  step: 'photo',
  answers: createDefaultAnswers(),
  bodyShape: null,
  results: [],
  aiAnalysis: null,
  loading: false,
  error: null,
};

export const useScoringStore = create<ScoringStore>((set) => ({
  ...initialScoringState,
  setStep: (step) => set({ step }),
  setAnswers: (answers) => set({ answers }),
  updateAnswers: (partial) =>
    set((state) => ({ answers: { ...state.answers, ...partial } })),
  setBodyShape: (bodyShape) => set({ bodyShape }),
  setResults: (results) => set({ results }),
  setAiAnalysis: (aiAnalysis) => set({ aiAnalysis }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialScoringState),
}));
