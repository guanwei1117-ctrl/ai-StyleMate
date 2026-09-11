/**
 * 长期记忆系统 — 前端 API 封装
 *
 * 与后端 /memory 端点通信，管理用户长期画像、反馈、意图、AI 总结。
 */

import { buildApiErrorMessage } from './api-error';
import { getLocalUserId } from './wardrobe-api';
import { getAuthToken } from './auth';

function authHeaders(): Record<string, string> { const t = getAuthToken(); return t ? { Authorization: 'Bearer ' + t } : {}; }
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// ==================== 类型定义 ====================

export interface UserStyleProfile {
  id?: string;
  userId?: string;
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
  /** M14：穿搭水平自评 0-10 */
  styleProficiency?: number | null;
  /** M14：用户困惑类型数组 ('buy' | 'wear' | 'match') */
  confusionTypes?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

/** 教练子模式（与后端 CoachMode 同源） */
export type CoachMode = 'shopping' | 'occasion' | 'combination' | 'mixed';

/** 教练模式中文标签 */
export const COACH_MODE_LABELS: Record<CoachMode, string> = {
  shopping: '购物顾问',
  occasion: '场合顾问',
  combination: '搭配教练',
  mixed: '综合顾问',
};

/** 教练模式 emoji */
export const COACH_MODE_EMOJI: Record<CoachMode, string> = {
  shopping: '🛍️',
  occasion: '📅',
  combination: '🎨',
  mixed: '✨',
};

/**
 * 从用户画像派生教练子模式（前端版本，与后端 deriveCoachMode 保持一致）
 * - 1 个困惑 → 对应 mode
 * - 多困惑或无困惑 → mixed
 */
export function deriveCoachModeFromProfile(
  profile: UserStyleProfile | null | undefined,
): CoachMode {
  if (!profile) return 'mixed';
  const types = profile.confusionTypes ?? [];
  const prof = profile.styleProficiency;

  if (prof !== null && prof !== undefined && prof >= 7 && types.length === 0) {
    return 'mixed';
  }
  if (types.length >= 2) return 'mixed';
  if (types.length === 1) {
    if (types[0] === 'buy') return 'shopping';
    if (types[0] === 'wear') return 'occasion';
    if (types[0] === 'match') return 'combination';
  }
  return 'mixed';
}

export interface OutfitFeedbackRecord {
  id: string;
  userId: string;
  outfitId?: string;
  itemIds?: string[];
  feedbackType: string;
  reason?: string;
  context?: Record<string, any>;
  createdAt: string;
}

export interface UserCurrentIntent {
  id?: string;
  userId?: string;
  lookingFor?: string;
  budgetRange?: { min?: number; max?: number; currency?: string };
  targetOccasion?: string;
  preferredBrands?: string[];
  recentRejectedItems?: Array<{ name: string; reason: string; at: string }>;
  recentPurchaseCandidates?: Array<{ name: string; reason: string; at: string }>;
  updatedAt?: string;
}

export interface UserMemorySummary {
  id?: string;
  userId?: string;
  summary: string;
  confidence: number;
  updatedAt?: string;
}

export interface UserMemory {
  styleProfile: UserStyleProfile | null;
  currentIntent: UserCurrentIntent | null;
  memorySummary: UserMemorySummary | null;
  recentFeedbacks: OutfitFeedbackRecord[];
}

export type FeedbackType =
  | 'like'
  | 'dislike'
  | 'worn_today'
  | 'too_fat'
  | 'too_formal'
  | 'too_plain'
  | 'uncomfortable'
  | 'color_dislike'
  | 'occasion_mismatch';

// ==================== API 方法 ====================

/**
 * 获取用户完整记忆（AI 记住了什么页面用）
 */
export async function getUserMemory(): Promise<UserMemory> {
  const userId = getLocalUserId();
  const res = await fetch(`${API_BASE}/memory/${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '获取用户记忆失败'));
  }
  return res.json();
}

/**
 * 更新用户风格画像（部分更新，合并而非覆盖）
 */
export async function updateStyleProfile(
  data: Partial<UserStyleProfile>,
): Promise<UserStyleProfile> {
  const userId = getLocalUserId();
  const res = await fetch(
    `${API_BASE}/memory/${encodeURIComponent(userId)}/profile`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '更新用户画像失败'));
  }
  return res.json();
}

/**
 * 删除画像中的单条记忆字段
 */
export async function removeProfileField(
  field: string,
  value?: string,
): Promise<UserStyleProfile> {
  const userId = getLocalUserId();
  const params = value ? `?value=${encodeURIComponent(value)}` : '';
  const res = await fetch(
    `${API_BASE}/memory/${encodeURIComponent(userId)}/profile/field/${field}${params}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '删除记忆字段失败'));
  }
  return res.json();
}

/**
 * 清空用户全部长期记忆（一键清空）
 */
export async function clearAllMemory(): Promise<void> {
  const userId = getLocalUserId();
  const res = await fetch(
    `${API_BASE}/memory/${encodeURIComponent(userId)}/profile`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '清空记忆失败'));
  }
}

/**
 * 记录用户反馈（自动更新记忆权重）
 */
export async function recordFeedback(input: {
  feedbackType: FeedbackType;
  outfitId?: string;
  itemIds?: string[];
  reason?: string;
  context?: Record<string, any>;
}): Promise<OutfitFeedbackRecord> {
  const userId = getLocalUserId();
  const res = await fetch(
    `${API_BASE}/memory/${encodeURIComponent(userId)}/feedback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '记录反馈失败'));
  }
  return res.json();
}

/**
 * 更新用户当前购物意图
 */
export async function updateCurrentIntent(
  data: Partial<UserCurrentIntent>,
): Promise<UserCurrentIntent> {
  const userId = getLocalUserId();
  const res = await fetch(
    `${API_BASE}/memory/${encodeURIComponent(userId)}/intent`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '更新购物意图失败'));
  }
  return res.json();
}

/**
 * 刷新 AI 总结记忆
 */
export async function refreshMemorySummary(): Promise<UserMemorySummary> {
  const userId = getLocalUserId();
  const res = await fetch(
    `${API_BASE}/memory/${encodeURIComponent(userId)}/summary/refresh`,
    { method: 'POST' },
  );
  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '刷新 AI 总结失败'));
  }
  return res.json();
}

// ==================== 辅助方法 ====================

export const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  like: '喜欢',
  dislike: '不喜欢',
  worn_today: '今天穿了',
  too_fat: '太显胖',
  too_formal: '太正式',
  too_plain: '太普通',
  uncomfortable: '不舒服',
  color_dislike: '颜色不喜欢',
  occasion_mismatch: '场合不合适',
};
