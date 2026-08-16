/**
 * 单品出发搭配 AI Skill
 *
 * 输入：焦点单品（衣橱单品）+ 用户衣橱 + 可选场合 + 长期记忆
 * 输出：2-3 套以该单品为核心的搭配方案（衣橱已有单品 + 建议补充的单品）
 */

/** 单品摘要（与穿搭推荐 skill 保持一致） */
export interface ItemStylingWardrobeItem {
  id: string;
  category: string;
  subCategory: string;
  color: string;
  material: string;
  season: string[];
  styleTags: string[];
  occasionTags: string[];
  formalityScore: number;
  warmthScore: number;
  matchabilityScore: number;
  matchColors: string[];
  matchCategories: string[];
}

export interface ItemStylingSlotItem {
  /** 衣橱单品 ID（建议购买的单品为空字符串） */
  itemId: string;
  category: string;
  description: string;
  /** 是否为建议购买的单品 */
  isSuggestion?: boolean;
  /** 建议预算（如"¥150-300"） */
  budgetHint?: string;
}

export interface ItemStylingPlan {
  type: 'safe' | 'flattering' | 'vibe';
  title: string;
  hat: ItemStylingSlotItem | null;
  top: ItemStylingSlotItem | null;
  bottom: ItemStylingSlotItem | null;
  outerwear: ItemStylingSlotItem | null;
  shoes: ItemStylingSlotItem | null;
  bag: ItemStylingSlotItem | null;
  accessory: ItemStylingSlotItem | null;
  reason: string;
  scene: string;
  riskWarning: string;
  score: number;
}

export interface ItemStylingInput {
  /** 焦点单品 */
  focusItem: ItemStylingWardrobeItem;
  /** 衣橱其余单品 */
  wardrobeItems: ItemStylingWardrobeItem[];
  /** 场合（可选） */
  occasion?: string;
  /** 长期记忆上下文 */
  memoryContext?: import('../../memory/memory.dto').AIMemoryContext | null;
}

export interface ItemStylingResult {
  /** 焦点单品描述 */
  focusItemName: string;
  plans: ItemStylingPlan[];
  /** 提示文案 */
  note: string;
}
