'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { syncProfileToServer } from '@/lib/profile-sync';
import { syncPushLocal, SYNC_ENTRIES } from '@/lib/sync-api';
import { deriveBodyShape } from '@/lib/body-analysis';
import { matchStyles } from '@/lib/style-matcher';
import {
  AGE_GROUP_OPTIONS,
  BUDGET_OPTIONS,
  CLIMATE_OPTIONS,
  DAILY_SCENE_OPTIONS,
  DRESSING_GOAL_OPTIONS,
  OCCUPATION_OPTIONS,
  PRIORITY_OPTIONS, DRESSING_GOAL_LABELS, PRIORITY_LABELS,
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
import { OnboardingGuideDialog } from '@/components/onboarding/onboarding-guide-dialog';
import { PhotoSlot } from '@/components/onboarding/photo-slot';
import {
  SectionHeader,
  TagGroup,
  IntentChip,
  FieldGroup,
  ChoiceButton,
  NumberInput,
} from '@/components/onboarding/shared-fields';
import {
  analyzeStyleProfileWithAi,
  mergeAiStyleResults,
  type AiStyleProfileAnalysis,
} from '@/lib/style-profile-api';
import {
  buildGeneratedStatement,
  createStoredStyleProfile,
  extractStyleIntent, extractStylePreference,
  saveStyleProfile,
  loadStyleProfile,
  clearStyleProfile,
  type StoredStyleProfile,
} from '@/lib/style-profile-storage';
import { ACCEPTED_IMAGE_MIME_TYPES, IMAGE_UPLOAD_SIZE_LABEL, validateImageFile } from '@/lib/image-upload-rules';
import { ONBOARDING_GUIDE_SECTIONS } from '@/lib/onboarding-guide';

const FLOW = [
  { id: 'profile', label: '基础', desc: '身高 / 体重 / 年龄' },
  { id: 'preference', label: '偏好', desc: '风格 / 预算 / 目标' },
] as const;

const genderOptions: { label: string; value: Gender }[] = [
  { label: '不限定', value: 'other' },
  { label: '女性', value: 'female' },
  { label: '男性', value: 'male' },
];


export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f1ea]" />}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
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

  const searchParams = useSearchParams();
  const isHistoryView = searchParams?.get('view') === 'history';
  const [historyProfile, setHistoryProfile] = useState<StoredStyleProfile | null>(null);

  const isResultStep = step === FLOW.length;

  // 历史档案查看模式：从 localStorage 读取已保存的档案并展示
  useEffect(() => {
    if (isHistoryView) {
      const stored = loadStyleProfile();
      setHistoryProfile(stored);
      if (stored) {
        setResults(stored.results);
        setBodyShape(stored.bodyShape);
        setAiAnalysis(stored.aiAnalysis ?? null);
        setStep(FLOW.length);
      }
    }
  }, [isHistoryView]);


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

  const handlePhotoRemove = (kind: 'face' | 'fullBody') => {
    if (kind === 'face') {
      if (answers.photoPreview) URL.revokeObjectURL(answers.photoPreview);
      updateAnswers({ photo: null, photoPreview: null });
    } else {
      if (answers.fullBodyPhotoPreview) URL.revokeObjectURL(answers.fullBodyPhotoPreview);
      updateAnswers({ fullBodyPhoto: null, fullBodyPhotoPreview: null });
    }
  };

  const filteredStyles = useMemo(() => {
    if (activeDimension === '全部') return STYLES;
    return STYLES.filter((style) => style.dimension === activeDimension);
  }, [activeDimension]);







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
      const profile = createStoredStyleProfile(answers, shape, aiMatched, ai);
      saveStyleProfile(profile);
      syncPushLocal(SYNC_ENTRIES.styleProfile, profile);
      await syncProfileToServer(answers, aiMatched, shape);
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
    const fallbackProfile = createStoredStyleProfile(answers, shape, matched);
    saveStyleProfile(fallbackProfile);
    syncPushLocal(SYNC_ENTRIES.styleProfile, fallbackProfile);
    await syncProfileToServer(answers, matched, shape);
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
    setHistoryProfile(null);
    setStep(0);
  };

  const handleClearHistory = () => {
    clearStyleProfile();
    setHistoryProfile(null);
    setResults([]);
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

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-28 lg:px-10">
        <div className="flex flex-col gap-8">
          {!isHistoryView && (
            <header className="text-center">
              <p className="mb-3 text-xs tracking-[0.3em] text-ink-400">STYLE TEST</p>
              <h1 className="font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
                测测适合什么风格
              </h1>
              <p className="mt-4 text-sm leading-7 text-ink-500">
                填基础，写偏好，生成建议。
              </p>
            </header>
          )}

          {isHistoryView && !historyProfile && (
            <div className="border border-ink-900/10 bg-[#fbfaf6] p-10 text-center">
              <p className="text-sm text-ink-500">还没有保存的风格档案。</p>
              <Link href="/onboarding" className="mt-4 inline-flex items-center gap-2 bg-ink-900 px-6 py-3 text-sm text-creme-100 transition hover:bg-ink-800">
                去测评
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {isHistoryView && historyProfile && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border border-ink-900/10 bg-[#e8ece8] p-5">
                <div>
                  <p className="text-xs tracking-[0.22em] text-ink-500">已保存档案</p>
                  <p className="mt-1 text-sm text-ink-700">
                    生成于 {new Date(historyProfile.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="border border-ink-900/15 bg-white/60 px-4 py-2 text-xs text-ink-500 transition hover:border-red-300 hover:text-red-700"
                >
                  清除档案
                </button>
              </div>
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-ink-900/10 bg-[#fbfaf6] p-5 sm:p-8"
              >
                <ResultView
                  results={historyProfile.results}
                  answers={answers}
                  bodyShape={historyProfile.bodyShape}
                  aiAnalysis={historyProfile.aiAnalysis ?? null}
                  analysisError={null}
                  onRestart={handleRestart}
                />
              </motion.section>
            </div>
          )}

          {!isHistoryView && (
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
                      onPhotoRemove={handlePhotoRemove}
                    />
                  )}
                  {step === 1 && (
                    <PreferenceStep
                      answers={answers}
                      updateAnswers={updateAnswers}
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
          )}
        </div>
      </section>
    </main>
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
  onPhotoRemove,
}: {
  answers: OnboardingAnswers;
  updateAnswers: (patch: Partial<OnboardingAnswers>) => void;
  faceInputRef: React.RefObject<HTMLInputElement>;
  fullBodyInputRef: React.RefObject<HTMLInputElement>;
  photoError: string | null;
  measurementsOpen: boolean;
  setMeasurementsOpen: (open: boolean) => void;
  onPhotoChange: (kind: 'face' | 'fullBody', event: ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: (kind: 'face' | 'fullBody') => void;
}) {
  return (
    <>
      <SectionHeader
        icon={UserRound}
        label="01"
        title="基础"
        copy="必填：性别、身高、体重、年龄。"
      />
      {false && (<div className="mx-6 mt-6 border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800 sm:mx-8">
        照片选填，只用于穿搭分析。
      </div>)}
      <div className="grid gap-8 p-6 sm:p-8">
        {false && (<div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {false && (<PhotoSlot
              label="正脸照"
              desc={`选填，不超过 ${IMAGE_UPLOAD_SIZE_LABEL}。`}
              preview={answers.photoPreview}
              onClick={() => faceInputRef.current?.click()}
              onRemove={() => onPhotoRemove('face')}
            />)}
            {false && (<PhotoSlot
              label="全身照"
              desc={`选填，不超过 ${IMAGE_UPLOAD_SIZE_LABEL}。`}
              preview={answers.fullBodyPhotoPreview}
              onClick={() => fullBodyInputRef.current?.click()}
              onRemove={() => onPhotoRemove('fullBody')}
            />)}
          </div>
          {photoError && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {photoError}
            </p>
          )}
          {false && (<input ref={faceInputRef} type="file" accept={ACCEPTED_IMAGE_MIME_TYPES} onChange={(event) => onPhotoChange('face', event)} className="hidden" />)}
          {false && (<input ref={fullBodyInputRef} type="file" accept={ACCEPTED_IMAGE_MIME_TYPES} onChange={(event) => onPhotoChange('fullBody', event)} className="hidden" />)}
        </div>)}

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

          {false && (<div className="border border-ink-900/10 bg-white/40">
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
          </div>)}
        </div>
      </div>
    </>
  );
}

function PreferenceStep({
  answers,
  updateAnswers,
}: {
  answers: OnboardingAnswers;
  updateAnswers: (patch: Partial<OnboardingAnswers>) => void;
}) {
  const [styleBrowseOpen, setStyleBrowseOpen] = useState(false);
  const [styleSearch, setStyleSearch] = useState('');

  const extracted = useMemo(
    () => extractStylePreference(answers.userStatement),
    [answers.userStatement],
  );

  const handleTextChange = useCallback((text: string) => {
    const prefs = extractStylePreference(text);
    updateAnswers({
      userStatement: text,
      preferredStyleIds: prefs.styleIds.length > 0 ? prefs.styleIds : answers.preferredStyleIds,
      budget: (prefs.budget ?? answers.budget) as BudgetLevel | null,
      dressingGoals: prefs.dressingGoals.length > 0 ? prefs.dressingGoals as DressingGoal[] : answers.dressingGoals,
      priorities: prefs.priorities.length > 0 ? prefs.priorities as PriorityDimension[] : answers.priorities,
    });
  }, [updateAnswers, answers.preferredStyleIds, answers.budget, answers.dressingGoals, answers.priorities]);

  const appendStyleToText = (styleName: string) => {
    const newText = answers.userStatement.includes(styleName)
      ? answers.userStatement
      : `${answers.userStatement} 我喜欢${styleName}`.trim();
    handleTextChange(newText);
  };

  const displayStyles = useMemo(() => {
    if (!styleSearch.trim()) return STYLES;
    const q = styleSearch.trim().toLowerCase();
    return STYLES.filter((s) =>
      s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }, [styleSearch]);

  const GUIDE_QUESTIONS = [
    '你平时喜欢什么风格？韩系、日系、法式、街头、极简……',
    '你的穿搭预算是多少？平价实惠、中等价位、轻奢品质？',
    '你的穿搭目标是什么？显高显瘦、职场专业、舒适至上……',
    '日常在什么场景穿？通勤、约会、上学、出街……',
    '有什么特别不喜欢或要避开的？太甜、网红、紧身……',
  ];

  return (
    <>
      <SectionHeader
        icon={Sparkles}
        label="02"
        title="偏好"
        copy="用你自己的话描述风格偏好，我们帮你理解。"
      />
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 space-y-2">
            <p className="text-xs tracking-[0.18em] text-ink-400">可以聊聊这些</p>
            {GUIDE_QUESTIONS.map((q, i) => (
              <p key={i} className="text-xs text-ink-400/70 leading-relaxed">
                · {q}
              </p>
            ))}
          </div>

          <textarea
            value={answers.userStatement}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="用你自己的话描述，越多越好…\n\n例如：我最近喜欢干净、有质感、稍微显高的穿搭，不想太甜，也不想看起来很网红。日常上学和周末出门比较多，预算中等，希望舒服但有一点态度。"
            className="min-h-[320px] w-full resize-none border border-ink-900/10 bg-white/55 p-5 text-sm leading-7 text-ink-700 outline-none transition placeholder:text-ink-300 focus:border-ink-900/40"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
            <span>文字越详细，分析越准确</span>
            <span className={answers.userStatement.trim().length >= 20 ? 'text-olive-dark' : ''}>
              {answers.userStatement.trim().length}/20 字以上可生成
            </span>
          </div>

          <div className="mt-4 border-t border-ink-900/10 pt-4">
            <button
              type="button"
              onClick={() => setStyleBrowseOpen(!styleBrowseOpen)}
              className="flex items-center gap-2 text-xs text-ink-500 hover:text-ink-900"
            >
              <BookOpen size={14} />
              {styleBrowseOpen ? '收起风格库' : '浏览风格库（点击追加到文字）'}
            </button>
            {styleBrowseOpen && (
              <div className="mt-3">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-300" />
                  <input
                    type="text"
                    value={styleSearch}
                    onChange={(e) => setStyleSearch(e.target.value)}
                    placeholder="搜索风格"
                    className="w-full border border-ink-900/10 bg-white/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-ink-900/40"
                  />
                </div>
                <div className="grid max-h-[520px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {displayStyles.map((style) => {
                    const active = answers.preferredStyleIds.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        onClick={() => appendStyleToText(style.name)}
                        className={cn(
                          'border px-3 py-2 text-left text-xs transition',
                          active
                            ? 'border-ink-900 bg-[#e8ece8] text-ink-900'
                            : 'border-ink-900/10 bg-white/50 text-ink-600 hover:border-ink-900/30',
                        )}
                      >
                        <span className="font-medium">{style.name}</span>
                        <span className="ml-1.5 text-ink-400">
                          {CATEGORY_LABELS[style.category] || style.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="border border-ink-900/10 bg-[#e8ece8] p-5">
          <p className="mb-4 text-xs tracking-[0.22em] text-ink-500">已识别</p>

          {extracted.styleIds.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-xs text-ink-400">匹配风格</p>
              <div className="flex flex-wrap gap-1.5">
                {extracted.styleIds.map((id) => {
                  const s = STYLES.find((x) => x.id === id);
                  return s ? (
                    <span key={id} className="bg-white/65 px-2.5 py-1 text-xs text-ink-600">{s.name}</span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {extracted.budget && (
            <IntentChip label="预算" value={BUDGET_OPTIONS.find((o) => o.value === extracted.budget)?.label ?? extracted.budget} />
          )}

          <TagGroup label="喜欢/倾向" items={extracted.likedKeywords} />
          <TagGroup label="排斥/雷区" items={extracted.dislikedKeywords} type="negative" />
          <TagGroup label="想呈现的感觉" items={extracted.desiredImpression} />
          <TagGroup label="使用场景" items={extracted.scenes} />
          <TagGroup label="穿搭目标" items={extracted.dressingGoals.map((g) => DRESSING_GOAL_LABELS[g as DressingGoal] ?? g)} />

          {extracted.priorities.length > 0 && (
            <TagGroup label="优先考虑" items={extracted.priorities.map((p) => PRIORITY_LABELS[p as PriorityDimension] ?? p)} />
          )}

          <TagGroup label="现实限制" items={extracted.constraints} />
        </aside>
      </div>

    </>
  );
}

