'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deriveBodyShape } from '@/lib/body-analysis';
import { matchStyles } from '@/lib/style-matcher';
import {
  AGE_GROUP_OPTIONS,
  BUDGET_OPTIONS,
  CLIMATE_OPTIONS,
  DAILY_SCENE_OPTIONS,
  DRESSING_GOAL_OPTIONS,
  OCCUPATION_OPTIONS,
  PRIORITY_OPTIONS,
  STYLE_OPENNESS_OPTIONS,
  createDefaultAnswers,
  type AgeGroup,
  type BodyShape,
  type BudgetLevel,
  type ClimateZone,
  type DailyScene,
  type DressingGoal,
  type Gender,
  type Occupation,
  type OnboardingAnswers,
  type PriorityDimension,
  type StyleMatchResult,
} from '@/lib/onboarding-types';
import {
  CATEGORY_LABELS,
  DIMENSIONS,
  DIMENSION_LABELS,
  STYLES,
  type StyleDimension,
} from '@/data/styles';
import styleImages from '@/data/style-images.json';
import ResultView from '@/components/onboarding/result-view';
import {
  analyzeStyleProfileWithAi,
  mergeAiStyleResults,
  type AiStyleProfileAnalysis,
} from '@/lib/style-profile-api';
import {
  buildGeneratedStatement,
  createStoredStyleProfile,
  extractStyleIntent,
  saveStyleProfile,
} from '@/lib/style-profile-storage';
import { ACCEPTED_IMAGE_MIME_TYPES, IMAGE_UPLOAD_SIZE_LABEL, validateImageFile } from '@/lib/image-upload-rules';
import { ONBOARDING_GUIDE_SECTIONS } from '@/lib/onboarding-guide';

const FLOW = [
  { id: 'profile', label: '基础', desc: '身高 / 体重 / 年龄' },
  { id: 'taste', label: '喜好', desc: '风格 / 预算 / 目标' },
  { id: 'intent', label: '生成', desc: '确认后出报告' },
] as const;

const genderOptions: { label: string; value: Gender }[] = [
  { label: '不限定', value: 'other' },
  { label: '女性', value: 'female' },
  { label: '男性', value: 'male' },
];

function getStyleImage(styleId: string): string | undefined {
  return (styleImages as Record<string, string>)[styleId];
}

