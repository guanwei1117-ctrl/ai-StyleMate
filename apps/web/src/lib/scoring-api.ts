import { EvaluateOutfitResponse, BloggerInfo } from './scoring-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取可用的博主列表
 */
export async function fetchBloggers(): Promise<BloggerInfo[]> {
  const res = await fetch(`${API_BASE}/scoring/bloggers`);
  if (!res.ok) {
    throw new Error(`获取博主列表失败: ${res.status}`);
  }
  const json: ApiResponse<BloggerInfo[]> = await res.json();
  return json.data;
}

/**
 * 提交穿搭照片进行评分
 */
export async function evaluateOutfit(params: {
  imageBase64: string;
  bloggerId: string;
  userContext?: {
    bodyShape?: string;
    gender?: string;
    height?: number;
    weight?: number;
    occasion?: string;
  };
}): Promise<EvaluateOutfitResponse> {
  const res = await fetch(`${API_BASE}/scoring/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`评分请求失败: ${res.status}`);
  }

  const json: ApiResponse<EvaluateOutfitResponse> = await res.json();

  if (json.code !== 200) {
    throw new Error(json.message || '评分失败');
  }

  return json.data;
}
