/**
 * 今天穿什么 — 前端类型定义
 */

export interface WeatherInfo {
  city: string;
  condition: string;
  weatherCode: number;
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  humidity: number;
  isRaining: boolean;
}

export interface OutfitPlanItem {
  itemId: string;
  category: string;
  description: string;
  /** 是否为建议购买的单品（空衣橱起步方案） */
  isSuggestion?: boolean;
  /** 建议预算（如"¥150-300"） */
  budgetHint?: string;
}

export interface OutfitPlan {
  type: 'safe' | 'flattering' | 'vibe';
  title: string;
  hat: OutfitPlanItem | null;
  top: OutfitPlanItem | null;
  bottom: OutfitPlanItem | null;
  outerwear: OutfitPlanItem | null;
  shoes: OutfitPlanItem | null;
  bag: OutfitPlanItem | null;
  accessory: OutfitPlanItem | null;
  reason: string;
  scene: string;
  riskWarning: string;
  score: number;
}

export interface TodayOutfitResponse {
  weather: WeatherInfo;
  plans: OutfitPlan[];
  /** 是否为空衣橱起步方案（单品均为购买建议） */
  isStarter?: boolean;
  /** 起步方案提示文案 */
  starterMessage?: string;
  /**
   * AI 引用了哪些专业知识（可解释性证据，RAG 检索结果）
   * - 来自后端 RAG 知识库（体型/色彩/场合/风格百科）
   * - 为空数组或 undefined 时表示"无证据命中"，前端可不展示
   */
  knowledgeUsed?: string[];
  /**
   * AI "读到了"哪些用户偏好（前端的"我注意到你 X"用）
   * - 派生自后端 memoryContext.snapshot
   * - 最多 4 条；空数组或 undefined 时前端不展示
   */
  memoryEcho?: string[];
}

export const OCCASION_OPTIONS = [
  { value: 'commute', label: '通勤' },
  { value: 'work', label: '上班' },
  { value: 'date', label: '约会' },
  { value: 'client', label: '见客户' },
  { value: 'shopping', label: '逛街' },
  { value: 'travel', label: '旅行' },
  { value: 'party', label: '聚会' },
  { value: 'casual', label: '日常' },
] as const;

export const STYLE_GOAL_OPTIONS = [
  { value: 'comfortable', label: '舒服' },
  { value: 'slimming', label: '显瘦' },
  { value: 'taller', label: '显高' },
  { value: 'polished', label: '精致' },
  { value: 'lowkey', label: '低调' },
  { value: 'photogenic', label: '拍照好看' },
] as const;

export const PLAN_TYPE_LABELS: Record<OutfitPlan['type'], string> = {
  safe: '稳妥不出错',
  flattering: '显瘦显高',
  vibe: '更有氛围感',
};

export const PLAN_TYPE_EMOJI: Record<OutfitPlan['type'], string> = {
  safe: '🛡️',
  flattering: '✨',
  vibe: '🎨',
};
