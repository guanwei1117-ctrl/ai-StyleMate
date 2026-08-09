'use client';

import { Camera, X } from 'lucide-react';

export interface PhotoSlotProps {
  label: string;
  desc: string;
  preview: string | null;
  onClick: () => void;
  onRemove: () => void;
}

export function PhotoSlot({ label, desc, preview, onClick, onRemove }: PhotoSlotProps) {
  if (!preview) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 border border-ink-900/15 bg-white/40 px-4 py-2.5 text-sm text-ink-600 transition hover:border-ink-900/35 hover:text-ink-900"
      >
        <Camera size={15} />
        {label}
        <span className="text-xs text-ink-300">选填</span>
      </button>
    );
  }

  return (
    <div className="group relative aspect-[4/5] w-full overflow-hidden border border-ink-900/20 bg-[#f4f1ea]">
      <img src={preview} alt={label} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#fbfaf6]/90 px-4 py-2.5 backdrop-blur">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-0.5 text-xs leading-4 text-ink-500">{desc}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 border border-ink-900/15 bg-white/60 px-2.5 py-1.5 text-xs text-ink-500 transition hover:border-red-300 hover:text-red-700"
        >
          <X size={13} />
          移除
        </button>
      </div>
    </div>
  );
}
