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
  // ============== M14 教练模式字段 ==============
  /** 穿搭水平自评 0-10 */
  styleProficiency?: number | null;
  /** 用户困惑类型数组（'buy' | 'wear' | 'match'） */
  confusionTypes?: string[] | null;
}

/** 教练子模式推导结果 */
export type CoachMode = 'shopping' | 'occasion' | 'combination' | 'mixed';

/**
 * 从 confusionTypes + styleProficiency 推导教练子模式
 * （供 skill 调用 — 不存数据库，每次实时派生）
 */
export function deriveCoachMode(
  confusionTypes: string[] | null | undefined,
  styleProficiency: number | null | undefined,
): CoachMode {
  const types = confusionTypes ?? [];
  // 高水平（>7）+ 无困惑 → mixed（顾问模式，给建议但不教）
  if (styleProficiency !== null && styleProficiency !== undefined && styleProficiency >= 7 && types.length === 0) {
    return 'mixed';
  }
  // 多困惑 → mixed（综合模式）
  if (types.length >= 2) return 'mixed';
  if (types.length === 1) {
    if (types[0] === 'buy') return 'shopping';
    if (types[0] === 'wear') return 'occasion';
    if (types[0] === 'match') return 'combination';
  }
  // 无困惑或 unknown → mixed（默认顾问模式，不打扰高水平用户）
  return 'mixed';
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
  /** 任务类型 */
  taskType: TaskType;
  /** 预压缩的记忆快照（核心优化：用结论代替原文，大幅减少 token） */
  snapshot: MemorySnapshot | null;
  /** 衣柜关键数据摘要 */
  wardrobeSummary: {
    totalItems: number;
    byCategory: Record<string, number>;
    idleItems: Array<{ id: string; description: string; idleDays: number }>;
    topWorn: Array<{ id: string; description: string; wearCount: number }>;
  } | null;
  // ============== 便捷派生字段（由 buildAIContext 从 snapshot/entities 派生）==============
  /** AI 总结的快捷访问 = snapshot?.summary（部分 prompts 旧版字段命名） */
  memorySummary?: string;
  /** 用户画像扁平视图 = snapshot 字段聚合（部分 prompts 旧版字段命名） */
  styleProfile?: {
    suitableStyles?: string[];
    likedStyles?: string[];
    dislikedStyles?: string[];
    preferredColors?: string[];
    dislikedColors?: string[];
    bodyType?: string;
    bodyConcerns?: string[];
    dressGoals?: string[];
    commonOccasions?: string[];
    avoidRules?: Array<{ rule: string; source: string; weight: number }>;
    /** M14：穿搭水平 0-10 */
    styleProficiency?: number | null;
    /** M14：用户困惑类型数组 */
    confusionTypes?: string[] | null;
  };
  /** M14：教练子模式（实时派生） */
  coachMode?: CoachMode;
  /** 最近反馈的文本摘要（按需从 OutfitFeedback 聚合；当前未启用，预留） */
  recentFeedbackSummary?: string;
  /** 当前购物意图（按需从 UserCurrentIntent 读；当前未启用，预留） */
  currentIntent?: {
    lookingFor?: string;
    targetOccasion?: string;
    budgetRange?: { min?: number; max?: number; currency?: string };
    preferredBrands?: string[];
  };
}

/**
 * 预压缩记忆快照
 *
 * 核心优化思路：
 * 将用户长期画像、AI 总结、最近反馈等冗余数据，
 * 压缩成一段 150 字以内的结构化摘要。
 * 所有 AI 功能调用时只读这个快照，不读原始数据。
 *
 * 快照在以下时机刷新：
 * - 对话结束转化记忆时
 * - 用户提交反馈时
 * - 用户手动编辑记忆时
 */
export interface MemorySnapshot {
  /** AI 生成的总结文本（150 字以内） */
  summary: string;
  /** 喜欢的风格 */
  likedStyles: string[];
  /** 不喜欢的风格 */
  dislikedStyles: string[];
  /** 偏好颜色 */
  preferredColors: string[];
  /** 不喜欢颜色 */
  dislikedColors: string[];
  /** 避坑规则（weight > 0 的规则文本） */
  avoidRules: string[];
  /** 穿搭目标 */
  dressGoals: string[];
  /** 身材顾虑 */
  bodyConcerns: string[];
  /** 常见场景 */
  commonOccasions: string[];
  /** 当前购物意图 */
  currentIntent: string | null;
  /** 置信度 0-1 */
  confidence: number;
}

export type TaskType =
  | 'today_outfit'
  | 'purchase_evaluate'
  | 'wardrobe_gap'
  | 'item_recognition'
  | 'style_profile_update'
  | 'outfit_scoring'
  | 'item_styling';
