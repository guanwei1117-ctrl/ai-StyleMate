'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BODY_SHAPE_LABELS,
  AGE_GROUP_LABELS,
  OCCUPATION_LABELS,
  CLIMATE_LABELS,
  DRESSING_GOAL_LABELS,
  PRIORITY_LABELS,
} from '@/lib/onboarding-types';
import { CATEGORY_LABELS } from '@/data/styles';
import type { StyleMatchResult } from '@/lib/onboarding-types';
import type { OnboardingAnswers } from '@/lib/onboarding-types';
import type { BodyShape } from '@/lib/onboarding-types';
import { generateExplanation } from '@/lib/style-explain';
import { BodyExplainCard } from './explain-sections';
import { AvoidanceZone } from './explain-sections';
import { MultiDimensionPanel } from './explain-sections';

interface ResultViewProps {
  results: StyleMatchResult[];
  answers: OnboardingAnswers;
  bodyShape: BodyShape;
  onRestart: () => void;
}

export default function ResultView({ results, answers, bodyShape, onRestart }: ResultViewProps) {
  const top1 = results[0];
  const explanation = generateExplanation(results, answers, bodyShape);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10">
      {/* ============ 顶部摘要 ============ */}
      <div className="text-center space-y-3">
        <p className="text-xs tracking-[0.2em] text-ink-400 uppercase">你的风格画像</p>
        <h1 className="text-display font-display text-ink-900">
          你的穿搭风格分析
        </h1>
        <p className="text-ink-500 font-light max-w-lg mx-auto leading-relaxed">
          综合「审美适配 + 现实约束 + 行为偏好」三维度，为你推荐最适合且真正会穿的风格
        </p>
      </div>

      {/* ============ 用户画像卡片（三支柱）============ */}
      <div className="p-6 bg-creme-200/60 rounded-2xl border border-creme-200">
        <h3 className="text-sm tracking-wider text-ink-400 mb-4">你的画像</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 审美适配 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-500 border-b border-creme-300 pb-1">
              审美适配
            </p>
            {answers.gender && (
              <ProfileItem
                label="性别"
                value={answers.gender === 'female' ? '女性' : answers.gender === 'male' ? '男性' : '其他'}
              />
            )}
            <ProfileItem label="身高/体重" value={`${answers.height ?? '-'}cm / ${answers.weight ?? '-'}kg`} />
            <ProfileItem label="体型" value={BODY_SHAPE_LABELS[bodyShape]} />
            {answers.preferredStyleIds.length > 0 && (
              <ProfileItem label="偏好风格" value={`${answers.preferredStyleIds.length} 种`} />
            )}
          </div>

          {/* 现实约束 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-500 border-b border-creme-300 pb-1">
              现实约束
            </p>
            {answers.ageGroup && (
              <ProfileItem label="年龄段" value={AGE_GROUP_LABELS[answers.ageGroup]} />
            )}
            {answers.occupation && (
              <ProfileItem label="职业" value={OCCUPATION_LABELS[answers.occupation]} />
            )}
            {(answers.city || answers.climate) && (
              <ProfileItem
                label="城市/气候"
                value={[answers.city, answers.climate ? CLIMATE_LABELS[answers.climate] : ''].filter(Boolean).join(' · ') || '-'}
              />
            )}
            {answers.budget && (
              <ProfileItem
                label="单件预算"
                value={
                  answers.budget === 'budget' ? '平价实惠' :
                  answers.budget === 'mid' ? '中等价位' : '轻奢品质'
                }
              />
            )}
            {answers.monthlyBudgetMax && (
              <ProfileItem
                label="月度预算"
                value={`¥${answers.monthlyBudgetMin ?? 0}-${answers.monthlyBudgetMax}`}
              />
            )}
          </div>

          {/* 行为偏好 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-500 border-b border-creme-300 pb-1">
              行为偏好
            </p>
            {answers.dressingGoals.length > 0 && (
              <ProfileItem
                label="穿衣目标"
                value={answers.dressingGoals.map((g) => DRESSING_GOAL_LABELS[g]).join('、')}
              />
            )}
            {answers.priorities.length > 0 && (
              <ProfileItem
                label="优先级"
                value={answers.priorities.map((p) => PRIORITY_LABELS[p]).join('＞')}
              />
            )}
            {answers.styleOpenness && (
              <ProfileItem label="风格接受度" value={`${answers.styleOpenness}/5`} />
            )}
            {answers.openToNewStyles !== null && answers.openToNewStyles !== undefined && (
              <ProfileItem
                label="尝试新风格"
                value={answers.openToNewStyles ? '愿意' : '暂不考虑'}
              />
            )}
            {answers.interests.length > 0 && (
              <ProfileItem label="兴趣" value={`${answers.interests.length} 项`} />
            )}
          </div>
        </div>
      </div>

      {/* ============ 体型解读（NEW）============ */}
      <BodyExplainCard explain={explanation.bodyExplain} />

      {/* ============ 多维评分（NEW）============ */}
      <MultiDimensionPanel score={explanation.multiDimension} />

      {/* ============ 避雷专区（NEW）============ */}
      <AvoidanceZone advice={explanation.avoidanceAdvice} />

      {/* ============ 最佳匹配 ============ */}
      <div>
        <h2 className="text-lg font-display text-ink-900 mb-4">🏆 最佳匹配</h2>

        {top1 && (
          <Link
            href={`/styles/${top1.styleId}`}
            className="block p-6 sm:p-8 bg-ink-900 text-creme-100 rounded-2xl hover:bg-ink-800 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2.5 py-1 bg-creme-100/15 text-creme-200 text-xs rounded-full mb-2">
                  {CATEGORY_LABELS[top1.category as keyof typeof CATEGORY_LABELS] || top1.category}
                </span>
                <h3 className="text-2xl font-display">{top1.styleName}</h3>
              </div>
              <div className="text-right">
                <ScoreBadge score={top1.score} size="lg" />
              </div>
            </div>

            {/* 三支柱汇总 */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <PillarBar label="审美适配" value={top1.pillars.aesthetic} max={50} />
              <PillarBar label="现实约束" value={top1.pillars.realistic} max={30} />
              <PillarBar label="行为偏好" value={top1.pillars.behavioral} max={20} />
            </div>

            {/* 得分拆解 — 三组 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* 审美适配 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-creme-400 mb-1">审美适配</p>
                <MiniBar label="体型" value={top1.matchBreakdown.bodyShape} max={20} />
                <MiniBar label="偏好" value={top1.matchBreakdown.preference} max={25} />
                <MiniBar label="肤色" value={top1.matchBreakdown.skinTone} max={5} />
              </div>
              {/* 现实约束 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-creme-400 mb-1">现实约束</p>
                <MiniBar label="预算" value={top1.matchBreakdown.budget} max={12} />
                <MiniBar label="年龄" value={top1.matchBreakdown.ageFit} max={8} />
                <MiniBar label="场景" value={top1.matchBreakdown.scene} max={10} />
              </div>
              {/* 行为偏好 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-creme-400 mb-1">行为偏好</p>
                <MiniBar label="优先级" value={top1.matchBreakdown.priority} max={10} />
                <MiniBar label="目标" value={top1.matchBreakdown.goal} max={5} />
                <MiniBar label="接受度" value={top1.matchBreakdown.openness} max={5} />
              </div>
            </div>

            {/* 推荐理由 */}
            <ul className="space-y-1">
              {top1.matchReasons.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-creme-300 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-creme-300 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-creme-400 group-hover:text-creme-300 transition-colors">
              点击查看风格详情 →
            </p>
          </Link>
        )}
      </div>

      {/* ============ 更多推荐 ============ */}
      {results.length > 1 && (
        <div>
          <h2 className="text-lg font-display text-ink-900 mb-4">✨ 更多推荐</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.slice(1).map((r) => (
              <Link
                key={r.styleId}
                href={`/styles/${r.styleId}`}
                className="block p-5 bg-white rounded-2xl border border-creme-200 hover:border-ink-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-creme-200 text-ink-500 text-[10px] rounded-full mb-1.5">
                      {CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] || r.category}
                    </span>
                    <h4 className="font-semibold text-ink-800 group-hover:text-ink-900 transition-colors">
                      {r.styleName}
                    </h4>
                  </div>
                  <ScoreBadge score={r.score} size="sm" />
                </div>
                {/* 小型三支柱条 */}
                <div className="flex gap-1.5 mb-2">
                  <PillarDot label="审美" value={r.pillars.aesthetic} max={50} />
                  <PillarDot label="现实" value={r.pillars.realistic} max={30} />
                  <PillarDot label="偏好" value={r.pillars.behavioral} max={20} />
                </div>
                <p className="text-xs text-ink-500 line-clamp-2">
                  {r.matchReasons.join('；')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ============ 操作区 ============ */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t border-creme-200">
        <Link href="/wardrobe">
          <Button variant="default" size="lg">
            去衣橱探索穿搭 →
          </Button>
        </Link>
        <Link href="/styles">
          <Button variant="outline" size="lg">
            浏览全部风格库
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

/** 三支柱大条 — 用于最佳匹配 */
function PillarBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="text-center">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-creme-300">{label}</span>
        <span className="text-creme-200">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-creme-100/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-creme-200 to-creme-100 transition-all duration-700"
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

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
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

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="text-ink-800 font-medium text-sm">{value}</p>
    </div>
  );
}
