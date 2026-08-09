'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoUpload from '@/components/score-outfit/photo-upload';
import ScoreResult from '@/components/score-outfit/score-result';
import { evaluateOutfit } from '@/lib/scoring-api';
import { loadStyleProfile } from '@/lib/style-profile-storage';
import type { EvaluateOutfitResponse } from '@/lib/scoring-types';

const OCCASION_OPTIONS = [
  { value: '', label: '不限' },
  { value: 'commute', label: '通勤' },
  { value: 'date', label: '约会' },
  { value: 'party', label: '派对' },
  { value: 'casual', label: '日常出街' },
  { value: 'work', label: '上班' },
  { value: 'travel', label: '出游' },
];

export default function ScoreOutfitPage() {
  const [imageBase64, setImageBase64] = useState('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluateOutfitResponse | null>(null);

  // 从本地档案读取用户基础画像，丰富评分上下文
  const [storedProfile, setStoredProfile] = useState<ReturnType<typeof loadStyleProfile>>(null);

  useEffect(() => {
    setStoredProfile(loadStyleProfile());
  }, []);

  const handleSubmit = async () => {
    if (!imageBase64) {
      setError('请先上传穿搭照片');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userContext = storedProfile
        ? {
            gender: storedProfile.answersSummary.gender ?? undefined,
            height: storedProfile.answersSummary.height ?? undefined,
            weight: storedProfile.answersSummary.weight ?? undefined,
            bodyShape: storedProfile.bodyShape,
            occasion: occasion || undefined,
          }
        : { occasion: occasion || undefined };

      const data = await evaluateOutfit({ imageBase64, userContext });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '评分失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageBase64('');
    setResult(null);
    setError(null);
  };

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
          <span className="text-xs tracking-[0.18em] text-ink-400">
            今日诊断
          </span>
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
                <p className="mb-3 text-xs tracking-[0.3em] text-ink-400">
                  OUTFIT DIAGNOSIS
                </p>
                <h1 className="font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
                  今日穿搭诊断
                </h1>
                <p className="mt-4 text-sm leading-7 text-ink-500">
                  上传今天的穿搭照片，AI 从 8 个维度给出评分和改良建议。
                </p>
              </header>

              <PhotoUpload onPhotoReady={setImageBase64} />

              {/* 场合选择 */}
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
                    已关联风格档案：{storedProfile.answersSummary.preferredStyles.slice(0, 3).join('、') || '未选择'} · {storedProfile.bodyShape ? storedProfile.bodyShape : '未分析体型'}
                  </p>
                )}
              </div>

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
                    <Sparkles size={16} />
                    开始诊断
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
              <ScoreResult result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
