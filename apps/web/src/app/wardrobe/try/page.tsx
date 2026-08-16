'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  ShoppingBag,
  BarChart3,
  ArrowRight,
  ListTodo,
  Plus,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TodayOutfitDialog from '@/components/wardrobe/today-outfit-dialog';
import PurchaseEvaluationDialog from '@/components/wardrobe/purchase-evaluation-dialog';
import ShoppingListDialog from '@/components/wardrobe/shopping-list-dialog';
import { analyzeWardrobeGaps, addShoppingItems } from '@/lib/wardrobe-api';
import { getCurrentUserId } from '@/lib/auth';
import { WardrobeGapResult, PRIORITY_LABELS } from '@/lib/wardrobe-types';

const TOOLS = [
  {
    key: 'today-outfit',
    title: '今天穿什么？',
    desc: '输入城市和场合，AI 从你的衣橱里搭配 3 套方案',
    icon: Sparkles,
    bgColor: 'bg-ink-50',
    iconBg: 'bg-ink-900/10',
    dialog: 'today-outfit',
  },
  {
    key: 'score-outfit',
    title: '今日穿搭诊断',
    desc: '上传今天的 Look 照片，AI 从 8 个维度评分并给出改良建议',
    icon: Search,
    bgColor: 'bg-olive-50',
    iconBg: 'bg-olive-900/10',
    link: '/score-outfit',
  },
  {
    key: 'purchase-eval',
    title: '这件值得买吗？',
    desc: '上传商品截图，AI 结合你的衣橱和风格判断是否值得入手',
    icon: ShoppingBag,
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-900/10',
    dialog: 'purchase-eval',
  },
  {
    key: 'wardrobe-gaps',
    title: '衣橱缺口分析',
    desc: 'AI 结合你的风格档案和季节，告诉你该先补什么品类',
    icon: BarChart3,
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-900/10',
    action: 'gaps',
  },
  {
    key: 'shopping-list',
    title: '我的购物清单',
    desc: '把缺口建议、起步方案的单品汇总成可勾选的购买清单',
    icon: ListTodo,
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-900/10',
    dialog: 'shopping-list',
  },
];

const GAP_CATEGORY_LABELS: Record<string, string> = {
  top: '上装', bottom: '下装', outerwear: '外套',
  dress: '连衣裙', shoes: '鞋子', accessory: '配饰',
};

