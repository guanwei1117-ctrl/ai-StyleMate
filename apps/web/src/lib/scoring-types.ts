/** 前端评分相关类型定义 */

export type ScoringDimensionKey =
  | 'proportion'
  | 'color'
  | 'occasion'
  | 'coherence'
  | 'trend'
  | 'creativity'
  | 'bodyFit'
  | 'practicality';

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

/** 页面两种状态 */
export type ScoringState = 'upload' | 'result';
