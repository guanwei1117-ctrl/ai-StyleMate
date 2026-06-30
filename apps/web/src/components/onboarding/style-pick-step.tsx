'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { STYLES, DIMENSIONS, DIMENSION_LABELS, CATEGORY_LABELS } from '@/data/styles';
import type { StyleDimension } from '@/data/styles';
import type { OnboardingAnswers } from '@/lib/onboarding-types';

interface StylePickStepProps {
  answers: OnboardingAnswers;
  onUpdate: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StylePickStep({ answers, onUpdate, onNext, onBack }: StylePickStepProps) {
  const [activeDimension, setActiveDimension] = useState<StyleDimension | 'all'>('all');

  const selected = answers.preferredStyleIds;

  const toggleStyle = (styleId: string) => {
    const next = selected.includes(styleId)
      ? selected.filter((id) => id !== styleId)
      : [...selected, styleId];
    onUpdate({ preferredStyleIds: next });
  };

  const filteredStyles = useMemo(() => {
    if (activeDimension === 'all') return STYLES;
    return STYLES.filter((s) => s.dimension === activeDimension);
  }, [activeDimension]);

  const canNext = selected.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-display text-ink-900 mb-2">你喜欢的穿搭风格</h2>
      <p className="text-ink-500 font-light mb-2">
        从 80 种风格库中选择你心动的风格（可多选）
      </p>
      <p className="text-xs text-ink-400 mb-6">
        已选 <span className="font-semibold text-ink-700">{selected.length}</span> 种风格 · 共 4 个维度的风格可以筛选
      </p>

      {/* 维度筛选条 */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <CategoryChip
          active={activeDimension === 'all'}
          onClick={() => setActiveDimension('all')}
        >
          全部 (80)
        </CategoryChip>
        {DIMENSIONS.map((dim) => (
          <CategoryChip
            key={dim}
            active={activeDimension === dim}
            onClick={() => setActiveDimension(dim)}
          >
            {DIMENSION_LABELS[dim]} ({STYLES.filter((s) => s.dimension === dim).length})
          </CategoryChip>
        ))}
      </div>

      {/* 风格卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 max-h-[480px] overflow-y-auto pr-1">
        {filteredStyles.map((style) => {
          const isSelected = selected.includes(style.id);
          return (
            <button
              key={style.id}
              onClick={() => toggleStyle(style.id)}
              className={cn(
                'text-left p-3.5 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-ink-800 bg-ink-800 text-creme-100 shadow-md'
                  : 'border-creme-300 bg-white text-ink-700 hover:border-ink-300 hover:shadow-sm',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-sm font-semibold', isSelected ? 'text-creme-100' : 'text-ink-800')}>
                  {style.name}
                </span>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full', isSelected ? 'bg-creme-100/20 text-creme-200' : 'bg-creme-200 text-ink-400')}>
                  {CATEGORY_LABELS[style.category] || style.category}
                </span>
              </div>
              <p className={cn('text-xs line-clamp-2', isSelected ? 'text-creme-300' : 'text-ink-500')}>
                {style.description}
              </p>
              {/* 难度星级 + 维度标签 */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        'text-[10px]',
                        n <= style.difficulty
                          ? isSelected ? 'text-creme-300' : 'text-ink-600'
                          : isSelected ? 'text-creme-100/20' : 'text-ink-200',
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className={cn('text-[10px]', isSelected ? 'text-creme-400' : 'text-ink-300')}>
                  {DIMENSION_LABELS[style.dimension]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← 上一步
        </Button>
        <Button onClick={onNext} disabled={!canNext}>
          {canNext ? '下一步 →' : `请选择至少 1 种风格`}
        </Button>
      </div>
    </div>
  );
}

/** 分类标签 */
function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs transition-all',
        active
          ? 'bg-ink-800 text-creme-100'
          : 'bg-creme-200 text-ink-500 hover:bg-creme-300 hover:text-ink-700',
      )}
    >
      {children}
    </button>
  );
}
