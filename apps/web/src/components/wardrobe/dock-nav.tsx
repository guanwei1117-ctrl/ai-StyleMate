'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Shirt, Calendar } from 'lucide-react';

const TABS = [
  { label: '尝试', icon: Sparkles, href: '/wardrobe/try' },
  { label: '衣橱', icon: Shirt, href: '/wardrobe' },
  { label: '计划', icon: Calendar, href: '/wardrobe/plan' },
] as const;

export default function DockNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/wardrobe') {
      return pathname === '/wardrobe';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-ink-900/10 bg-creme-100/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)]" aria-label="衣橱导航">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-6 py-2 transition-colors ${
                active
                  ? 'text-ink-900'
                  : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2 : 1.5} />
              <span className={`text-[11px] font-medium tracking-wide ${active ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
