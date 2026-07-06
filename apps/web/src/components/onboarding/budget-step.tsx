'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BUDGET_OPTIONS } from '@/lib/onboarding-types';
import type { OnboardingAnswers, BudgetLevel } from '@/lib/onboarding-types';

interface BudgetStepProps {
  answers: OnboardingAnswers;
  onUpdate: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BudgetStep({ answers, onUpdate, onNext, onBack }: BudgetStepProps) {
  const handleSelect = (value: BudgetLevel) => {
    onUpdate({ budget: value });
  };

  const canSubmit = !!answers.budget;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-display text-ink-900 mb-2">你的穿搭预算</h2>
      <p className="text-ink-500 font-light mb-8">
        选择适合你的消费档位，我们会在此范围内推荐单品
      </p>

      <div className="space-y-3 mb-8">
        {BUDGET_OPTIONS.map((opt) => {
          const isSelected = answers.budget === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={cn(
                'w-full text-left p-5 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-ink-800 bg-ink-800 text-creme-100 shadow-md'
                  : 'border-creme-300 bg-white text-ink-700 hover:border-ink-300 hover:shadow-sm',
              )}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className={cn('font-semibold', isSelected ? 'text-creme-100' : 'text-ink-800')}>
                    {opt.label}
                  </p>
                  <p className={cn('text-xs', isSelected ? 'text-creme-300' : 'text-ink-400')}>
                    {opt.range}
                  </p>
                </div>
              </div>
              <p className={cn('text-xs mt-1 ml-10', isSelected ? 'text-creme-300' : 'text-ink-400')}>
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← 上一步
        </Button>
        <Button onClick={onNext} disabled={!canSubmit} size="lg">
          {canSubmit ? '下一步 →' : '请选择预算档位'}
        </Button>
      </div>
    </div>
  );
}
