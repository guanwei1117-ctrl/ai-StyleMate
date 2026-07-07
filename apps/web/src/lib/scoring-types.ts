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
  bloggerName: string;
  bloggerId: string;
  greeting: string;
  overallComment: string;
  dimensions: DimensionScore[];
  itemComments: string[];
  improvements: string[];
}

export interface BloggerInfo {
  id: string;
  name: string;
  platform: string;
  avatarUrl?: string;
  styleSignature: string;
  description: string;
}

/** 页面三种状态 */
export type ScoringState = 'upload' | 'select-blogger' | 'result';
