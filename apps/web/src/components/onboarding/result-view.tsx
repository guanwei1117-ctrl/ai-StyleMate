'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from '@/data/styles';
import type { StyleMatchResult } from '@/lib/onboarding-types';
import type { OnboardingAnswers } from '@/lib/onboarding-types';
import type { BodyShape } from '@/lib/onboarding-types';
import { generateExplanation } from '@/lib/style-explain';
import type { AiStyleProfileAnalysis } from '@/lib/style-profile-api';
import { BodyFitCard, AvoidanceZone, StyleRanking } from './explain-sections';

interface ResultViewProps {
  results: StyleMatchResult[];
  answers: OnboardingAnswers;
  bodyShape: BodyShape;
  aiAnalysis: AiStyleProfileAnalysis | null;
  analysisError: string | null;
  onRestart: () => void;
}

export default function ResultView({ results, answers, bodyShape, aiAnalysis, analysisError, onRestart }: ResultViewProps) {
  const top1 = results[0];
  const explanation = generateExplanation(results, answers, bodyShape);
  const [showAiDetail, setShowAiDetail] = useState(false);

  // 锚点导航
  const anchors = [
    { id: 'body-fit', label: '身形分析' },
    { id: 'avoidance', label: '避雷建议' },
    { id: 'style-rank', label: '风格榜单' },
  ];

  return (
    <div className="w-full">
      {/* ===== 顶部标题区：横向横排，高度大幅压缩 ===== */}
      <div className="flex items-center justify-between gap-6 pb-4 mb-6 border-b border-ink-900/10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-[10px] tracking-[0.28em] text-ink-400 shrink-0">STYLE PROFILE REPORT</p>
            {/* 已保存档案标签 —— 和标题行合并 */}
            <span className="inline-flex items-center gap-1 text-[10px] text-ink-400 bg-creme-200/70 px-2 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              已保存
            </span>
          </div>
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-ink-900 text-balance">
            你的风格档案已生成
          </h1>
          <p className="mt-0.5 text-xs text-ink-400">
            先看核心结论，再看为什么适合、怎么穿、哪些地方需要调整。
          </p>
          {/* AI 状态 —— 折叠成一行小字 */}
          <div className="mt-1.5">
            <button
              onClick={() => setShowAiDetail(!showAiDetail)}
              className="text-[11px] text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
            >
              <span className={cn(
                'inline-block w-1.5 h-1.5 rounded-full',
                aiAnalysis ? 'bg-green-400' : 'bg-ink-300'
              )} />
              {aiAnalysis ? 'AI 深度分析已完成' : '本地规则回落报告'}
              <svg className={cn('w-3 h-3 transition-transform', showAiDetail && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAiDetail && (
              <div className="mt-2 p-3 bg-creme-100/80 rounded-xl border border-creme-200 text-xs text-ink-500 leading-relaxed space-y-2">
                {aiAnalysis ? (
                  <>
                    <p>已调用 {aiAnalysis.providerModel}，结合照片、自述和风格库候选完成综合判断。</p>
                    <p className="text-ink-600">{aiAnalysis.summary}</p>
                    {analysisError && (
                      <p className="text-amber-700">AI 调用未全部成功：{analysisError}</p>
                    )}
                  </>
                ) : (
                  <p>
                    {analysisError
                      ? '未完成 AI 深度视觉/语言分析，已使用本地规则生成报告，可稍后配置 AI 后重新测评。'
                      : '当前结果来自基础画像、自述关键词和风格库规则的混合匹配。'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 12列栅格主体 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===== 左栏：col-span-8 ===== */}
        <div className="lg:col-span-8 space-y-5">
          {/* 身形适配分析 */}
          <BodyFitCard explain={explanation.bodyExplain} score={explanation.multiDimension} tone="nice" />

          {/* 避雷专区 */}
          <AvoidanceZone advice={explanation.avoidanceAdvice} tone="nice" />

          {/* 风格适配榜单 */}
          <StyleRanking score={explanation.multiDimension} tone="nice" />

          {/* 更多风格探索 */}
          {results.length > 1 && (
            <section className="scroll-mt-24">
              <div className="p-5 bg-white rounded-2xl border border-creme-200 shadow-card">
                <h2 className="text-base font-display text-ink-900 mb-3 flex items-center gap-2">
                  <span>🎯</span> 更多风格探索
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.slice(1).map((r) => (
                    <Link
                      key={r.styleId}
                      href={`/styles/${r.styleId}`}
                      className="block p-3 bg-creme-50 rounded-xl border border-creme-200 transition-all hover:border-ink-300 hover:shadow-sm group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 bg-creme-200 text-ink-500 text-[10px] rounded-full mb-1">
                            {CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] || r.category}
                          </span>
                          <h4 className="text-sm font-medium text-ink-800 group-hover:text-ink-900 transition-colors truncate">
                            {r.styleName}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold text-ink-600 shrink-0 ml-2">
                          {r.score}<span className="font-normal text-ink-300">分</span>
                        </span>
                      </div>
                      <div className="flex gap-1.5 mb-1.5">
                        <PillarDot label="审美" value={r.pillars.aesthetic} max={50} />
                        <PillarDot label="现实" value={r.pillars.realistic} max={30} />
                        <PillarDot label="偏好" value={r.pillars.behavioral} max={20} />
                      </div>
                      <p className="text-[11px] text-ink-400 line-clamp-1 leading-relaxed">
                        {r.matchReasons.slice(0, 1).join('；')}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ===== 右栏：col-span-4 固定悬浮 ===== */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-28 space-y-4">
            {/* 核心风格总览 —— 放大黑色卡片 */}
            {top1 && (
              <div className="p-5 bg-ink-900 rounded-2xl text-creme-100">
                <p className="text-[10px] tracking-[0.24em] text-creme-400 mb-3">CORE STYLE</p>
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 bg-creme-100/15 text-creme-200 text-[10px] rounded-full mb-1.5">
                      {CATEGORY_LABELS[top1.category as keyof typeof CATEGORY_LABELS] || top1.category}
                    </span>
                    <h3 className="font-display text-2xl leading-tight">{top1.styleName}</h3>
                  </div>
                  <ScoreBadge score={top1.score} size="lg" />
                </div>

                {/* 三支柱 */}
                <div className="space-y-2.5 mb-4">
                  <SidePillarBar label="审美适配" value={top1.pillars.aesthetic} max={50} />
                  <SidePillarBar label="现实约束" value={top1.pillars.realistic} max={30} />
                  <SidePillarBar label="行为偏好" value={top1.pillars.behavioral} max={20} />
                </div>

                {/* 维度拆解（默认折叠） */}
                <details className="group mb-4">
                  <summary className="text-[11px] text-creme-400 cursor-pointer hover:text-creme-200 transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    查看完整维度
                  </summary>
                  <div className="mt-2 space-y-2 pt-2 border-t border-creme-100/15">
                    <div className="space-y-1">
                      <p className="text-[10px] text-creme-400">审美适配</p>
                      <MiniSideBar label="体型" value={top1.matchBreakdown.bodyShape} max={20} />
                      <MiniSideBar label="偏好" value={top1.matchBreakdown.preference} max={25} />
                      <MiniSideBar label="肤色" value={top1.matchBreakdown.skinTone} max={5} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-creme-400">现实约束</p>
                      <MiniSideBar label="预算" value={top1.matchBreakdown.budget} max={12} />
                      <MiniSideBar label="年龄" value={top1.matchBreakdown.ageFit} max={8} />
                      <MiniSideBar label="场景" value={top1.matchBreakdown.scene} max={10} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-creme-400">行为偏好</p>
                      <MiniSideBar label="优先级" value={top1.matchBreakdown.priority} max={10} />
                      <MiniSideBar label="目标" value={top1.matchBreakdown.goal} max={5} />
                      <MiniSideBar label="接受度" value={top1.matchBreakdown.openness} max={5} />
                    </div>
                  </div>
                </details>

                <Link
                  href={`/styles/${top1.styleId}`}
                  className="block text-center text-xs text-creme-400 hover:text-creme-200 transition-colors py-2 border-t border-creme-100/15 mb-4"
                >
                  查看完整风格档案 →
                </Link>

                {/* 锚点导航 */}
                <nav className="space-y-1 mb-4">
                  <p className="text-[10px] tracking-[0.2em] text-creme-400">快速导航</p>
                  {anchors.map((a) => (
                    <a
                      key={a.id}
                      href={`#${a.id}`}
                      className="block text-xs text-creme-300 hover:text-creme-100 transition-colors py-1.5 px-2 rounded-lg hover:bg-creme-100/10"
                    >
                      {a.label}
                    </a>
                  ))}
                </nav>

                {/* 固定操作按钮 */}
                <div className="space-y-2 pt-3 border-t border-creme-100/15">
                  <Link href="/wardrobe" className="block">
                    <Button variant="default" size="sm" className="w-full text-xs">
                      去衣柜搭一套看看 →
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-creme-300 hover:text-creme-100 hover:bg-creme-100/10" onClick={onRestart}>
                    重新测试
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ===== 移动端底部操作区（lg 隐藏） ===== */}
      <div className="lg:hidden flex flex-col sm:flex-row gap-3 justify-center pt-6 mt-6 border-t border-ink-900/10">
        <Link href="/wardrobe">
          <Button variant="default" size="lg">
            去衣柜搭一套看看 →
          </Button>
        </Link>
        <Link href="/styles">
          <Button variant="outline" size="lg">
            浏览全部风格百科
          </Button>
        </Link>
        <Button variant="ghost" size="lg" onClick={onRestart}>
          重新测试
        </Button>
      </div>
    </div>
  );
}

/* ============ 子组件 ============ */

function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-lg h-14 w-14' : size === 'sm' ? 'text-xs h-10 w-10' : 'text-sm h-12 w-12';
  return (
    <div className={cn(
      'inline-flex flex-col items-center justify-center rounded-full font-semibold shrink-0',
      'bg-creme-100 text-ink-900',
      sizeClass,
    )}>
      <span>{score}</span>
      {size === 'lg' && <span className="text-[8px] leading-none text-ink-400">分</span>}
    </div>
  );
}

/** 侧边栏三支柱条 */
function SidePillarBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-creme-300">{label}</span>
        <span className="text-creme-200">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-creme-100/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-creme-200 to-creme-100 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** 侧边栏细分条 */
function MiniSideBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-creme-300">{label}</span>
        <span className="text-creme-200">{value}/{max}</span>
      </div>
      <div className="h-1 rounded-full bg-creme-100/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-creme-200 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** 三支柱小点 — 用于更多推荐卡片 */
function PillarDot({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const tone = pct >= 75 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-ink-300';
  return (
    <div className="flex-1">
      <div className="flex justify-between text-[9px] text-ink-400 mb-0.5">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-creme-200 overflow-hidden">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}