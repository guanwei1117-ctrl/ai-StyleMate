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
 *
 * @param params.userId 显式传入时覆盖默认 localUserId；传 undefined 表示「分析模式」——
 *   后端会跳过长期记忆读取（scoring.service.ts 的 `if (userId && this.memoryService)` 已天然支持）
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
  /** 显式覆盖默认 userId；传 `undefined` 时由调用方语义决定（'skip' = 分析模式，不传 userId） */
  userId?: string | 'skip';
}): Promise<EvaluateOutfitResponse> {
  const token = getAuthToken();
  // 'skip' 哨兵值 → 真正不传 userId（分析模式：AI 不读用户偏好与长期记忆）
  const userId = params.userId === 'skip' ? undefined : params.userId ?? getCurrentUserId();
  const res = await fetch(`${API_BASE}/scoring/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...params, userId }),
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
