/**
 * 今天穿什么 — 前端 API
 */

import {
  TodayOutfitResponse,
  OutfitPlan,
  WeatherInfo,
} from './today-outfit-types';
import { buildApiErrorMessage } from './api-error';
import { getLocalUserId } from './wardrobe-api';
import { getAuthToken } from './auth';

function authHeaders(): Record<string, string> { const t = getAuthToken(); return t ? { Authorization: 'Bearer ' + t } : {}; }
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * 生成今天穿什么推荐
 */
export async function generateTodayOutfit(params: {
  city: string;
  occasion: string;
  styleGoal: string;
  constraints: string[];
}): Promise<TodayOutfitResponse> {
  const userId = getLocalUserId();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/recommendations/today-outfit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ userId, ...params }),
    });
  } catch {
    throw new Error('无法连接 AI 服务，请确认后端 API（localhost:4000）已启动。');
  }

  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '穿搭推荐请求失败'));
  }

  return res.json();
}

/**
 * 保存穿搭方案
 */
export async function saveOutfit(params: {
  plan: OutfitPlan;
  weather: WeatherInfo;
  occasion: string;
  styleGoal: string;
}): Promise<{ id: string }> {
  const userId = getLocalUserId();

  const res = await fetch(`${API_BASE}/recommendations/save-outfit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ userId, ...params }),
  });

  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '保存穿搭失败'));
  }

  return res.json();
}
