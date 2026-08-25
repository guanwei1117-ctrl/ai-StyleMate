/**
 * 用户建议 API 封装。
 * 对接后端 POST /suggestions（公开端点）。
 */

import { getAuthToken } from './auth';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type SuggestionCategory = 'bug' | 'feature' | 'other';

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function submitSuggestion(input: {
  content: string;
  category?: SuggestionCategory;
}): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      ...input,
      pageUrl: typeof window !== 'undefined' ? window.location.href : null,
    }),
  });
  if (!res.ok) throw new Error('提交建议失败');
  return res.json();
}
