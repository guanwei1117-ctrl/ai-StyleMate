/**
 * 共享表单字段组件 — 从 onboarding/page.tsx 提取
 * 纯展示组件，无业务逻辑依赖
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function SectionHeader({ icon: Icon, label, title, copy }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1">
        <Icon className="h-3 w-3 text-primary-600" />
        <span className="text-[11px] font-medium tracking-wide text-primary-700">{label}</span>
      </div>
      <h2 className="mb-1 font-display text-sub font-semibold text-ink-900">{title}</h2>
      <p className="text-sm leading-relaxed text-ink-400">{copy}</p>
    </div>
  );
}

export function TagGroup({ label, items, type = 'positive' }: {
  label: string;
  items: string[];
  type?: 'positive' | 'negative';
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5 last:mb-0">
      <p className="mb-2 text-xs text-ink-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={cn(
            'rounded-md px-2.5 py-1 text-xs',
            type === 'negative' ? 'bg-red-50/60 text-red-700' : 'bg-white/80 text-ink-600',
          )}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function IntentChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs text-ink-400">{label}</p>
      <span className="inline-block rounded-md bg-ink-900/5 px-3 py-1.5 text-xs font-medium text-ink-800">
        {value}
      </span>
    </div>
  );
}

export function FieldGroup({ title, optional, children }: {
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-medium text-ink-800">{title}</h3>
        {optional && <span className="text-xs text-ink-300">选填</span>}
      </div>
      {children}
    </div>
  );
}

export function ChoiceButton({ active, compact, children, onClick }: {
  active: boolean;
  compact?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-xl border text-sm font-medium transition-all duration-200 active:scale-[0.98]',
        compact ? 'px-4 py-2' : 'px-4 py-3',
        active
          ? 'border-ink-900 bg-primary-50 text-ink-900 shadow-sm'
          : 'border-ink-200 bg-white text-ink-600 hover:-translate-y-0.5 hover:border-ink-400 hover:text-ink-900 hover:shadow-lift',
      )}
    >
      {children}
    </button>
  );
}

export function NumberInput({ label, unit, value, placeholder, onChange }: {
  label: string;
  unit: string;
  value: string | number;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-800">
        {label}
        <span className="ml-1 text-xs text-ink-300">{unit}</span>
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-900 transition-all duration-200 placeholder:text-ink-300 hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
      />
    </label>
  );
}
