'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ONBOARDING_GUIDE_SECTIONS } from '@/lib/onboarding-guide';

export interface OnboardingGuideDialogProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingGuideDialog({ open, onClose }: OnboardingGuideDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/35 px-5 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-xl border border-ink-900/10 bg-[#fbfaf6] p-6 shadow-[0_24px_80px_rgba(10,10,10,0.18)]"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs tracking-[0.22em] text-ink-400">说明书</p>
            <h2 className="font-display text-4xl leading-none">怎么测？</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-ink-400 transition hover:text-ink-900" aria-label="关闭说明书">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {ONBOARDING_GUIDE_SECTIONS.map((section, index) => (
            <section key={section.title} className="grid grid-cols-[36px_1fr] gap-4 border-t border-ink-900/10 pt-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-xs text-creme-100">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{section.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-500">{section.copy}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {section.items.map((item) => (
                    <span key={item} className="bg-white/70 px-3 py-1 text-xs text-ink-500">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <button type="button" onClick={onClose} className="mt-7 w-full bg-ink-900 px-5 py-3 text-sm text-creme-100 transition hover:bg-ink-800">
          知道了
        </button>
      </motion.div>
    </div>
  );
}
