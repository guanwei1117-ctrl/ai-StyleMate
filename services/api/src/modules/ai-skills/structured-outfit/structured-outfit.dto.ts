/**
 * 结构化穿搭分析 AI Skill
 *
 * 对一张穿搭照片进行结构化分析，返回 items / body_suggestions / style_tags / problems / improvements。
 * 该结构化结果可被数字衣柜、今日穿搭推荐、买前判断等功能复用。
 */

export interface StructuredOutfitInput {
  /** 穿搭照片 base64 */
  imageBase64: string;
  /** 可选场合提示 */
  occasion?: string;
}

export interface StructuredOutfitItem {
  type: 'top' | 'outerwear' | 'bottom' | 'dress' | 'shoes' | 'bag' | 'hat' | 'accessory';
  name: string;
  color: string;
  style: string[];
  season: string[];
  /** 1-5 */
  formality: number;
  /** 1-10 */
  matchability: number;
}

export interface StructuredOutfitResult {
  items: StructuredOutfitItem[];
  body_suggestions: string[];
  style_tags: string[];
  problems: string[];
  improvements: string[];
}
