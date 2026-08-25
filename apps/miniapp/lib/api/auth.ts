/**
 * 认证相关 API —— 微信登录适配
 */
import { request } from './request';

export interface AuthUser {
  userId: string;
  phone: string;
  nickname?: string;
  role?: 'user' | 'admin';
}

export interface WxLoginResponse {
  accessToken: string;
  userId: string;
  isNewUser: boolean;
  nickname?: string;
}

/**
 * 微信登录
 * 调用 wx.login 获取 code，然后传给后端换取 JWT
 */
export async function wxLogin(): Promise<WxLoginResponse> {
  // 1. 获取微信 code
  const loginResult = await wx.login();
  if (!loginResult.code) {
    throw new Error('微信登录失败，无法获取临时凭证');
  }

  // 2. 传给后端
  return request<WxLoginResponse>('/auth/wx-login', {
    method: 'POST',
    data: { code: loginResult.code },
  });
}

/**
 * 获取用户信息（需要用户授权）
 */
export async function getUserProfile(): Promise<any> {
  try {
    const setting = await wx.getSetting();
    if (!setting.authSetting['scope.userInfo']) {
      // 需要用户点击授权按钮，不能直接调用
      return null;
    }
    const userInfo = await wx.getUserProfile({ desc: '用于完善个人资料' });
    return userInfo.userInfo;
  } catch {
    return null;
  }
}

/**
 * 获取存储的 token
 */
export function getStoredToken(): string | null {
  try {
    return wx.getStorageSync('token') || null;
  } catch {
    return null;
  }
}

/**
 * 获取存储的用户信息
 */
export function getStoredUser(): any {
  try {
    return wx.getStorageSync('userInfo') || null;
  } catch {
    return null;
  }
}

/**
 * 登出
 */
export function logout(): void {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  const app = getApp();
  app.logout();
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getStoredToken();
}