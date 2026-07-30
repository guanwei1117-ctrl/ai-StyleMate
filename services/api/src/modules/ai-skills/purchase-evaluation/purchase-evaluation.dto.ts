/**
 * 买前判断 AI Skill
 *
 * 用户上传商品图片，AI 结合用户衣橱判断是否值得购买。
 * 判断维度：风格适配、身材适配、重复风险、搭配可能性、闲置风险、颜色选择等。
 */

import { WardrobeItem } from '../../wardrobe/entities/wardrobe-item.entity';

export interface PurchaseEvaluationInput {
  /** 商品图片 base64 */
  imageBase64: string;
  /** 用户衣橱单品列表 */
  wardrobeItems: WardrobeItem[];
  /** 用户画像（可选） */
  userProfile?: {
    bodyShape?: string;
    stylePreferences?: string[];
    dressingGoals?: string[];
  };
}

export interface MatchedWardrobeItem {
  id: string;
  name: string;
  reason: string;
}

export interface PurchaseEvaluationResult {
  /** 购买决策 */
  decision: 'buy' | 'consider' | 'skip';
  /** 综合评分 0-100 */
  score: number;
  /** 判断理由列表 */
  reasons: string[];
  /** 可搭配的衣橱单品 */
  matchedWardrobeItems: MatchedWardrobeItem[];
  /** 可搭出的穿搭描述 */
  possibleOutfits: string[];
  /** 重复风险 */
  duplicateRisk: 'low' | 'medium' | 'high';
  /** 闲置风险 */
  idleRisk: 'low' | 'medium' | 'high';
  /** 更推荐的颜色 */
  betterColors: string[];
  /** 更值得补充的品类 */
  recommendedCategory?: string;
  /** 不建议购买的原因 */
  skipReasons?: string[];
}
