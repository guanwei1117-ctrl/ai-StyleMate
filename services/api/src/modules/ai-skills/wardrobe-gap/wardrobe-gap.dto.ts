/**
 * 衣橱缺口分析 AI Skill
 *
 * 输入：衣橱单品摘要 + 当前季节 + 用户长期记忆 + 预算档位
 * 输出：个性化缺口清单（缺什么、为什么、优先级、具体建议）
 */

export interface WardrobeGapInput {
  /** 衣橱单品摘要 */
  wardrobeItems: Array<{
    id: string;
    category: string;
    subCategory: string;
    color: string;
    season: string[];
    styleTags: string[];
    occasionTags: string[];
    formalityScore: number;
    warmthScore: number;
    matchabilityScore: number;
  }>;
  /** 当前季节 */
  season: string;
  /** 预算档位 */
  budgetLevel?: string;
  /** 长期记忆上下文 */
  memoryContext?: import('../../memory/memory.dto').AIMemoryContext | null;
}

export interface WardrobeGapSuggestion {
  /** 建议补充的二级子类 */
  subCategory: string;
  /** 建议颜色 */
  color: string;
  /** 风格标签 */
  styleTags: string[];
  /** 预算区间（如"¥200-400"） */
  budgetRange: string;
}

export interface WardrobeGapItem {
  /** 品类 */
  category: string;
  /** 当前数量 */
  current: number;
  /** 建议数量 */
  recommended: number;
  /** 缺口数量 */
  missing: number;
  /** 优先级 1=先买 2=其次 3=可缓 */
  priority: number;
  /** 为什么缺 */
  reason: string;
  /** 具体购买建议 */
  suggestion: WardrobeGapSuggestion;
}

export interface WardrobeGapResult {
  /** 一句话总结 */
  summary: string;
  /** 缺口清单（按优先级排序） */
  gaps: WardrobeGapItem[];
  /** 是否为 AI 个性化分析（false 表示规则回退） */
  personalized: boolean;
}
