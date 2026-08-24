'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuggestionFab } from './suggestion-fab';

/**
 * React Query Provider — 包裹整个应用
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 分钟缓存
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * 全局建议悬浮按钮 —— 在非 /admin 路径下显示。
 * 管理端有自己的布局，不需要用户建议入口。
 */
export function GlobalSuggestionFab() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <SuggestionFab />;
}
