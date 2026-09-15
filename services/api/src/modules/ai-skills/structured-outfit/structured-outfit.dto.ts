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
  /** M16：可选教练子模式（shopping/occasion/combination/mixed） */
  coachMode?: string;
  /** 是否要求每件衣物输出 bbox（归一化边界框），用于从原图裁剪该衣物入库 */
  withBbox?: boolean;
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
  /**
   * 归一化边界框 [x0, y0, x1, y1]，值 0-1（左上角为原点，x 向右，y 向下）。
   * 仅 when withBbox=true 时返回，用于从原图裁剪该衣物。
   */
  bbox?: [number, number, number, number];
}

export interface StructuredOutfitResult {
  items: StructuredOutfitItem[];
  body_suggestions: string[];
  style_tags: string[];
  problems: string[];
  improvements: string[];
}
