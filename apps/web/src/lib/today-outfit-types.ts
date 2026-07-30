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
}

export interface OutfitPlan {
  type: 'safe' | 'flattering' | 'vibe';
  title: string;
  top: OutfitPlanItem | null;
  bottom: OutfitPlanItem | null;
  outerwear: OutfitPlanItem | null;
  shoes: OutfitPlanItem | null;
  accessory: OutfitPlanItem | null;
  reason: string;
  scene: string;
  riskWarning: string;
  score: number;
}

export interface TodayOutfitResponse {
  weather: WeatherInfo;
  plans: OutfitPlan[];
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
