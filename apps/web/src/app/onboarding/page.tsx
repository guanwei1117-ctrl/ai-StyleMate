'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { deriveBodyShape } from '@/lib/body-analysis';
import { matchStyles } from '@/lib/style-matcher';
import {
  createDefaultAnswers,
  type OnboardingAnswers,
  type BodyShape,
  type StyleMatchResult,
} from '@/lib/onboarding-types';

import PhotoUploadStep from '@/components/onboarding/photo-upload-step';
import BodyStep from '@/components/onboarding/body-step';
import StylePickStep from '@/components/onboarding/style-pick-step';
import InterestsStep from '@/components/onboarding/interests-step';
import BudgetStep from '@/components/onboarding/budget-step';
import ResultView from '@/components/onboarding/result-view';

// ============================================================
// 步骤配置
// ============================================================
const STEPS = [
  { id: 'photo', label: '照片' },
  { id: 'body', label: '身体' },
  { id: 'style_pick', label: '风格' },
  { id: 'interests', label: '兴趣' },
  { id: 'budget', label: '预算' },
] as const;

const TOTAL_STEPS = STEPS.length;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(createDefaultAnswers);
  const [results, setResults] = useState<StyleMatchResult[]>([]);
  const [bodyShape, setBodyShape] = useState<BodyShape>('unknown');

  // 是否在结果页
  const isResultStep = step === TOTAL_STEPS;

  const updateAnswers = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  // 提交问卷 → 计算结果
  const handleSubmit = useCallback(() => {
    const shape = deriveBodyShape(
      answers.height!,
      answers.weight!,
      answers.bust,
      answers.waist,
      answers.hip,
    );
    setBodyShape(shape);

    const matched = matchStyles(answers);
    setResults(matched);

    setStep(TOTAL_STEPS);
  }, [answers]);

  // 重新测试
  const handleRestart = useCallback(() => {
    setAnswers(createDefaultAnswers());
    setResults([]);
    setBodyShape('unknown');
    setStep(0);
  }, []);

  // 当前步骤进度
  const progress = useMemo(() => {
    if (isResultStep) return 100;
    return Math.round((step / TOTAL_STEPS) * 100);
  }, [step, isResultStep]);

  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center px-4 py-12',
      'bg-gradient-to-br from-creme-50 via-white to-creme-200',
    )}>
      {/* ======== 进度指示器 ======== */}
      {!isResultStep && (
        <div className="w-full max-w-md mb-8">
          {/* 步骤标签 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-400">
              步骤 {step + 1}/{TOTAL_STEPS}
            </span>
            <span className="text-xs font-medium text-ink-600">
              {STEPS[step]?.label}
            </span>
          </div>
          {/* 进度条 */}
          <div className="h-1.5 bg-creme-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-ink-800 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ======== 步骤卡片 ======== */}
      <div className={cn(
        'bg-white rounded-3xl shadow-xl shadow-ink-100/30 p-8 sm:p-10',
        isResultStep ? 'w-full max-w-4xl' : 'w-full max-w-md',
        isResultStep && 'sm:p-12',
      )}>
        {/* 步骤内容 */}
        {step === 0 && (
          <PhotoUploadStep
            answers={answers}
            onUpdate={updateAnswers}
            onNext={handleNext}
          />
        )}

        {step === 1 && (
          <BodyStep
            answers={answers}
            onUpdate={updateAnswers}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 2 && (
          <StylePickStep
            answers={answers}
            onUpdate={updateAnswers}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <InterestsStep
            answers={answers}
            onUpdate={updateAnswers}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 4 && (
          <BudgetStep
            answers={answers}
            onUpdate={updateAnswers}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        )}

        {/* 结果页 */}
        {isResultStep && results.length > 0 && (
          <ResultView
            results={results}
            answers={answers}
            bodyShape={bodyShape}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* ======== 底部提示 ======== */}
      {!isResultStep && (
        <p className="mt-6 text-xs text-ink-300 text-center">
          你的数据仅用于个性化推荐，不会泄露给第三方
        </p>
      )}

      {/* 结果页回到顶部 */}
      {isResultStep && results.length === 0 && (
        <div className="w-full max-w-md text-center">
          <p className="text-ink-500 font-light mb-6">正在分析你的风格画像...</p>
          <button
            onClick={handleRestart}
            className="text-sm text-ink-400 hover:text-ink-600 underline underline-offset-2"
          >
            返回重新填写
          </button>
        </div>
      )}
    </div>
  );
}
