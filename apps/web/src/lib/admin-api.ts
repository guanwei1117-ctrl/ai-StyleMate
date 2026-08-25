/**
 * 管理端 API 封装。
 * 所有请求带 JWT，后端通过 RolesGuard 校验 admin 角色。
 */

import { getAuthToken } from './auth';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '请求失败' }));
    throw new Error(err.message || `请求失败 (${res.status})`);
  }
  return res.json();
}

export interface OverviewData {
  totalUsers: number;
  newToday: number;
  profileRate: number;
  totalFeedback: number;
  totalSuggestions: number;
  newSuggestions: number;
}

export interface UsersTrendItem {
  date: string;
  count: number;
}

export interface ProfileDistribution {
  bodyTypes: { value: string; count: number }[];
  likedStyles: { value: string; count: number }[];
}

export interface FeedbackStats {
  total: number;
  likes: number;
  dislikes: number;
  avgRating: number;
  negative: Array<{
    id: string;
    userId: string;
    reaction: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
}

export interface LlmStats {
  total: number;
  success: number;
  failed: number;
  failRate: number;
  avgElapsed: number;
  providers: { provider: string; count: number }[];
}

export interface SuggestionItem {
  id: string;
  userId: string | null;
  content: string;
  category: string;
  status: string;
  pageUrl: string | null;
  createdAt: string;
}

export interface SuggestionList {
  items: SuggestionItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const adminApi = {
  overview: () => fetchJson<OverviewData>('/admin/overview'),
  usersTrend: (days = 30) => fetchJson<UsersTrendItem[]>(`/admin/users-trend?days=${days}`),
  profileDistribution: () => fetchJson<ProfileDistribution>('/admin/profile-distribution'),
  feedbackStats: () => fetchJson<FeedbackStats>('/admin/feedback-stats'),
  llmStats: (days = 7) => fetchJson<LlmStats>(`/admin/llm-stats?days=${days}`),
  suggestions: (page = 1, pageSize = 20, status?: 'new' | 'viewed') =>
    fetchJson<SuggestionList>(
      `/admin/suggestions?page=${page}&pageSize=${pageSize}${status ? `&status=${status}` : ''}`,
    ),
  markSuggestionViewed: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/suggestions/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('标记失败');
  },
};
