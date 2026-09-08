/**
 * 前端反馈 API 封装。
 * 与后端 /feedback 端点通信，记录用户长期记忆。
 */

import { getCurrentUserId, getAuthToken } from './auth';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface FeedbackInput {
  reaction: 'like' | 'dislike';
  rating?: number;
  comment?: string;
  planTitle?: string;
  plan?: Record<string, any>;
}

/**
 * /feedback 接口响应（含"AI 记住了"的可感知提示，向后兼容）
 * - 顶层 id/userId/reaction/rating/comment/planTitle/plan/createdAt：原 Feedback 实体字段（向后兼容）
 * - aiMemoryNote：给用户的可感知文案（让"AI 记住我"在产品上立刻可见）
 * - memoryUpdated：长期记忆是否成功同步（失败时 aiMemoryNote 会说明）
 */
export interface FeedbackResponse {
  id: string;
  userId: string;
  reaction: 'like' | 'dislike';
  rating?: number;
  comment?: string;
  planTitle?: string;
  plan?: Record<string, any>;
  createdAt: string;
  aiMemoryNote: string;
  memoryUpdated: boolean;
}

export async function submitFeedback(input: FeedbackInput): Promise<FeedbackResponse> {
  const userId = getCurrentUserId();
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ userId, ...input }),
  });
  if (!res.ok) throw new Error('提交反馈失败');
  return res.json();
}

export async function getFeedbackStats(): Promise<{
  total: number;
  likes: number;
  dislikes: number;
  avgRating: number;
}> {
  const userId = getCurrentUserId();
  const res = await fetch(
    `${API_BASE}/feedback/stats?userId=${encodeURIComponent(userId)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error('获取反馈统计失败');
  return res.json();
}
