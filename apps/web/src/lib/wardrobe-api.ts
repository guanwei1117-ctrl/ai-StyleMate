import {
  WardrobeItem,
  WardrobeCategory,
  RecognizeResponse,
  PurchaseEvaluationResult,
} from './wardrobe-types';
import { buildApiErrorMessage } from './api-error';
import { getCurrentUserId, getAuthToken } from './auth';
import { compressImage } from './image-compress';
import { removeBackground, blobToDataUrl } from './remove-background';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** @deprecated 使用 getCurrentUserId() 替代 */
export { getCurrentUserId as getLocalUserId };

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fileToDataUrl(file: File): Promise<string> {
  // 压缩后再转 base64，减少 AI API 传输量
  const compressed = await compressImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(compressed);
  });
}

/**
 * AI 识别衣物图片并落库（含本地抠图）
 *
 * 流程：压缩 → 抠图（浏览器本地，免费）→ 原图送 AI 识别 → 抠图存为展示用
 */
export async function recognizeAndAddItem(
  file: File,
): Promise<RecognizeResponse> {
  // 1. 压缩原图
  const compressed = await compressImage(file);
  const imageBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(compressed);
  });

  // 2. 本地抠图（浏览器 WebAssembly，不调远程 API）
  // 抠图失败时使用压缩后的原图，确保衣橱始终有图片显示
  let processedImageBase64: string;
  try {
    const removedBgBlob = await removeBackground(compressed);
    processedImageBase64 = await blobToDataUrl(removedBgBlob);
  } catch {
    console.warn('本地抠图失败，使用原图');
    processedImageBase64 = imageBase64;
  }

  const userId = getCurrentUserId();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/wardrobe/items/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        userId,
        imageBase64,
        imageUrls: [processedImageBase64],
      }),
    });
  } catch {
    throw new Error('无法连接 AI 服务，请确认后端 API（localhost:4000）已启动。');
  }

  if (!res.ok) {
    throw new Error(await buildApiErrorMessage(res, '衣物识别请求失败'));
  }

  const json = await res.json();
  // wardrobe controller 直接返回 service 结果（未包 ApiResponse），兼容两种
  let result: RecognizeResponse;
  if (json && json.item && json.recognition) {
    result = json as RecognizeResponse;
  } else if (json && json.code !== undefined) {
    result = json.data as RecognizeResponse;
  } else {
    result = json as RecognizeResponse;
  }

  // 确保抠图后的图片在 imageUrls 中（后端可能没存或存了原图）
  if (processedImageBase64 && (!result.item.imageUrls || result.item.imageUrls.length === 0)) {
    result.item.imageUrls = [processedImageBase64];
  }

  return result;
}

/**
 * 获取用户衣物列表
 */
export async function fetchWardrobeItems(
  category?: WardrobeCategory,
): Promise<WardrobeItem[]> {
  const userId = getCurrentUserId();
  const params = new URLSearchParams({ userId });
  if (category) params.set('category', category);

  const res = await fetch(`${API_BASE}/wardrobe/items?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`获取衣物列表失败: ${res.status}`);
  }
  return res.json();
}

/**
 * 获取衣物详情
 */
export async function fetchWardrobeItem(id: string): Promise<WardrobeItem> {
  const res = await fetch(`${API_BASE}/wardrobe/items/${id}`, {
    headers: authHeaders(),
  });
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
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
    headers: authHeaders(),
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
    headers: authHeaders(),
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
  const userId = getCurrentUserId();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/recommendations/purchase-evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
