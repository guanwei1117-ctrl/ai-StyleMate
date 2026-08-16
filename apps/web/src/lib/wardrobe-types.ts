/**
 * 衣柜相关类型定义
 */

import type { ClothingCategory } from '@stylemate/shared';
import { SUBCATEGORY_MAP, CATEGORY_LABELS as SHARED_CATEGORY_LABELS } from '@stylemate/shared';

export type WardrobeCategory = ClothingCategory;

/** 二级子类候选集（一级类目 → 子类列表） */
export const SUBCATEGORIES: Record<WardrobeCategory, string[]> = SUBCATEGORY_MAP;

export interface WardrobeItem {
  id: string;
  userId: string;
  category: WardrobeCategory;
  subCategory: string;
  color: string;
  colorHex?: string;
  pattern: string;
  material: string;
  season: string[];
  brand?: string;
  size?: string;
  imageUrls: string[];
  styleTags: string[];
  occasionTags: string[];
  formalityScore: number;
  warmthScore: number;
  matchabilityScore: number;
  fitRisk: string;
  matchColors: string[];
  matchCategories: string[];
  aiSummary: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GarmentRecognitionResult {
  category: string;
  subCategory: string;
  color: string;
  colorHex: string;
  pattern: string;
  material: string;
  season: string[];
  styleTags: string[];
  occasionTags: string[];
  formalityScore: number;
  warmthScore: number;
  matchabilityScore: number;
  fitRisk: string;
  matchColors: string[];
  matchCategories: string[];
  aiSummary: string;
}

export interface RecognizeResponse {
  item: WardrobeItem;
  recognition: GarmentRecognitionResult;
}

export const CATEGORY_LABELS: Record<WardrobeCategory, string> = SHARED_CATEGORY_LABELS;

export const CATEGORY_EMOJI: Record<WardrobeCategory, string> = {
  top: '👚',
  outerwear: '🧥',
  bottom: '👖',
  dress: '👗',
  shoes: '👟',
  bag: '👜',
  hat: '🎩',
  accessory: '💍',
};

export const SEASON_LABELS: Record<string, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
};

// ---------- 买前判断 ----------

export interface PurchaseEvaluationResult {
  decision: 'buy' | 'consider' | 'skip';
  score: number;
  reasons: string[];
  matchedWardrobeItems: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
  possibleOutfits: string[];
  duplicateRisk: 'low' | 'medium' | 'high';
  idleRisk: 'low' | 'medium' | 'high';
  betterColors: string[];
  recommendedCategory?: string;
  skipReasons?: string[];
}

export const DECISION_LABELS: Record<string, string> = {
  buy: '值得买',
  consider: '可以考虑',
  skip: '不建议买',
};

export const RISK_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};
