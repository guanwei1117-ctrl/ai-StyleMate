'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BODY_SHAPE_LABELS } from '@/lib/onboarding-types';
import { deriveBodyShape, calculateBMI } from '@/lib/body-analysis';
import type { OnboardingAnswers, Gender, BodyShape } from '@/lib/onboarding-types';

interface BodyStepProps {
  answers: OnboardingAnswers;
  onUpdate: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GENDER_OPTIONS: { label: string; value: Gender; emoji: string }[] = [
  { label: '女性', value: 'female', emoji: '👩' },
  { label: '男性', value: 'male', emoji: '👨' },
  { label: '其他', value: 'other', emoji: '🧑' },
];

export default function BodyStep({ answers, onUpdate, onNext, onBack }: BodyStepProps) {
  const [bmi, setBmi] = useState<number | null>(null);
  const [bodyShape, setBodyShape] = useState<BodyShape>('unknown');

  const recalc = (h: number | null, w: number | null, b?: number | null, wa?: number | null, hp?: number | null) => {
    if (h && w && h > 0 && w > 0) {
      setBmi(calculateBMI(h, w));
      setBodyShape(deriveBodyShape(h, w, b, wa, hp));
    }
  };

  const handleGenderSelect = (g: Gender) => {
    onUpdate({ gender: g });
  };

  const handleHeightChange = (val: string) => {
    const h = parseFloat(val) || null;
    onUpdate({ height: h });
    recalc(h, answers.weight, answers.bust, answers.waist, answers.hip);
  };

  const handleWeightChange = (val: string) => {
    const w = parseFloat(val) || null;
    onUpdate({ weight: w });
    recalc(answers.height, w, answers.bust, answers.waist, answers.hip);
  };

  const handleBustChange = (val: string) => {
    onUpdate({ bust: parseFloat(val) || null });
    recalc(answers.height, answers.weight, parseFloat(val) || null, answers.waist, answers.hip);
  };

  const handleWaistChange = (val: string) => {
    onUpdate({ waist: parseFloat(val) || null });
    recalc(answers.height, answers.weight, answers.bust, parseFloat(val) || null, answers.hip);
  };

  const handleHipChange = (val: string) => {
    onUpdate({ hip: parseFloat(val) || null });
    recalc(answers.height, answers.weight, answers.bust, answers.waist, parseFloat(val) || null);
  };

  const canNext = !!answers.gender && !!answers.height && !!answers.weight && answers.height > 0 && answers.weight > 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-display text-ink-900 mb-2">身体数据</h2>
      <p className="text-ink-500 font-light mb-8">
        这些信息将帮助我们分析你的体型，推荐最合适的轮廓
      </p>

      {/* 性别 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-ink-700 mb-3">
          性别 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleGenderSelect(opt.value)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 text-sm transition-all',
                answers.gender === opt.value
                  ? 'border-ink-800 bg-ink-800 text-creme-100'
                  : 'border-creme-300 bg-white text-ink-700 hover:border-ink-300',
              )}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 身高体重 — 并排 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <NumberField
          label="身高"
          unit="cm"
          required
          value={answers.height ?? ''}
          onChange={handleHeightChange}
          placeholder="例如 165"
        />
        <NumberField
          label="体重"
          unit="kg"
          required
          value={answers.weight ?? ''}
          onChange={handleWeightChange}
          placeholder="例如 55"
        />
      </div>

      {/* 三围 — 选填 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-ink-700 mb-3">
          三围 <span className="text-ink-400 text-xs font-normal">(选填，可提升分析准确度)</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <NumberField
            label="胸围"
            unit="cm"
            value={answers.bust ?? ''}
            onChange={handleBustChange}
            placeholder="例如 88"
          />
          <NumberField
            label="腰围"
            unit="cm"
            value={answers.waist ?? ''}
            onChange={handleWaistChange}
            placeholder="例如 68"
          />
          <NumberField
            label="臀围"
            unit="cm"
            value={answers.hip ?? ''}
            onChange={handleHipChange}
            placeholder="例如 92"
          />
        </div>
      </div>

      {/* 实时 BMI & 体型预览 */}
      {bmi !== null && (
        <div className="p-4 bg-creme-200/40 rounded-xl border border-creme-200 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">BMI</span>
            <span className="text-ink-800 font-semibold">{bmi}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">推测体型</span>
            <span className="text-ink-800 font-semibold">{BODY_SHAPE_LABELS[bodyShape]}</span>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← 上一步
        </Button>
        <Button onClick={onNext} disabled={!canNext}>
          下一步 →
        </Button>
      </div>
    </div>
  );
}

/** 数字输入子组件 */
function NumberField({
  label,
  unit,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  required?: boolean;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-ink-500 mb-1.5">
        {label}
        <span className="text-ink-300 ml-0.5">{unit}</span>
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-creme-300 bg-white text-ink-900 text-sm focus:outline-none focus:border-ink-400 focus:ring-1 focus:ring-ink-200 transition-all placeholder:text-ink-200"
      />
    </div>
  );
}
