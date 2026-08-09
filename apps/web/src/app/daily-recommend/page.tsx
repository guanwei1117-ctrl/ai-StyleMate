'use client';

import { useState } from 'react';
import { generateTodayOutfit } from '@/lib/today-outfit-api';
import { submitFeedback } from '@/lib/feedback-api';
import type { TodayOutfitResponse, OutfitPlan } from '@/lib/today-outfit-types';

export default function DailyRecommendPage() {
  const [city, setCity] = useState('上海');
  const [occasion, setOccasion] = useState('commute');
  const [styleGoal, setStyleGoal] = useState('comfortable');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TodayOutfitResponse | null>(null);
  const [error, setError] = useState('');

  // 各方案的反馈状态
  const [reactions, setReactions] = useState<Record<number, 'like' | 'dislike' | ''>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await generateTodayOutfit({ city, occasion, styleGoal, constraints: [] });
      setResult(data);
    } catch (e: any) {
      setError(e?.message || '生成失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(index: number, plan: OutfitPlan) {
    setSubmitting((s) => ({ ...s, [index]: true }));
    try {
      await submitFeedback({
        reaction: reactions[index] || 'like',
        rating: ratings[index] ?? 0,
        comment: comments[index] || '',
        planTitle: plan.title,
        plan: plan,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting((s) => ({ ...s, [index]: false }));
    }
  }

  return (
    <main className="min-h-screen bg-creme text-ink">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <p className="text-sm font-medium text-ink/60">首页 · 今日穿搭</p>
          <h1 className="mt-2 text-3xl font-bold">今天穿什么</h1>
          <p className="mt-2 text-ink/70">
            AI 基于你的长期画像（身材、风格偏好、衣橱单品）自动生成今日推荐，
            你只需一键采纳或微调。
          </p>
        </header>

        <section className="rounded-2xl border border-ink/10 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">城市</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-ink/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">场合</span>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="rounded-lg border border-ink/20 px-3 py-2"
              >
                {[
                  'commute',
                  'work',
                  'date',
                  'client',
                  'shopping',
                  'travel',
                  'party',
                  'casual',
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">风格目标</span>
                <select
                  value={styleGoal}
                  onChange={(e) => setStyleGoal(e.target.value)}
                  className="rounded-lg border border-ink/20 px-3 py-2"
                >
                {[
                  'comfortable',
                  'slimming',
                  'taller',
                  'polished',
                  'lowkey',
                  'photogenic',
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-ink py-3 text-lg font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? '生成中…' : '生成今日穿搭'}
          </button>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </section>

        {result && (
          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">为你推荐的方案</h2>
            {result.plans.map((plan, i) => (
              <article
                key={i}
                className="rounded-2xl border border-ink/10 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {plan.type === 'safe' ? '🛡️' : plan.type === 'flattering' ? '✨' : '🎨'}
                      </span>
                      <h3 className="text-lg font-semibold">{plan.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-ink/70">{plan.reason}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      场景：{plan.scene} · 评分 {plan.score}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink/5 px-3 py-1 text-sm font-medium">
                    {plan.type === 'safe'
                      ? '稳妥不出错'
                      : plan.type === 'flattering'
                      ? '显瘦显高'
                      : '更有氛围感'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {[
                    ['上装', plan.top],
                    ['下装', plan.bottom],
                    ['外套', plan.outerwear],
                    ['鞋子', plan.shoes],
                    ['配饰', plan.accessory],
                  ].map(([label, item]) => (
                    <div key={String(label)} className="rounded-lg bg-ink/5 px-3 py-2">
                      <p className="text-xs text-ink/50">{String(label)}</p>
                      <p className="font-medium">
                        {item && typeof item === 'object' && 'description' in item
                          ? item.description
                          : '—'}
                      </p>
                    </div>
                  ))}
                </div>

                {plan.riskWarning && (
                  <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    ⚠️ {plan.riskWarning}
                  </p>
                )}

                <div className="mt-4 border-t border-ink/10 pt-4">
                  <p className="mb-2 text-sm font-medium">你的反馈（记入长期记忆）</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setReactions((r) => ({ ...r, [i]: 'like' }))
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          reactions[i] === 'like'
                            ? 'bg-green-600 text-white'
                            : 'bg-ink/5'
                        }`}
                      >
                        👍 喜欢
                      </button>
                      <button
                        onClick={() =>
                          setReactions((r) => ({ ...r, [i]: 'dislike' }))
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          reactions[i] === 'dislike'
                            ? 'bg-red-600 text-white'
                            : 'bg-ink/5'
                        }`}
                      >
                        👎 不喜欢
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <span>评分</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={ratings[i] ?? ''}
                        onChange={(e) =>
                          setRatings((r) => ({
                            ...r,
                            [i]: Number(e.target.value),
                          }))
                        }
                        className="w-16 rounded-lg border border-ink/20 px-2 py-2"
                      />
                    </label>
                    <input
                      value={comments[i] ?? ''}
                      onChange={(e) =>
                        setComments((r) => ({ ...r, [i]: e.target.value }))
                      }
                      placeholder="写点评语…"
                      className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleFeedback(i, plan)}
                      disabled={submitting[i]}
                      className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90 disabled:opacity-50"
                    >
                      {submitting[i] ? '提交中…' : '提交反馈'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
