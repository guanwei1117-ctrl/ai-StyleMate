'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser, isAuthenticated } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/auth');
      return;
    }
    const user = getAuthUser();
    if (!user || user.role !== 'admin') {
      router.replace('/');
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        正在验证管理员身份...
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: '仪表盘' },
    { href: '/admin/ootd', label: '帖子审核' },
    { href: '/admin/tags', label: '标签管理' },
    { href: '/admin/suggestions', label: '用户建议' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-6">
          <span className="font-bold text-gray-800">StyleMate 管理后台</span>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/" className="ml-auto text-sm text-gray-400 hover:text-gray-600">
            ← 返回用户端
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
