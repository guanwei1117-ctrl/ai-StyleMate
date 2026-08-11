'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  ShoppingBag,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TodayOutfitDialog from '@/components/wardrobe/today-outfit-dialog';
import PurchaseEvaluationDialog from '@/components/wardrobe/purchase-evaluation-dialog';
import { analyzeWardrobeGaps } from '@/lib/wardrobe-api';
import { getCurrentUserId } from '@/lib/auth';

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
    desc: '检查你的衣橱品类是否均衡，发现缺失的关键单品',
    icon: BarChart3,
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-900/10',
    action: 'gaps',
  },
];

const GAP_CATEGORY_LABELS: Record<string, string> = {
  top: '上装', bottom: '下装', outerwear: '外套',
  dress: '连衣裙', shoes: '鞋子', accessory: '配饰',
};

export default function TryPage() {
  const [todayOutfitOpen, setTodayOutfitOpen] = useState(false);
  const [purchaseEvalOpen, setPurchaseEvalOpen] = useState(false);
  const [gapsResult, setGapsResult] = useState<{
    gaps: Array<{ category: string; current: number; recommended: number; missing: number }>;
    totalItems: number;
  } | null>(null);
  const [gapsLoading, setGapsLoading] = useState(false);
  const [gapsError, setGapsError] = useState<string | null>(null);

  const handleGapsAnalysis = async () => {
    setGapsLoading(true);
    setGapsError(null);
    try {
      const result = await analyzeWardrobeGaps(getCurrentUserId());
      setGapsResult(result);
    } catch (err) {
      setGapsError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setGapsLoading(false);
    }
  };

  const handleCardClick = (tool: typeof TOOLS[number]) => {
    if (tool.dialog === 'today-outfit') setTodayOutfitOpen(true);
    else if (tool.dialog === 'purchase-eval') setPurchaseEvalOpen(true);
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-900">衣橱缺口报告</h3>
              <span className="text-sm text-ink-400">共 {gapsResult.totalItems} 件</span>
            </div>
            {gapsResult.gaps.length === 0 ? (
              <p className="text-sm text-ink-500">衣橱品类均衡，没有明显缺口 👏</p>
            ) : (
              <div className="space-y-3">
                {gapsResult.gaps.map((gap) => (
                  <div key={gap.category} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-ink-600">{GAP_CATEGORY_LABELS[gap.category] || gap.category}</span>
                    <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${gap.recommended > 0 ? Math.min(100, (gap.current / gap.recommended) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-400 w-20 text-right">
                      {gap.current} / {gap.recommended} 件
                    </span>
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
    </main>
  );
}
