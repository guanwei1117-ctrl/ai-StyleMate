'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Camera, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoUpload from '@/components/score-outfit/photo-upload';
import ScoreResult from '@/components/score-outfit/score-result';
import { evaluateOutfit } from '@/lib/scoring-api';
import { loadStyleProfile } from '@/lib/style-profile-storage';
import { isAuthenticated } from '@/lib/auth';
import type { EvaluateOutfitResponse } from '@/lib/scoring-types';

type Mode = 'diagnose' | 'analyze';

const OCCASION_OPTIONS = [
  { value: '', label: '不限' },
  { value: 'commute', label: '通勤' },
  { value: 'date', label: '约会' },
  { value: 'party', label: '派对' },
  { value: 'casual', label: '日常出街' },
  { value: 'work', label: '上班' },
  { value: 'travel', label: '出游' },
];

const MODE_OPTIONS: Array<{
  value: Mode;
  label: string;
  description: string;
}> = [
  {
    value: 'diagnose',
    label: '诊断穿搭',
    description: '结合你的偏好和长期记忆打分，告诉你穿得对不对、好不好看',
  },
  {
    value: 'analyze',
    label: '分析穿搭',
    description: '只看衣服本身，不参考你的偏好——适合看他人的穿搭或博主图',
  },
];

export default function CameraPage() {
  // useSearchParams 必须在 Suspense 内（Next.js 14 预渲染要求）
  // 真实逻辑放在 CameraContent，主组件只做 Suspense 包裹
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f4f1ea]" />}>
      <CameraContent />
    </Suspense>
  );
}

function CameraContent() {
  const searchParams = useSearchParams();
  // URL query 决定初始模式，便于外链直达：/styles/camera?mode=analyze
  const initialMode: Mode = searchParams.get('mode') === 'analyze' ? 'analyze' : 'diagnose';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [imageBase64, setImageBase64] = useState('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluateOutfitResponse | null>(null);

  // 仅在诊断模式读取本地档案（用于关联上下文）
  const [storedProfile, setStoredProfile] = useState<ReturnType<typeof loadStyleProfile>>(null);
  useEffect(() => {
    if (mode === 'diagnose') setStoredProfile(loadStyleProfile());
  }, [mode]);

  const handleModeChange = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    // 切模式时清掉结果，避免混淆
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (mode === 'diagnose' && !isAuthenticated()) {
      setError('诊断穿搭需要先登录（用于读取你的偏好和长期记忆）');
      return;
    }
    if (!imageBase64) {
      setError('请先上传穿搭照片');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userContext =
        mode === 'diagnose' && storedProfile
          ? {
              gender: storedProfile.answersSummary.gender ?? undefined,
              height: storedProfile.answersSummary.height ?? undefined,
              weight: storedProfile.answersSummary.weight ?? undefined,
              bodyShape: storedProfile.bodyShape,
              occasion: occasion || undefined,
            }
          : undefined; // 分析穿搭：不传 userContext

      // 分析穿搭模式：传 'skip' 让后端跳过长期记忆加载（scoring.service.ts 已天然支持）
      const userId: 'skip' | undefined = mode === 'analyze' ? 'skip' : undefined;
      const data = await evaluateOutfit({ imageBase64, userContext, userId });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageBase64('');
    setResult(null);
    setError(null);
  };

  const modeMeta = useMemo(() => MODE_OPTIONS.find((m) => m.value === mode)!, [mode]);

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-ink-900">
      {/* Header */}
      <div className="fixed inset-x-0 top-0 z-40 border-b border-ink-900/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900"
          >
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <p className="font-display text-lg tracking-wide">STYLEMATE</p>
          <span className="text-xs tracking-[0.18em] text-ink-400">拍立搭</span>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-28 lg:px-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="space-y-6"
            >
              <header className="text-center">
                <p className="mb-3 text-xs tracking-[0.3em] text-warning">
                  拍立搭 · CAMERA STYLE
                </p>
                <h1 className="font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
                  AI 风格识别 · 适配评估
                </h1>
                <p className="mt-4 text-sm leading-7 text-ink-500">
                  上传一张完整 Look 照片，AI 会从风格识别 / 色彩 / 版型等维度给出分析与建议。
                </p>
              </header>

              {/* 模式切换 —— 选择「诊断穿搭」或「分析穿搭」 */}
              <div className="border border-ink-900/10 bg-white/50 p-5">
                <label className="mb-3 block text-xs font-semibold tracking-[0.2em] text-ink-400">
                  选择模式
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {MODE_OPTIONS.map((opt) => {
                    const active = mode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleModeChange(opt.value)}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                          active
                            ? 'border-ink-900 bg-ink-900 text-creme-100'
                            : 'border-ink-900/10 bg-white text-ink-700 hover:border-ink-900/40'
                        }`}
                      >
                        <span className={`mt-0.5 shrink-0 ${active ? 'text-creme-100' : 'text-warning'}`}>
                          {opt.value === 'diagnose' ? <Sparkles size={18} /> : <Search size={18} />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{opt.label}</p>
                          <p className={`mt-1 text-xs leading-5 ${active ? 'text-creme-100/85' : 'text-ink-500'}`}>
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <PhotoUpload onPhotoReady={setImageBase64} />

              {/* 场合选择 —— 仅诊断模式显示（分析模式不参考偏好） */}
              {mode === 'diagnose' && (
                <div className="border border-ink-900/10 bg-white/50 p-5">
                  <label className="mb-3 block text-xs font-semibold tracking-[0.2em] text-ink-400">
                    穿搭场合（选填）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OCCASION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setOccasion(opt.value)}
                        className={`px-3.5 py-1.5 text-sm transition-colors ${
                          occasion === opt.value
                            ? 'bg-ink-900 text-creme-100'
                            : 'border border-ink-900/10 bg-white text-ink-600 hover:border-ink-900/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {storedProfile && (
                    <p className="mt-3 text-xs text-ink-400">
                      已关联风格档案：
                      {storedProfile.answersSummary.preferredStyles.slice(0, 3).join('、') || '未选择'}
                      {storedProfile.bodyShape ? ` · ${storedProfile.bodyShape}` : ' · 未分析体型'}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!imageBase64 || loading}
                className="flex w-full items-center justify-center gap-2 bg-ink-900 px-6 py-4 text-sm font-medium text-creme-100 transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-200"
              >
                {loading ? (
                  'AI 正在分析中…'
                ) : (
                  <>
                    <Camera size={16} />
                    开始{modeMeta.label}
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ScoreResult
                result={result}
                onReset={handleReset}
                mode={mode}
                imageBase64={imageBase64}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}