'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const STEPS = [
  {
    title: '你的性别',
    description: '这有助于我们为你提供更精准的建议',
    options: [
      { label: '女性', value: 'female', emoji: '👩' },
      { label: '男性', value: 'male', emoji: '👨' },
      { label: '其他', value: 'other', emoji: '🧑' },
    ],
  },
  {
    title: '你的体型',
    description: '了解体型是找到合适穿搭的第一步',
    options: [
      { label: '梨形', value: 'pear', emoji: '🍐' },
      { label: '苹果形', value: 'apple', emoji: '🍎' },
      { label: '沙漏形', value: 'hourglass', emoji: '⌛' },
      { label: 'H 形', value: 'rectangle', emoji: '📏' },
      { label: '倒三角', value: 'inverted_triangle', emoji: '🔻' },
    ],
  },
  {
    title: '你喜欢的风格',
    description: '选择让你心动的穿搭风格（可多选）',
    options: [
      { label: '日系清新', value: 'japanese', emoji: '🌸' },
      { label: '韩系简约', value: 'korean', emoji: '✨' },
      { label: '法式优雅', value: 'french', emoji: '🥐' },
      { label: '美式休闲', value: 'american', emoji: '👕' },
      { label: '极简主义', value: 'minimal', emoji: '⬜' },
      { label: '街头潮流', value: 'street', emoji: '🎨' },
    ],
  },
  {
    title: '你的穿搭预算',
    description: '我们会在你的预算范围内推荐单品',
    options: [
      { label: '平价实惠', value: 'budget', emoji: '💰' },
      { label: '中等价位', value: 'mid', emoji: '💵' },
      { label: '轻奢品质', value: 'premium', emoji: '💎' },
    ],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleSelect = (value: string) => {
    const key = `step_${step}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (isLast) {
      // TODO: Submit to API
      console.log('Onboarding complete:', answers);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900">{current.title}</h2>
        <p className="mt-2 text-gray-500">{current.description}</p>

        <div className="mt-8 space-y-3">
          {current.options.map((option) => {
            const isSelected = answers[`step_${step}`] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-medium text-gray-900">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-md mt-6 flex justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
          上一步
        </Button>
        <Button
          onClick={handleNext}
          disabled={!answers[`step_${step}`]}
        >
          {isLast ? '完成' : '下一步'}
        </Button>
      </div>

      {isLast && answers[`step_${step}`] && (
        <div className="mt-4">
          <Link
            href="/wardrobe"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            跳转到衣橱管理 →
          </Link>
        </div>
      )}
    </div>
  );
}
