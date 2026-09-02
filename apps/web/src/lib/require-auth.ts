'use client';

import { useRouter } from 'next/navigation';
import { isAuthenticated } from './auth';

/**
 * 通用登录检查钩子
 * 返回一个 requireAuth 函数，在需要登录的操作前调用。
 * 未登录时自动跳转到 /auth 并提示。
 */
export function useRequireAuth() {
  const router = useRouter();

  const requireAuth = (message?: string): boolean => {
    if (!isAuthenticated()) {
      alert(message || '请先登录后再继续');
      router.push('/auth');
      return false;
    }
    return true;
  };

  return { requireAuth };
}