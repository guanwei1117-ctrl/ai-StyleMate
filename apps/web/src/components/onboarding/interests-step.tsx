'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { INTEREST_OPTIONS } from '@/lib/onboarding-types';
import type { OnboardingAnswers } from '@/lib/onboarding-types';

interface InterestsStepProps {
  answers: OnboardingAnswers;
  onUpdate: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function InterestsStep({ answers, onUpdate, onNext, onBack }: InterestsStepProps) {
  const selected = answers.interests;

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onUpdate({ interests: next });
  };

  const canNext = selected.length > 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-display text-ink-900 mb-2">你的兴趣爱好</h2>
      <p className="text-ink-500 font-light mb-2">
        选择你的日常兴趣（可多选）
      </p>
      <p className="text-xs text-ink-400 mb-8">
        已选 <span className="font-semibold text-ink-700">{selected.length}</span> 项
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
        {INTEREST_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-ink-800 bg-ink-800 text-creme-100 shadow-md'
                  : 'border-creme-300 bg-white text-ink-700 hover:border-ink-300 hover:shadow-sm',
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className={cn('text-xs font-medium', isSelected ? 'text-creme-200' : 'text-ink-600')}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← 上一步
        </Button>
        <Button onClick={onNext} disabled={!canNext}>
          {canNext ? '下一步 →' : '请至少选择 1 项'}
        </Button>
      </div>
    </div>
  );
}
