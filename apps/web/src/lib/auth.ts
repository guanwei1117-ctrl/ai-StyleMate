/**
 * 统一认证状态管理
 *
 * 优先级：JWT 登录用户 > localStorage 本地用户
 * 未登录用户仍可使用 app，数据存本地；登录后数据关联到账号。
 */

const TOKEN_KEY = 'stylemate:auth-token';
const USER_KEY = 'stylemate:auth-user';
const LOCAL_ID_KEY = 'stylemate:wardrobe-user-id';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface AuthUser {
  userId: string;
  phone: string;
  nickname?: string;
  role?: 'admin' | 'user';
}

// ==================== Token & User 管理 ====================

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  } catch {
    return null;
  }
}

/** 获取当前 userId：优先登录用户，回退到本地 localStorage ID */
export function getCurrentUserId(): string {
  const authUser = getAuthUser();
  if (authUser) return authUser.userId;
  return getLocalUserId();
}

/** 本地 ID（未登录用户的设备标识） */
export function getLocalUserId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  let id = window.localStorage.getItem(LOCAL_ID_KEY);
  if (!id) {
    id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(LOCAL_ID_KEY, id);
  }
  return id;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getAuthUser();
}

function saveAuth(token: string, user: AuthUser): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

// ==================== API 调用 ====================

/** 注册 */
export async function register(
  phone: string,
  password: string,
  nickname?: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, nickname, legacyUserId: getLocalUserId() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '注册失败' }));
    throw new Error(err.message || '注册失败');
  }
  const data = await res.json();
  const user: AuthUser = { userId: data.userId, phone, nickname };
  saveAuth(data.accessToken, user);
  return user;
}

/** 登录 */
export async function login(phone: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, legacyUserId: getLocalUserId() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '登录失败' }));
    throw new Error(err.message || '登录失败');
  }
  const data = await res.json();
  const user: AuthUser = { userId: data.userId, phone };
  saveAuth(data.accessToken, user);
  return user;
}
