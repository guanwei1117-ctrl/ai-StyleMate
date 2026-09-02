'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * 精致胶囊 Tab：选中态墨色填充 + 200ms 过渡，替代生硬的黑底/灰边对比
 */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-card',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              'cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
              selected
                ? 'bg-ink-900 text-creme-50 shadow-sm'
                : 'text-ink-500 hover:bg-ink-900/5 hover:text-ink-900',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
