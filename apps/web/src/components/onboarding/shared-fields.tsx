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
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-ink-900/6 px-3 py-0.5">
        <Icon className="h-3 w-3 text-ink-500" />
        <span className="text-[11px] font-medium text-ink-500">{label}</span>
      </div>
      <h2 className="mb-1 text-xl font-bold tracking-tight text-ink-900">{title}</h2>
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
            'px-2.5 py-1 text-xs',
            type === 'negative' ? 'bg-red-50/60 text-red-700' : 'bg-white/65 text-ink-600',
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
      <span className="inline-block bg-ink-900/5 px-3 py-1.5 text-xs font-medium text-ink-800">
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
        'border text-sm transition',
        compact ? 'px-4 py-2' : 'px-4 py-3',
        active
          ? 'border-ink-900 bg-ink-900 text-creme-100'
          : 'border-ink-900/10 bg-white/50 text-ink-600 hover:border-ink-900/35 hover:text-ink-900',
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
        className="w-full border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none transition placeholder:text-ink-200 focus:border-ink-900/40"
      />
    </label>
  );
}