export default function OnboardingPage() {
  const faceInputRef = useRef<HTMLInputElement>(null);
  const fullBodyInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(createDefaultAnswers);
  const [results, setResults] = useState<StyleMatchResult[]>([]);
  const [bodyShape, setBodyShape] = useState<BodyShape>('unknown');
  const [activeDimension, setActiveDimension] = useState<StyleDimension | '全部'>('全部');
  const [statementEdited, setStatementEdited] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiStyleProfileAnalysis | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'ai' | 'fallback'>('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [measurementsOpen, setMeasurementsOpen] = useState(false);

  const isResultStep = step === FLOW.length;


  const updateAnswers = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (!statementEdited) {
      setAnswers((prev) => ({ ...prev, userStatement: buildGeneratedStatement(prev) }));
    }
  }, [
    statementEdited,
    answers.gender,
    answers.height,
    answers.weight,
    answers.ageGroup,
    answers.occupation,
    answers.city,
    answers.climate,
    answers.preferredStyleIds,
    answers.budget,
    answers.dressingGoals,
    answers.priorities,
  ]);

  const handlePhotoChange = (kind: 'face' | 'fullBody', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.ok) {
      setPhotoError(validation.message);
      event.target.value = '';
      return;
    }

    setPhotoError(null);
    const preview = URL.createObjectURL(file);
    if (kind === 'face') {
      if (answers.photoPreview) URL.revokeObjectURL(answers.photoPreview);
      updateAnswers({ photo: file, photoPreview: preview });
    } else {
      if (answers.fullBodyPhotoPreview) URL.revokeObjectURL(answers.fullBodyPhotoPreview);
      updateAnswers({ fullBodyPhoto: file, fullBodyPhotoPreview: preview });
    }
    event.target.value = '';
  };

  const filteredStyles = useMemo(() => {
    if (activeDimension === '全部') return STYLES;
    return STYLES.filter((style) => style.dimension === activeDimension);
  }, [activeDimension]);

  const toggleStyle = (styleId: string) => {
    const selected = answers.preferredStyleIds;
    updateAnswers({
      preferredStyleIds: selected.includes(styleId)
        ? selected.filter((id) => id !== styleId)
        : [...selected, styleId],
    });
  };

  const toggleGoal = (goal: DressingGoal) => {
    const selected = answers.dressingGoals;
    updateAnswers({
      dressingGoals: selected.includes(goal)
        ? selected.filter((item) => item !== goal)
        : [...selected, goal],
    });
  };

  const togglePriority = (priority: PriorityDimension) => {
    const selected = answers.priorities;
    updateAnswers({
      priorities: selected.includes(priority)
        ? selected.filter((item) => item !== priority)
        : [...selected, priority],
    });
  };

  const canContinue = useMemo(() => {
    if (step === 0) {
      return !!answers.gender && !!answers.height && !!answers.weight && !!answers.ageGroup;
    }
    if (step === 1) return true; // 审美偏好改为选填
    if (step === 2) return answers.userStatement.trim().length >= 20;
    return false;
  }, [answers, step]);

  const handleSubmit = async () => {
    const shape = deriveBodyShape(
      answers.height!,
      answers.weight!,
      answers.bust,
      answers.waist,
      answers.hip,
    );
    const matched = matchStyles(answers);
    setAnalysisStatus('ai');
    setAnalysisError(null);

    try {
      const ai = await analyzeStyleProfileWithAi(answers, shape, matched);
      const aiMatched = mergeAiStyleResults(matched, ai);
      setAiAnalysis(ai);
      setBodyShape(shape);
      setResults(aiMatched);
      saveStyleProfile(createStoredStyleProfile(answers, shape, aiMatched, ai));
      setAnalysisStatus('idle');
      setStep(FLOW.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 风格分析失败，已回落到本地规则。';
      setAnalysisError(message);
      setAnalysisStatus('fallback');
      console.warn('[onboarding] AI style profile failed, using local result:', error);
    }

    setAiAnalysis(null);
    setBodyShape(shape);
    setResults(matched);
    saveStyleProfile(createStoredStyleProfile(answers, shape, matched));
    setAnalysisStatus('idle');
    setStep(FLOW.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    if (answers.photoPreview) URL.revokeObjectURL(answers.photoPreview);
    if (answers.fullBodyPhotoPreview) URL.revokeObjectURL(answers.fullBodyPhotoPreview);
    setAnswers(createDefaultAnswers());
    setResults([]);
    setBodyShape('unknown');
    setStatementEdited(false);
    setAiAnalysis(null);
    setAnalysisStatus('idle');
    setAnalysisError(null);
    setStep(0);
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-ink-900">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-ink-900/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <p className="font-display text-lg tracking-wide">STYLEMATE</p>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="inline-flex items-center gap-2 text-xs tracking-[0.18em] text-ink-400 transition hover:text-ink-900"
          >
            <BookOpen size={15} />
            说明书
          </button>
        </div>
      </div>

      <OnboardingGuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-28 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <p className="mb-5 text-xs tracking-[0.3em] text-ink-400">STYLE TEST</p>
            <h1 className="font-display text-[clamp(3rem,7vw,6.6rem)] leading-[0.9]">
              测测
              <br />
              适合什么
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-ink-500">
              填基础，选喜好，生成建议。
            </p>
          </aside>

          <AnimatePresence mode="wait">
            {!isResultStep ? (
              <motion.section
                key={step}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35 }}
                className="border border-ink-900/10 bg-[#fbfaf6]"
              >
                {step === 0 && (
                  <ProfileStep
                    answers={answers}
                    updateAnswers={updateAnswers}
                    faceInputRef={faceInputRef}
                    fullBodyInputRef={fullBodyInputRef}
                    photoError={photoError}
                    measurementsOpen={measurementsOpen}
                    setMeasurementsOpen={setMeasurementsOpen}
                    onPhotoChange={handlePhotoChange}
                  />
                )}
                {step === 1 && (
                  <TasteStep
                    answers={answers}
                    filteredStyles={filteredStyles}
                    activeDimension={activeDimension}
                    setActiveDimension={setActiveDimension}
                    toggleStyle={toggleStyle}
                    toggleGoal={toggleGoal}
                    togglePriority={togglePriority}
                    updateAnswers={updateAnswers}
                  />
                )}
                {step === 2 && (
                  <IntentStep
                    answers={answers}
                    updateAnswers={updateAnswers}
                    statementEdited={statementEdited}
                    setStatementEdited={setStatementEdited}
                  />
                )}

                <div className="flex items-center justify-between border-t border-ink-900/10 p-5 sm:p-7">
                  <button
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 text-sm text-ink-500 transition hover:text-ink-900 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                    上一步
                  </button>
                  <button
                    onClick={() => {
                      if (step === FLOW.length - 1) handleSubmit();
                      else setStep((current) => current + 1);
                    }}
                    disabled={!canContinue || analysisStatus === 'ai'}
                    className="inline-flex items-center gap-2 bg-ink-900 px-6 py-3 text-sm text-creme-100 transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-200"
                  >
                    {analysisStatus === 'ai' ? 'AI 正在分析...' : step === FLOW.length - 1 ? '生成风格档案' : '继续'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="result"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-ink-900/10 bg-[#fbfaf6] p-5 sm:p-8"
              >
                <ResultView
                  results={results}
                  answers={answers}
                  bodyShape={bodyShape}
                  aiAnalysis={aiAnalysis}
                  analysisError={analysisError}
                  onRestart={handleRestart}
                />
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ icon: Icon, label, title, copy }: {
  icon: typeof UserRound;
  label: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-ink-900/10 p-6 sm:p-8">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink-900/15 bg-white/50">
        <Icon size={18} />
      </div>
      <div>
        <p className="mb-2 text-xs tracking-[0.22em] text-ink-400">{label}</p>
        <h2 className="font-display text-[clamp(1.8rem,3vw,3rem)] leading-none">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-500">{copy}</p>
      </div>
    </div>
  );
}

function OnboardingGuideDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-xs text-creme-100">0{index + 1}</span>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{section.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-500">{section.copy}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {section.items.map((item) => (
                    <span key={item} className="bg-white/70 px-3 py-1 text-xs text-ink-500">{item}</span>
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

function PhotoSlot({
  label,
  desc,
  preview,
  onClick,
}: {
  label: string;
  desc: string;
  preview: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden border border-dashed border-ink-900/20 bg-[#f4f1ea] p-5 text-left transition hover:border-ink-900/45"
    >
      {preview ? (
        <img src={preview} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_48%,rgba(10,10,10,0.08)_49%,rgba(10,10,10,0.08)_51%,transparent_52%)] bg-[length:28px_28px]" />
      )}
      <span className="relative z-10 flex h-10 w-10 items-center justify-center bg-white/80 backdrop-blur">
        <Camera size={18} />
      </span>
      <div className="relative z-10 bg-[#fbfaf6]/90 p-4 backdrop-blur">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs leading-5 text-ink-500">{desc}</p>
      </div>
    </button>
  );
}

function ProfileStep({
  answers,
  updateAnswers,
  faceInputRef,
  fullBodyInputRef,
  photoError,
  measurementsOpen,
  setMeasurementsOpen,
  onPhotoChange,
}: {
  answers: OnboardingAnswers;
  updateAnswers: (patch: Partial<OnboardingAnswers>) => void;
  faceInputRef: React.RefObject<HTMLInputElement>;
  fullBodyInputRef: React.RefObject<HTMLInputElement>;
  photoError: string | null;
  measurementsOpen: boolean;
  setMeasurementsOpen: (open: boolean) => void;
  onPhotoChange: (kind: 'face' | 'fullBody', event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <SectionHeader
        icon={UserRound}
        label="01"
        title="基础"
        copy="必填：性别、身高、体重、年龄。"
      />
      <div className="mx-6 mt-6 border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800 sm:mx-8">
        照片选填，只用于穿搭分析。
      </div>
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <PhotoSlot
            label="正脸照"
            desc={`选填，不超过 ${IMAGE_UPLOAD_SIZE_LABEL}。`}
            preview={answers.photoPreview}
            onClick={() => faceInputRef.current?.click()}
          />
          <PhotoSlot
            label="全身照"
            desc={`选填，不超过 ${IMAGE_UPLOAD_SIZE_LABEL}。`}
            preview={answers.fullBodyPhotoPreview}
            onClick={() => fullBodyInputRef.current?.click()}
          />
          {photoError && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-1">
              {photoError}
            </p>
          )}
          <input ref={faceInputRef} type="file" accept={ACCEPTED_IMAGE_MIME_TYPES} onChange={(event) => onPhotoChange('face', event)} className="hidden" />
          <input ref={fullBodyInputRef} type="file" accept={ACCEPTED_IMAGE_MIME_TYPES} onChange={(event) => onPhotoChange('fullBody', event)} className="hidden" />
        </div>

        <div className="space-y-7">
          <FieldGroup title="性别表达">
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((option) => (
                <ChoiceButton
                  key={option.value}
                  active={answers.gender === option.value}
                  onClick={() => updateAnswers({ gender: option.value })}
                >
                  {option.label}
                </ChoiceButton>
              ))}
            </div>
          </FieldGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="身高"
              unit="cm"
              value={answers.height ?? ''}
              placeholder="165"
              onChange={(value) => updateAnswers({ height: value ? Number(value) : null })}
            />
            <NumberInput
              label="体重"
              unit="kg"
              value={answers.weight ?? ''}
              placeholder="55"
              onChange={(value) => updateAnswers({ weight: value ? Number(value) : null })}
            />
          </div>

          <FieldGroup title="年龄段">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AGE_GROUP_OPTIONS.slice(0, 3).map((option) => (
                <ChoiceButton
                  key={option.value}
                  active={answers.ageGroup === option.value}
                  onClick={() => updateAnswers({ ageGroup: option.value as AgeGroup })}
                >
                  {option.label}
                </ChoiceButton>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup title="职业" optional>
            <div className="flex flex-wrap gap-2">
              {OCCUPATION_OPTIONS.map((option) => (
                <ChoiceButton
                  key={option.value}
                  active={answers.occupation === option.value}
                  onClick={() => updateAnswers({ occupation: answers.occupation === option.value ? null : option.value as Occupation })}
                  compact
                >
                  {option.label}
                </ChoiceButton>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup title="日常场景" optional>
            <div className="flex flex-wrap gap-2">
              {DAILY_SCENE_OPTIONS.map((option) => (
                <ChoiceButton
                  key={option.value}
                  active={answers.dailyScenes.includes(option.value)}
                  onClick={() => {
                    const value = option.value as DailyScene;
                    updateAnswers({
                      dailyScenes: answers.dailyScenes.includes(value)
                        ? answers.dailyScenes.filter((item) => item !== value)
                        : [...answers.dailyScenes, value],
                    });
                  }}
                  compact
                >
                  {option.label}
                </ChoiceButton>
              ))}
            </div>
            <input
              value={answers.customScene}
              onChange={(event) => updateAnswers({ customScene: event.target.value })}
              placeholder="其他场景，比如直播上镜、周末探店、公司着装要求"
              className="mt-3 w-full border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none focus:border-ink-900/40"
            />
          </FieldGroup>

          <div className="border border-ink-900/10 bg-white/40">
            <button
              type="button"
              onClick={() => setMeasurementsOpen(!measurementsOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink-800"
            >
              <span>三围 <span className="ml-2 text-xs font-normal text-ink-300">选填，填写后体型更准</span></span>
              <span className="text-xs text-ink-400">{measurementsOpen ? '收起' : '填写'}</span>
            </button>
            {measurementsOpen && (
              <div className="grid grid-cols-3 gap-3 border-t border-ink-900/10 p-4">
                <NumberInput label="胸围" unit="cm" value={answers.bust ?? ''} placeholder="88" onChange={(value) => updateAnswers({ bust: value ? Number(value) : null })} />
                <NumberInput label="腰围" unit="cm" value={answers.waist ?? ''} placeholder="68" onChange={(value) => updateAnswers({ waist: value ? Number(value) : null })} />
                <NumberInput label="臀围" unit="cm" value={answers.hip ?? ''} placeholder="92" onChange={(value) => updateAnswers({ hip: value ? Number(value) : null })} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TasteStep({
  answers,
  filteredStyles,
  activeDimension,
  setActiveDimension,
  toggleStyle,
  toggleGoal,
  togglePriority,
  updateAnswers,
}: {
  answers: OnboardingAnswers;
  filteredStyles: typeof STYLES;
  activeDimension: StyleDimension | '全部';
  setActiveDimension: (dimension: StyleDimension | '全部') => void;
  toggleStyle: (styleId: string) => void;
  toggleGoal: (goal: DressingGoal) => void;
  togglePriority: (priority: PriorityDimension) => void;
  updateAnswers: (patch: Partial<OnboardingAnswers>) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const displayStyles = useMemo(() => {
    if (!searchQuery.trim()) return filteredStyles;
    const q = searchQuery.trim().toLowerCase();
    return filteredStyles.filter(
      (style) =>
        style.name.toLowerCase().includes(q) ||
        style.description.toLowerCase().includes(q) ||
        style.category.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[style.category] || '').toLowerCase().includes(q) ||
        style.keyItems.some((item) => item.toLowerCase().includes(q)),
    );
  }, [filteredStyles, searchQuery]);

  return (
    <>
      <SectionHeader
        icon={Sparkles}
        label="02"
        title="喜好"
        copy="都选填。不确定就跳过。"
      />
      <div className="p-6 sm:p-8">
        <div className="mb-8 space-y-7 border-b border-ink-900/10 pb-8">
          <FieldGroup title="预算" optional>
            <div className="grid gap-3 md:grid-cols-3">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateAnswers({ budget: option.value as BudgetLevel })}
                  className={cn(
                    'border p-4 text-left transition',
                    answers.budget === option.value
                      ? 'border-ink-900 bg-ink-900 text-creme-100'
                      : 'border-ink-900/10 bg-white/50 text-ink-700 hover:border-ink-900/30',
                  )}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className={cn('mt-2 text-xs', answers.budget === option.value ? 'text-creme-200/70' : 'text-ink-400')}>
                    {option.range}
                  </p>
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup title="穿衣目标" optional>
            <div className="flex flex-wrap gap-2">
              {DRESSING_GOAL_OPTIONS.map((option) => (
                <ChoiceButton
                  key={option.value}
                  active={answers.dressingGoals.includes(option.value)}
                  onClick={() => toggleGoal(option.value as DressingGoal)}
                  compact
                >
                  {option.label}
                </ChoiceButton>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup title="优先考虑" optional>
            <div className="grid gap-3 md:grid-cols-2">
              {PRIORITY_OPTIONS.map((option) => {
                const index = answers.priorities.indexOf(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => togglePriority(option.value as PriorityDimension)}
                    className={cn(
                      'grid grid-cols-[40px_1fr] gap-3 border p-4 text-left transition',
                      index >= 0
                        ? 'border-ink-900 bg-[#e8ece8]'
                        : 'border-ink-900/10 bg-white/50 hover:border-ink-900/30',
                    )}
                  >
                    <span className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border text-sm',
                      index >= 0 ? 'border-ink-900 bg-ink-900 text-creme-100' : 'border-ink-900/15 text-ink-300',
                    )}>
                      {index >= 0 ? index + 1 : '+'}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-ink-500">{option.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </FieldGroup>

          <div className="grid gap-6 md:grid-cols-2">
            <FieldGroup title="风格接受度" optional>
              <select
                value={answers.styleOpenness ?? ''}
                onChange={(event) => updateAnswers({ styleOpenness: event.target.value ? Number(event.target.value) : null })}
                className="w-full border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none focus:border-ink-900/40"
              >
                <option value="">保持默认</option>
                {STYLE_OPENNESS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.desc}
                  </option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup title="城市与气候" optional>
              <div className="grid grid-cols-[1fr_1fr] gap-3">
                <input
                  value={answers.city}
                  onChange={(event) => updateAnswers({ city: event.target.value })}
                  placeholder="城市"
                  className="border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none focus:border-ink-900/40"
                />
                <select
                  value={answers.climate ?? ''}
                  onChange={(event) => updateAnswers({ climate: event.target.value ? event.target.value as ClimateZone : null })}
                  className="border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none focus:border-ink-900/40"
                >
                  <option value="">气候</option>
                  {CLIMATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </FieldGroup>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(['全部', ...DIMENSIONS] as const).map((dimension) => (
            <button
              key={dimension}
              onClick={() => setActiveDimension(dimension)}
              className={cn(
                'border px-4 py-2 text-xs tracking-[0.12em] transition',
                activeDimension === dimension
                  ? 'border-ink-900 bg-ink-900 text-creme-100'
                  : 'border-ink-900/10 bg-white/45 text-ink-500 hover:border-ink-900/30 hover:text-ink-900',
              )}
            >
              {dimension === '全部' ? '全部风格' : DIMENSION_LABELS[dimension]}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索风格"
            className="w-full border border-ink-900/10 bg-white/50 py-3 pl-11 pr-11 text-sm text-ink-700 outline-none transition placeholder:text-ink-300 focus:border-ink-900/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="清除搜索"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid max-h-[640px] gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
          {displayStyles.map((style) => {
            const selected = answers.preferredStyleIds.includes(style.id);
            const imageUrl = getStyleImage(style.id);
            return (
              <button
                key={style.id}
                onClick={() => toggleStyle(style.id)}
                className={cn(
                  'group overflow-hidden border bg-white/55 text-left transition',
                  selected ? 'border-ink-900 shadow-[0_18px_50px_rgba(10,10,10,0.12)]' : 'border-ink-900/10 hover:border-ink-900/30',
                )}
              >
                <div className="relative aspect-[4/3] bg-[#ebe7df]">
                  {imageUrl ? (
                    <img src={imageUrl} alt={style.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-300">IMAGE SLOT</div>
                  )}
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-ink-900 text-creme-100">
                      <Check size={15} />
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl leading-none">{style.name}</h3>
                    <span className="shrink-0 text-[10px] tracking-[0.16em] text-ink-400">
                      {CATEGORY_LABELS[style.category] || style.category}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-5 text-ink-500">{style.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {displayStyles.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-400">
            {searchQuery ? `没有找到与 "${searchQuery}" 相关的风格` : '该分类暂无风格'}
          </div>
        )}
      </div>
    </>
  );
}

function IntentStep({
  answers,
  updateAnswers,
  statementEdited,
  setStatementEdited,
}: {
  answers: OnboardingAnswers;
  updateAnswers: (patch: Partial<OnboardingAnswers>) => void;
  statementEdited: boolean;
  setStatementEdited: (value: boolean) => void;
}) {
  const extracted = useMemo(() => extractStyleIntent(answers.userStatement), [answers.userStatement]);

  return (
    <>
      <SectionHeader
        icon={SlidersHorizontal}
        label="03"
        title="生成"
        copy="确认这段话，或简单改几句。"
      />
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs tracking-[0.22em] text-ink-400">STYLE INTENT INPUT</p>
            <button
              type="button"
              onClick={() => {
                setStatementEdited(false);
                updateAnswers({ userStatement: buildGeneratedStatement(answers) });
              }}
              className="border border-ink-900/10 bg-white/55 px-4 py-2 text-xs text-ink-500 transition hover:border-ink-900/30 hover:text-ink-900"
            >
重新整理
            </button>
          </div>
          <textarea
            value={answers.userStatement}
            onChange={(event) => {
              setStatementEdited(true);
              updateAnswers({ userStatement: event.target.value });
            }}
            placeholder="例如：我最近喜欢干净、有质感、稍微显高的穿搭，不想太甜，也不想看起来很网红。日常上学和周末出门比较多，希望舒服但有一点态度。"
            className="min-h-[380px] w-full resize-none border border-ink-900/10 bg-white/55 p-5 text-sm leading-7 text-ink-700 outline-none transition placeholder:text-ink-300 focus:border-ink-900/40"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
            <span>{statementEdited ? '已手动编辑' : '由前面选项自动生成'}</span>
            <span>{answers.userStatement.trim().length}/20 字以上可生成</span>
          </div>
        </div>

        <aside className="border border-ink-900/10 bg-[#e8ece8] p-5">
          <p className="mb-4 text-xs tracking-[0.22em] text-ink-500">已识别</p>
          <IntentList title="喜欢/倾向" items={extracted.likedKeywords} />
          <IntentList title="排斥/雷区" items={extracted.dislikedKeywords} />
          <IntentList title="想呈现的感觉" items={extracted.desiredImpression} />
          <IntentList title="使用场景" items={extracted.scenes} />
          <IntentList title="现实限制" items={extracted.constraints} />
        </aside>
      </div>
    </>
  );
}

function IntentList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="mb-2 text-xs text-ink-400">{title}</p>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span key={item} className="bg-white/65 px-2.5 py-1 text-xs text-ink-600">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-300">暂未提取</p>
      )}
    </div>
  );
}

function FieldGroup({ title, optional, children }: { title: string; optional?: boolean; children: React.ReactNode }) {
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

function ChoiceButton({
  active,
  compact,
  children,
  onClick,
}: {
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

function NumberInput({
  label,
  unit,
  value,
  placeholder,
  onChange,
}: {
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
