/**
 * 新版评分机制 —— 类型定义（从 Web 端复制）
 */
import type { BodyShape } from './onboarding';

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
  'minimal_quality', 'romantic_soft', 'street_trendy', 'workplace',
  'dark_alternative', 'sport_outdoor', 'vintage_artistic', 'glamorous',
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

export type TonalDimension = 'curve' | 'complexity' | 'saturation' | 'formality' | 'era';

export const TONAL_DIMENSION_LABELS: Record<TonalDimension, string> = {
  curve: '曲直度', complexity: '繁简度', saturation: '色彩饱和度', formality: '正式度', era: '年代感',
};

export const TONAL_DIMENSION_DESCRIPTIONS: Record<TonalDimension, string> = {
  curve: '1=曲线/柔和/甜美 → 5=直线/硬朗/冷峻',
  complexity: '1=极简/素净 → 5=极繁/华丽',
  saturation: '1=低饱和/大地色 → 5=高饱和/亮色/撞色',
  formality: '1=休闲/随意 → 5=正式/精致',
  era: '1=经典/传统/复古 → 5=前卫/未来感',
};

export type TonalVector = [number, number, number, number, number];

export interface CategoryScore {
  categoryId: StyleCategoryId;
  categoryName: string;
  totalScore: number;
  breakdown: { aesthetic: number; behavioral: number; realistic: number };
}

export interface TonalConsistencyResult {
  dominantCategoryId: StyleCategoryId;
  dominantTonalVector: TonalVector;
  distancesToOthers: Record<string, number>;
  filteredOutCategoryIds: StyleCategoryId[];
  retainedCategoryIds: StyleCategoryId[];
}

export interface SelectedStyleAnalysis {
  styleId: string;
  styleName: string;
  advantages: string[];
  disadvantages: string[];
  similarRecommendations: string[];
  crossCategoryRecommendations: StyleCategoryId[];
}

export interface ScoringSnapshot {
  timestamp: string;
  version: string;
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
  categoryScores: CategoryScore[];
  userSelectedStyleIds: string[];
  coreStyles: Array<{ styleId: string; styleName: string; categoryName: string; score: number; reasons: string[]; riskFlags: string[] }>;
  secondaryStyles: Array<{ styleId: string; styleName: string; categoryName: string; score: number; reasons: string[]; riskFlags: string[] }>;
  selectedStyleAnalysis?: SelectedStyleAnalysis;
  tonalConsistency: TonalConsistencyResult;
}

export type ScoringDimensionKey = 'proportion' | 'color' | 'occasion' | 'coherence' | 'trend' | 'creativity' | 'bodyFit' | 'practicality';

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
}

export type ScoringState = 'upload' | 'result';