'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AGE_GROUP_OPTIONS,
  OCCUPATION_OPTIONS,
  CLIMATE_OPTIONS,
  DRESSING_GOAL_OPTIONS,
  PRIORITY_OPTIONS,
  STYLE_OPENNESS_OPTIONS,
  PRIORITY_LABELS,
} from '@/lib/onboarding-types';
import type {
  OnboardingAnswers,
  AgeGroup,
  Occupation,
  ClimateZone,
  DressingGoal,
  PriorityDimension,
} from '@/lib/onboarding-types';

interface LifestyleStepProps {
  answers: OnboardingAnswers;
  onUpdate: (patch: Partial<OnboardingAnswers>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function LifestyleStep({ answers, onUpdate, onSubmit, onBack }: LifestyleStepProps) {
  const [showOptional, setShowOptional] = useState(false);

  const handleToggleGoal = (goal: DressingGoal) => {
    const has = answers.dressingGoals.includes(goal);
    onUpdate({
      dressingGoals: has
        ? answers.dressingGoals.filter((g) => g !== goal)
        : [...answers.dressingGoals, goal],
    });
  };

  // 优先级排序：把某项移动到指定位置
  const movePriority = (item: PriorityDimension, dir: -1 | 1) => {
    const list = [...answers.priorities];
    const idx = list.indexOf(item);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    onUpdate({ priorities: list });
  };

  const togglePriority = (item: PriorityDimension) => {
    const has = answers.priorities.includes(item);
    onUpdate({
      priorities: has
        ? answers.priorities.filter((p) => p !== item)
        : [...answers.priorities, item],
    });
  };

  const canSubmit =
    !!answers.ageGroup &&
    answers.dressingGoals.length > 0 &&
    answers.priorities.length === PRIORITY_OPTIONS.length;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-display text-ink-900 mb-2">生活方式与穿衣偏好</h2>
      <p className="text-ink-500 font-light mb-8">
        「适合」不等于「会穿」。告诉我们你的现实场景与行为偏好，让推荐更落地
      </p>

      <div className="space-y-7 mb-8">
        {/* ====== 年龄段（必填）====== */}
        <Section title="年龄段" required>
          <div className="grid grid-cols-3 gap-2">
            {AGE_GROUP_OPTIONS.map((opt) => {
              const isSelected = answers.ageGroup === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ ageGroup: opt.value as AgeGroup })}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all text-center',
                    isSelected
                      ? 'border-ink-800 bg-ink-800 text-creme-100'
                      : 'border-creme-300 bg-white text-ink-600 hover:border-ink-300',
                  )}
                >
                  <div className="text-lg mb-0.5">{opt.emoji}</div>
                  <div className="text-xs font-medium">{opt.label}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ====== 穿衣目标（必填多选）====== */}
        <Section title="穿衣目标" required hint="可多选，你最想通过穿搭实现什么">
          <div className="flex flex-wrap gap-2">
            {DRESSING_GOAL_OPTIONS.map((opt) => {
              const isSelected = answers.dressingGoals.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleToggleGoal(opt.value as DressingGoal)}
                  className={cn(
                    'px-3 py-2 rounded-full border-2 transition-all text-sm flex items-center gap-1.5',
                    isSelected
                      ? 'border-ink-800 bg-ink-800 text-creme-100'
                      : 'border-creme-300 bg-white text-ink-600 hover:border-ink-300',
                  )}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ====== 优先级排序（必填）====== */}
        <Section
          title="穿衣优先级排序"
          required
          hint="按重要性从高到低排序，点击加入后用箭头调整"
        >
          <div className="space-y-2">
            {/* 已排序列表 */}
            {answers.priorities.map((p, idx) => {
              const opt = PRIORITY_OPTIONS.find((o) => o.value === p)!;
              return (
                <div
                  key={p}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-creme-100 border border-creme-300"
                >
                  <span className="w-6 h-6 rounded-full bg-ink-800 text-creme-100 text-xs flex items-center justify-center font-semibold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">{opt.label}</p>
                    <p className="text-[11px] text-ink-400 truncate">{opt.desc}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => movePriority(p, -1)}
                      disabled={idx === 0}
                      className="text-ink-400 hover:text-ink-800 disabled:opacity-20 text-xs leading-none px-1"
                      aria-label="上移"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => movePriority(p, 1)}
                      disabled={idx === answers.priorities.length - 1}
                      className="text-ink-400 hover:text-ink-800 disabled:opacity-20 text-xs leading-none px-1"
                      aria-label="下移"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
            {/* 未选择项 */}
            {PRIORITY_OPTIONS.filter((o) => !answers.priorities.includes(o.value)).map((opt) => (
              <button
                key={opt.value}
                onClick={() => togglePriority(opt.value as PriorityDimension)}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-creme-300 text-ink-400 hover:border-ink-300 hover:text-ink-600 transition-all text-left"
              >
                <span className="w-6 h-6 rounded-full border border-creme-300 text-xs flex items-center justify-center shrink-0">
                  +
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-[11px] truncate">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* ====== 选填区折叠 ====== */}
        <button
          onClick={() => setShowOptional((v) => !v)}
          className="text-sm text-ink-500 hover:text-ink-800 flex items-center gap-1 transition-colors"
        >
          {showOptional ? '▾' : '▸'} 补充信息（选填，能让推荐更精准）
        </button>

        {showOptional && (
          <div className="space-y-7 pt-2 border-t border-creme-200">
            {/* 职业 / 场景 */}
            <Section title="职业 / 使用场景" hint="选填">
              <div className="flex flex-wrap gap-2">
                {OCCUPATION_OPTIONS.map((opt) => {
                  const isSelected = answers.occupation === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onUpdate({
                          occupation: isSelected ? null : (opt.value as Occupation),
                        })
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-full border text-sm transition-all flex items-center gap-1',
                        isSelected
                          ? 'border-ink-800 bg-ink-50 text-ink-800'
                          : 'border-creme-300 bg-white text-ink-500 hover:border-ink-300',
                      )}
                    >
                      <span>{opt.emoji}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 城市 + 气候 */}
            <Section title="所在城市 / 气候" hint="选填，影响季节性推荐">
              <input
                type="text"
                value={answers.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
                placeholder="如：上海"
                className="w-full px-3 py-2 rounded-xl border-2 border-creme-300 bg-white text-ink-700 text-sm focus:outline-none focus:border-ink-400 mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {CLIMATE_OPTIONS.map((opt) => {
                  const isSelected = answers.climate === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onUpdate({
                          climate: isSelected ? null : (opt.value as ClimateZone),
                        })
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-full border text-sm transition-all flex items-center gap-1',
                        isSelected
                          ? 'border-ink-800 bg-ink-50 text-ink-800'
                          : 'border-creme-300 bg-white text-ink-500 hover:border-ink-300',
                      )}
                    >
                      <span>{opt.emoji}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 月度预算范围 */}
            <Section title="月度服装预算" hint="选填，元/月">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={answers.monthlyBudgetMin ?? ''}
                  onChange={(e) =>
                    onUpdate({ monthlyBudgetMin: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="下限"
                  className="w-full px-3 py-2 rounded-xl border-2 border-creme-300 bg-white text-ink-700 text-sm focus:outline-none focus:border-ink-400"
                />
                <span className="text-ink-400">—</span>
                <input
                  type="number"
                  value={answers.monthlyBudgetMax ?? ''}
                  onChange={(e) =>
                    onUpdate({ monthlyBudgetMax: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="上限"
                  className="w-full px-3 py-2 rounded-xl border-2 border-creme-300 bg-white text-ink-700 text-sm focus:outline-none focus:border-ink-400"
                />
              </div>
            </Section>

            {/* 风格接受度 */}
            <Section title="风格接受度" hint="选填，你愿意尝试多大胆的风格">
              <div className="flex flex-col gap-1.5">
                {STYLE_OPENNESS_OPTIONS.map((opt) => {
                  const isSelected = answers.styleOpenness === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onUpdate({
                          styleOpenness: isSelected ? null : opt.value,
                        })
                      }
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-xl border text-sm transition-all',
                        isSelected
                          ? 'border-ink-800 bg-ink-50 text-ink-800'
                          : 'border-creme-300 bg-white text-ink-500 hover:border-ink-300',
                      )}
                    >
                      <span className="font-medium">
                        {opt.value} 星 · {opt.label}
                      </span>
                      <span className="text-xs text-ink-400">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 是否愿意尝试新风格 */}
            <Section title="愿意尝试新风格吗" hint="选填">
              <div className="flex gap-2">
                {[
                  { label: '愿意', value: true },
                  { label: '看情况', value: null },
                  { label: '暂不考虑', value: false },
                ].map((opt) => {
                  const isSelected = answers.openToNewStyles === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => onUpdate({ openToNewStyles: opt.value })}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border-2 text-sm transition-all',
                        isSelected
                          ? 'border-ink-800 bg-ink-800 text-creme-100'
                          : 'border-creme-300 bg-white text-ink-500 hover:border-ink-300',
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← 上一步
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit} size="lg">
          {canSubmit ? '查看结果 ✨' : '请完成必填项'}
        </Button>
      </div>
    </div>
  );
}

/* ============ 子组件 ============ */

function Section({
  title,
  hint,
  required,
  children,
}: {
  title: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
        {required && <span className="text-xs text-red-400">*</span>}
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
