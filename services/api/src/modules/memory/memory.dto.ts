/**
 * Memory 模块 DTO 定义
 */

export interface UpdateStyleProfileDto {
  bodyType?: string;
  heightRange?: string;
  skinTone?: string;
  faceStyle?: string;
  suitableStyles?: string[];
  likedStyles?: string[];
  dislikedStyles?: string[];
  preferredColors?: string[];
  dislikedColors?: string[];
  bodyConcerns?: string[];
  dressGoals?: string[];
  commonOccasions?: string[];
  avoidRules?: Array<{ rule: string; source: string; weight: number }>;
}

export interface RecordFeedbackDto {
  outfitId?: string;
  itemIds?: string[];
  feedbackType:
    | 'like'
    | 'dislike'
    | 'worn_today'
    | 'too_fat'
    | 'too_formal'
    | 'too_plain'
    | 'uncomfortable'
    | 'color_dislike'
    | 'occasion_mismatch';
  reason?: string;
  context?: Record<string, any>;
}

export interface UpdateIntentDto {
  lookingFor?: string;
  budgetRange?: { min?: number; max?: number; currency?: string };
  targetOccasion?: string;
  preferredBrands?: string[];
  recentRejectedItems?: Array<{ name: string; reason: string; at: string }>;
  recentPurchaseCandidates?: Array<{ name: string; reason: string; at: string }>;
}

/** AI 上下文 — 所有 AI 功能调用前组装 */
export interface AIMemoryContext {
  /** 用户长期画像 */
  styleProfile: Record<string, any> | null;
  /** 衣柜关键数据摘要 */
  wardrobeSummary: {
    totalItems: number;
    byCategory: Record<string, number>;
    idleItems: Array<{ id: string; description: string; idleDays: number }>;
    topWorn: Array<{ id: string; description: string; wearCount: number }>;
  } | null;
  /** 最近反馈摘要 */
  recentFeedbackSummary: string | null;
  /** 当前意图 */
  currentIntent: Record<string, any> | null;
  /** AI 总结记忆 */
  memorySummary: string | null;
  /** 当前任务类型 */
  taskType: string;
}

export type TaskType =
  | 'today_outfit'
  | 'purchase_evaluate'
  | 'wardrobe_gap'
  | 'item_recognition'
  | 'style_profile_update'
  | 'outfit_scoring'
  | 'item_styling';
