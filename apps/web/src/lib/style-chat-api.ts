/**
 * 引导式 AI 测评对话 — 前端 API
 */

export interface StyleChatBasicInfo {
  gender?: string;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  occupation?: string | null;
  city?: string | null;
}

export interface StyleChatTurn {
  role: 'assistant' | 'user';
  content: string;
}

export interface StyleChatResult {
  reply: string;
  done: boolean;
  statement?: string;
  likedKeywords?: string[];
  dislikedKeywords?: string[];
  scenes?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * 与 AI 穿搭顾问对话一轮：
 * - 首轮 userMessage 为空 → AI 打招呼并提第一个问题
 * - forceFinalize → 用户主动结束，AI 输出总结
 */
export async function chatWithStylist(params: {
  userId?: string;
  basicInfo: StyleChatBasicInfo;
  history: StyleChatTurn[];
  userMessage?: string;
  forceFinalize?: boolean;
}): Promise<StyleChatResult> {
  const userId = getLocalUserId();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/scoring/style-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...params }),
    });
  } catch {
    throw new Error('无法连接 AI 服务，请确认后端 API（localhost:4000）已启动。');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '对话失败' }));
    throw new Error(err.message || '对话失败');
  }
  return res.json();
}
