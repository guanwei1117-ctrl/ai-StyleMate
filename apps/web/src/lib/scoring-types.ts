/**
 * 新版评分机制 —— 类型定义
 *
 * 三支柱体系（满分 100）：
 *   审美适配 50：体型(25) + 偏好(20) + 色彩(5)
 *   行为偏好 30：优先级(12) + 目标(10) + 接受度(8)
 *   现实约束 20：预算(8) + 场景(7) + 气候(5)
 *
 * 核心理念：
 *   - 先大类 → 后子风格，二层递进
 *   - 视觉调性过滤，避免调性相冲的风格同时出现
 *   - 评分是参考不是判决，记忆优先
 */

import type { BodyShape } from './onboarding-types';
import type { StructuredOutfitResult } from '@stylemate/shared';

// ============================================================
// 8 大风格大类 ID
// ============================================================
export type StyleCategoryId =
  | 'minimal_quality'
  | 'romantic_soft'
  | 'street_trendy'
  | 'workplace'
  | 'dark_alternative'
  | 'sport_outdoor'
  | 'vintage_artistic'
  | 'glamorous';

export const CATEGORY_IDS: StyleCategoryId[] = [
  'minimal_quality',
  'romantic_soft',
  'street_trendy',
  'workplace',
  'dark_alternative',
  'sport_outdoor',
  'vintage_artistic',
  'glamorous',
];

export const CATEGORY_LABELS: Record<StyleCategoryId, string> = {
  minimal_quality: '简约质感类',
  romantic_soft: '浪漫柔和类',
  street_trendy: '街头潮流类',
  workplace: '职场通勤类',
  dark_alternative: '个性暗黑类',
  sport_outdoor: '运动户外类',
  vintage_artistic: '复古文艺类',
  glamorous: '华丽表现类',
};

// ============================================================
// 五维视觉调性光谱
// ============================================================
export type TonalDimension = 'curve' | 'complexity' | 'saturation' | 'formality' | 'era';

export const TONAL_DIMENSION_LABELS: Record<TonalDimension, string> = {
  curve: '曲直度',
  complexity: '繁简度',
  saturation: '色彩饱和度',
  formality: '正式度',
  era: '年代感',
};

export const TONAL_DIMENSION_DESCRIPTIONS: Record<TonalDimension, string> = {
  curve: '1=曲线/柔和/甜美 → 5=直线/硬朗/冷峻',
  complexity: '1=极简/素净 → 5=极繁/华丽',
  saturation: '1=低饱和/大地色 → 5=高饱和/亮色/撞色',
  formality: '1=休闲/随意 → 5=正式/精致',
  era: '1=经典/传统/复古 → 5=前卫/未来感',
};

/** 五维调性向量：[曲直, 繁简, 色彩, 正式, 年代]，每个维度 1-5 */
export type TonalVector = [number, number, number, number, number];

// ============================================================
// 大类评分结果
// ============================================================
export interface CategoryScore {
  categoryId: StyleCategoryId;
  categoryName: string;
  totalScore: number;
  breakdown: {
    aesthetic: number;    // 0-50
    behavioral: number;   // 0-30
    realistic: number;    // 0-20
  };
}

// ============================================================
// 调性一致性校验结果
// ============================================================
export interface TonalConsistencyResult {
  dominantCategoryId: StyleCategoryId;
  dominantTonalVector: TonalVector;
  distancesToOthers: Record<string, number>;
  filteredOutCategoryIds: StyleCategoryId[];
  retainedCategoryIds: StyleCategoryId[];
}

// ============================================================
// 已选风格分析（当用户主动选择了风格时）
// ============================================================
export interface SelectedStyleAnalysis {
  styleId: string;
  styleName: string;
  advantages: string[];
  disadvantages: string[];
  similarRecommendations: string[];
  crossCategoryRecommendations: StyleCategoryId[];
}

// ============================================================
// 最终输出结构 —— 记忆接口格式
// ============================================================
export interface ScoringSnapshot {
  /** 元信息 */
  timestamp: string;
  version: string;

  /** 用户当前画像（快照） */
  userProfile: {
    bodyShape: BodyShape;
    ageGroup: string | null;
    occupation: string | null;
    budget: string | null;
    climate: string | null;
    interests: string[];
    priorities: string[];
    dressingGoals: string[];
    styleOpenness: number | null;
  };

  /** 8 个大类得分 */
  categoryScores: CategoryScore[];

  /** 用户主动选择的风格（如果有） */
  userSelectedStyleIds: string[];

  /** 最终推荐（分层） */
  coreStyles: Array<{
    styleId: string;
    styleName: string;
    categoryName: string;
    score: number;
    reasons: string[];
    riskFlags: string[];
  }>;

  secondaryStyles: Array<{
    styleId: string;
    styleName: string;
    categoryName: string;
    score: number;
    reasons: string[];
    riskFlags: string[];
  }>;

  /** 如果用户已选风格，附加分析 */
  selectedStyleAnalysis?: SelectedStyleAnalysis;

  /** 视觉调性一致性校验结果 */
  tonalConsistency: TonalConsistencyResult;
}


/** 前端评分相关类型定义（旧版，保留兼容） */
export type ScoringDimensionKey =
  | 'proportion'
  | 'color'
  | 'occasion'
  | 'coherence'
  | 'trend'
  | 'creativity'
  | 'bodyFit'
  | 'practicality';

export interface DimensionScore {
  key: ScoringDimensionKey;
  label: string;
  score: number;
  comment: string;
}

export interface EvaluateOutfitResponse {
  greeting: string;
  overallComment: string;
  dimensions: DimensionScore[];
  itemComments: string[];
  improvements: string[];
  /** 结构化单品分析（用于衣橱替换建议等能力） */
  structured?: StructuredOutfitResult;
}

/** 页面两种状态 */
export type ScoringState = 'upload' | 'result';
