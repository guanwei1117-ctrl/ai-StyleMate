import {
  WardrobeItem,
  WardrobeCategory,
  RecognizeResponse,
  PurchaseEvaluationResult,
} from './wardrobe-types';
import { buildApiErrorMessage } from './api-error';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 本地 userId 管理（沿用现有无登录系统方案）
 *
 * 在 localStorage 持久化一个稳定 userId，所有衣柜请求带上。
 */
const USER_ID_KEY = 'stylemate:wardrobe-user-id';

export function getLocalUserId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  let id = window.localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * AI 识别衣物图片并落库
 */
export async function recognizeAndAddItem(
  file: File,
): Promise<RecognizeResponse> {
  const imageBase64 = await fileToDataUrl(file);
  const userId = getLocalUserId();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/wardrobe/items/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, imageBase64 }),
    });
  } catch {
    throw new Error('无法连接 AI 服务，请确认后端 API（localhost:4000）已启动。');
  }

  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '衣物识别请求失败'));
  }

  const json = await res.json();
  // wardrobe controller 直接返回 service 结果（未包 ApiResponse），兼容两种
  if (json && json.item && json.recognition) {
    return json as RecognizeResponse;
  }
  if (json && json.code !== undefined) {
    return json.data as RecognizeResponse;
  }
  return json as RecognizeResponse;
}

/**
 * 获取用户衣物列表
 */
export async function fetchWardrobeItems(
  category?: WardrobeCategory,
): Promise<WardrobeItem[]> {
  const userId = getLocalUserId();
  const params = new URLSearchParams({ userId });
  if (category) params.set('category', category);

  const res = await fetch(`${API_BASE}/wardrobe/items?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`获取衣物列表失败: ${res.status}`);
  }
  return res.json();
}

/**
 * 获取衣物详情
 */
export async function fetchWardrobeItem(id: string): Promise<WardrobeItem> {
  const res = await fetch(`${API_BASE}/wardrobe/items/${id}`);
  if (!res.ok) {
    throw new Error(`获取衣物详情失败: ${res.status}`);
  }
  return res.json();
}

/**
 * 更新衣物信息
 */
export async function updateWardrobeItem(
  id: string,
  data: Partial<WardrobeItem>,
): Promise<WardrobeItem> {
  const res = await fetch(`${API_BASE}/wardrobe/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`更新衣物失败: ${res.status}`);
  }
  return res.json();
}

/**
 * 删除衣物
 */
export async function deleteWardrobeItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/wardrobe/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`删除衣物失败: ${res.status}`);
  }
}

/**
 * 记录穿着次数 +1
 */
export async function recordWear(id: string): Promise<WardrobeItem> {
  const res = await fetch(`${API_BASE}/wardrobe/items/${id}/wear`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`记录穿着失败: ${res.status}`);
  }
  return res.json();
}

/**
 * 买前判断 — 上传商品图片，AI 结合衣橱判断是否值得购买
 */
export async function evaluatePurchase(
  file: File,
): Promise<PurchaseEvaluationResult> {
  const imageBase64 = await fileToDataUrl(file);
  const userId = getLocalUserId();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/recommendations/purchase-evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, imageBase64 }),
    });
  } catch {
    throw new Error('无法连接 AI 服务，请确认后端 API（localhost:4000）已启动。');
  }

  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '买前判断请求失败'));
  }

  return res.json();
}
