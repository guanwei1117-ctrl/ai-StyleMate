'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Shirt, Calendar } from 'lucide-react';

const TABS = [
  { label: '尝试', icon: Sparkles, href: '/wardrobe/try' },
  { label: '衣橱', icon: Shirt, href: '/wardrobe' },
  { label: '计划', icon: Calendar, href: '/wardrobe/plan' },
] as const;

/** 桌面端顶部子导航：墨色胶囊选中态，替代原底部移动端 Dock */
export default function WardrobeSubNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/wardrobe') {
      return pathname === '/wardrobe';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label="衣橱导航" className="bg-creme-200">
      <div className="mx-auto flex max-w-7xl justify-center px-6 pt-4 lg:px-10">
        <div className="inline-flex items-center gap-1 rounded-full border border-ink-900/10 bg-white p-1 shadow-card">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
                  active
                    ? 'bg-ink-900 font-medium text-creme-50'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                <tab.icon size={15} strokeWidth={1.5} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
