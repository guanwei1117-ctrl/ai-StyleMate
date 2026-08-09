import { EvaluateOutfitResponse } from './scoring-types';
import { buildApiErrorMessage } from './api-error';
import { getCurrentUserId, getAuthToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 提交穿搭照片进行评分
 */
export async function evaluateOutfit(params: {
  imageBase64: string;
  userContext?: {
    bodyShape?: string;
    gender?: string;
    height?: number;
    weight?: number;
    occasion?: string;
  };
}): Promise<EvaluateOutfitResponse> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/scoring/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...params, userId: getCurrentUserId() }),
  });

  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '评分请求失败'));
  }

  const json: ApiResponse<EvaluateOutfitResponse> = await res.json();

  if (json.code !== 200) {
    throw new Error(json.message || '评分失败');
  }

  return json.data;
}