export default function TryPage() {
  const [todayOutfitOpen, setTodayOutfitOpen] = useState(false);
  const [purchaseEvalOpen, setPurchaseEvalOpen] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [gapsResult, setGapsResult] = useState<WardrobeGapResult | null>(null);
  const [gapsLoading, setGapsLoading] = useState(false);
  const [gapsError, setGapsError] = useState<string | null>(null);
  const [addedGaps, setAddedGaps] = useState<Set<string>>(new Set());
  const [addingGap, setAddingGap] = useState<string | null>(null);

  const handleGapsAnalysis = async () => {
    setGapsLoading(true);
    setGapsError(null);
    setGapsResult(null);
    setAddedGaps(new Set());
    try {
      const result = await analyzeWardrobeGaps(getCurrentUserId());
      setGapsResult(result);
    } catch (err) {
      setGapsError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setGapsLoading(false);
    }
  };

  const handleAddGapToShoppingList = async (category: string, priority: number) => {
    if (!gapsResult) return;
    const gap = gapsResult.gaps.find((g) => g.category === category);
    if (!gap) return;
    setAddingGap(category);
    try {
      await addShoppingItems([
        {
          category: gap.category,
          subCategory: gap.suggestion.subCategory || undefined,
          description: [gap.suggestion.color, gap.suggestion.subCategory].filter(Boolean).join(' ') || undefined,
          color: gap.suggestion.color || undefined,
          budgetRange: gap.suggestion.budgetRange || undefined,
          priority,
          reason: gap.reason || undefined,
          source: 'gap-analysis',
        },
      ]);
      setAddedGaps((prev) => new Set(prev).add(category));
    } catch (err) {
      setGapsError(err instanceof Error ? err.message : '加入清单失败');
    } finally {
      setAddingGap(null);
    }
  };

  const handleAddAllGaps = async () => {
    if (!gapsResult || gapsResult.gaps.length === 0) return;
    setAddingGap('__all__');
    try {
      await addShoppingItems(
        gapsResult.gaps.map((gap) => ({
          category: gap.category,
          subCategory: gap.suggestion.subCategory || undefined,
          description: [gap.suggestion.color, gap.suggestion.subCategory].filter(Boolean).join(' ') || undefined,
          color: gap.suggestion.color || undefined,
          budgetRange: gap.suggestion.budgetRange || undefined,
          priority: gap.priority,
          reason: gap.reason || undefined,
          source: 'gap-analysis',
        })),
      );
      setAddedGaps(new Set(gapsResult.gaps.map((g) => g.category)));
    } catch (err) {
      setGapsError(err instanceof Error ? err.message : '加入清单失败');
    } finally {
      setAddingGap(null);
    }
  };

  const handleCardClick = (tool: typeof TOOLS[number]) => {
    if (tool.dialog === 'today-outfit') setTodayOutfitOpen(true);
    else if (tool.dialog === 'purchase-eval') setPurchaseEvalOpen(true);
    else if (tool.dialog === 'shopping-list') setShoppingListOpen(true);
    else if (tool.action === 'gaps') handleGapsAnalysis();
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-ink-900/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            ← 返回首页
          </Link>
          <p className="font-display text-lg tracking-wide">STYLEMATE</p>
          <p className="text-sm text-ink-900 font-medium">尝试</p>
        </div>
      </div>

      <section className="mx-auto max-w-2xl px-6 pt-8 lg:px-10">
        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">
            AI 穿搭实验室
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink-500">
            试试 AI 能怎么帮你穿得更好
          </p>
        </header>

        {/* Tool cards */}
        <div className="grid gap-4">
          {TOOLS.map((tool, idx) => (
            <motion.div
              key={tool.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              {tool.link ? (
                <Link
                  href={tool.link}
                  className={`flex items-center gap-5 rounded-2xl border border-ink-900/10 ${tool.bgColor} p-5 transition-shadow hover:shadow-md`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.iconBg}`}>
                    <tool.icon size={22} className="text-ink-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink-900">{tool.title}</h3>
                    <p className="mt-0.5 text-sm text-ink-500 line-clamp-2">{tool.desc}</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-ink-300" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCardClick(tool)}
                  className={`flex w-full items-center gap-5 rounded-2xl border border-ink-900/10 ${tool.bgColor} p-5 text-left transition-shadow hover:shadow-md`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.iconBg}`}>
                    <tool.icon size={22} className="text-ink-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink-900">{tool.title}</h3>
                    <p className="mt-0.5 text-sm text-ink-500 line-clamp-2">{tool.desc}</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-ink-300" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* 衣橱缺口结果 */}
        {gapsLoading && (
          <div className="mt-6 rounded-2xl border border-ink-900/10 bg-white p-6 text-center text-sm text-ink-500">
            AI 正在分析你的衣橱…
          </div>
        )}
        {gapsError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {gapsError}
            <button
              type="button"
              onClick={handleGapsAnalysis}
              className="ml-3 underline"
            >
              重试
            </button>
          </div>
        )}
        {gapsResult && (
          <div className="mt-6 rounded-2xl border border-ink-900/10 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink-900">衣橱缺口报告</h3>
                <p className="mt-0.5 text-xs text-ink-400">
                  {gapsResult.personalized ? 'AI 结合你的风格档案与季节分析' : '基础规则分析（AI 暂不可用）'}
                </p>
              </div>
              {gapsResult.gaps.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAllGaps}
                  disabled={addingGap !== null}
                  className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-medium text-creme-100 hover:bg-ink-700 disabled:opacity-60"
                >
                  <Plus size={13} />
                  全部加入购物清单
                </button>
              )}
            </div>

            {gapsResult.summary && (
              <p className="mb-4 rounded-xl bg-creme-100 px-4 py-3 text-sm text-ink-700">
                💡 {gapsResult.summary}
              </p>
            )}

            {gapsResult.gaps.length === 0 ? (
              <p className="text-sm text-ink-500">衣橱品类均衡，没有明显缺口 👏</p>
            ) : (
              <div className="space-y-3">
                {gapsResult.gaps.map((gap) => (
                  <div key={gap.category} className="rounded-xl border border-ink-900/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            gap.priority === 1
                              ? 'bg-red-50 text-red-600'
                              : gap.priority === 2
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {PRIORITY_LABELS[gap.priority] ?? '其次'}
                        </span>
                        <span className="text-sm font-semibold text-ink-900">
                          {GAP_CATEGORY_LABELS[gap.category] || gap.category}
                        </span>
                        <span className="text-xs text-ink-400">
                          {gap.current} / {gap.recommended} 件
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddGapToShoppingList(gap.category, gap.priority)}
                        disabled={addingGap !== null}
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          addedGaps.has(gap.category)
                            ? 'bg-green-100 text-green-700'
                            : 'border border-ink-900/15 text-ink-600 hover:border-ink-900/40'
                        }`}
                      >
                        {addedGaps.has(gap.category) ? (
                          <><Check size={12} />已加入</>
                        ) : (
                          <><Plus size={12} />加入清单</>
                        )}
                      </button>
                    </div>
                    {gap.reason && <p className="mt-2 text-xs leading-5 text-ink-500">{gap.reason}</p>}
                    {gap.suggestion && (gap.suggestion.subCategory || gap.suggestion.color || gap.suggestion.budgetRange) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-ink-400">建议：</span>
                        {gap.suggestion.subCategory && (
                          <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] text-ink-700">
                            {gap.suggestion.color} {gap.suggestion.subCategory}
                          </span>
                        )}
                        {gap.suggestion.styleTags?.map((t) => (
                          <span key={t} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                            {t}
                          </span>
                        ))}
                        {gap.suggestion.budgetRange && (
                          <span className="text-[11px] text-ink-400">{gap.suggestion.budgetRange}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setGapsResult(null)}
              className="mt-4 text-sm text-ink-400 hover:text-ink-600"
            >
              收起
            </button>
          </div>
        )}
      </section>

      {/* Dialogs */}
      <TodayOutfitDialog open={todayOutfitOpen} onClose={() => setTodayOutfitOpen(false)} />
      <PurchaseEvaluationDialog open={purchaseEvalOpen} onClose={() => setPurchaseEvalOpen(false)} />
      <ShoppingListDialog open={shoppingListOpen} onClose={() => setShoppingListOpen(false)} />
    </main>
  );
}
