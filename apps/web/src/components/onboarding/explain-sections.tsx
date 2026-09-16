'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type {
  BodyExplain,
  AvoidanceAdvice,
  MultiDimensionScore,
  StyleMatchResult,
} from '@/lib/onboarding-types';
import {
  type ToneMode,
  BODY_EXPLAIN_TONE,
  AVOIDANCE_TONE,
  SCORE_TONE,
  getRoastWarning,
  getRoastAlternative,
} from '@/lib/tone-mode';

// ============================================================
// 身形适配分析 —— 合并身材说明 + 穿搭基因
// ============================================================

export function BodyFitCard({ explain, score, tone = 'nice' }: { explain: BodyExplain; score: MultiDimensionScore; tone?: ToneMode }) {
  const t = BODY_EXPLAIN_TONE[tone];
  return (
    <section id="body-fit" className="scroll-mt-24">
      <div className="p-5 bg-white rounded-2xl border border-creme-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🪞</span>
          <h2 className="text-base font-display text-ink-900">{t.title}</h2>
        </div>

        {/* 特征描述 */}
        <p className="text-sm text-ink-600 leading-relaxed mb-4 font-light">
          {explain.featureDesc}。
        </p>

        {/* 左：身材优势/版型/配色/气质 2×2 网格 | 右：三维度进度条 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* 左侧 2×2 网格 */}
          <div className="grid grid-cols-2 gap-3">
            <MiniBlock icon="✦" label="你的身材优势" color="text-green-600">
              <ul className="space-y-1">
                {explain.advantages.map((a, i) => (
                  <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-ink-400 mt-1.5 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </MiniBlock>
            <MiniBlock icon="✂️" label="版型建议">
              <p className="text-xs text-ink-600 leading-relaxed">{explain.silhouetteAdvice}</p>
            </MiniBlock>
            <MiniBlock icon="🎨" label="配色建议">
              <p className="text-xs text-ink-600 leading-relaxed">{explain.colorAdvice}</p>
            </MiniBlock>
            <MiniBlock icon="💫" label="气质定位">
              <p className="text-xs text-ink-600 leading-relaxed">{explain.auraDescription}</p>
            </MiniBlock>
          </div>

          {/* 右侧三维度进度条 */}
          <div className="space-y-4">
            <DimBar label="色彩适配度" value={score.colorScore} />
            <DimBar label="廓形适配度" value={score.silhouetteScore} />
            <DimBar label="场景适配度" value={score.sceneScore} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniBlock({ icon, label, color, children }: { icon: string; label: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="p-3 bg-creme-100/70 rounded-xl border border-creme-200">
      <p className={cn("text-xs font-semibold text-ink-500 mb-1.5 flex items-center gap-1", color)}>
        <span>{icon}</span> {label}
      </p>
      {children}
    </div>
  );
}

function DimBar({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 75 ? 'bg-green-400' : value >= 50 ? 'bg-yellow-400' : 'bg-ink-300';
  const tag = value >= 75 ? '优秀' : value >= 50 ? '良好' : '待提升';
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-ink-500">{label}</span>
        <span className={cn(
          'text-xs font-medium',
          value >= 75 ? 'text-green-600' : value >= 50 ? 'text-yellow-600' : 'text-ink-400'
        )}>{value}<span className="text-ink-300 font-normal">分</span> · {tag}</span>
      </div>
      <div className="h-1.5 rounded-full bg-creme-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', tone)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// 避雷专区 —— 横向三列小卡片
// ============================================================

const CATEGORY_ICON: Record<AvoidanceAdvice['category'], string> = {
  silhouette: '✂️',
  item: '👕',
  color: '🎨',
  budget: '💰',
  general: '⚠️',
};

export function AvoidanceZone({ advice, tone = 'nice' }: { advice: AvoidanceAdvice[]; tone?: ToneMode }) {
  if (advice.length === 0) return null;
  const t = AVOIDANCE_TONE[tone];

  return (
    <section id="avoidance" className="scroll-mt-24">
      <div className="p-5 bg-creme-200/60 rounded-2xl border border-creme-300">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🚫</span>
          <h2 className="text-base font-display text-ink-900">{t.title}</h2>
          <span className="text-xs text-ink-400 ml-1">{t.subtitle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {advice.map((a, i) => {
            const warning = tone === 'roast' ? getRoastWarning(a.warning) : a.warning;
            const alternative = tone === 'roast' ? getRoastAlternative(a.alternatives) : a.alternatives.join(' / ');
            return (
              <div key={i} className="p-3 bg-white/80 rounded-xl border border-creme-200 flex flex-col">
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-sm shrink-0 mt-0.5">{CATEGORY_ICON[a.category]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 leading-snug">
                      {warning}
                    </p>
                    <p className="text-[11px] text-ink-400 mt-0.5 leading-relaxed">{a.reason}</p>
                  </div>
                </div>
                <div className="mt-auto pt-2 border-t border-creme-200">
                  <p className="text-[11px] text-ink-600">
                    <span className={tone === 'roast' ? 'text-ink-600' : 'text-green-600 font-medium'}>
                      {t.alternativePrefix}
                    </span>
                    {' '}{alternative}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 风格适配榜单 —— 合并次级可尝试 + 慎选风格
// ============================================================

export function StyleRanking({ score, tone = 'nice' }: { score: MultiDimensionScore; tone?: ToneMode }) {
  // 只展示高分次级风格（≥70 分）：避免推荐一堆低分风格让用户觉得"AI 乱推"
  // 同时去掉"谨慎选择"列 — 负向引导 + 占面积，成本 > 收益
  const secondary = score.secondaryStyles
    .filter((s) => s.score >= 70)
    .slice(0, 3);
  if (secondary.length === 0) return null;

  return (
    <section id="style-rank" className="scroll-mt-24">
      <div className="p-5 bg-white rounded-2xl border border-creme-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">✨</span>
          <h2 className="text-base font-display text-ink-900">还有这些风格值得探索</h2>
        </div>

        <div className="space-y-2">
          {secondary.map((s) => (
            <StyleRankItem key={s.styleId} style={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StyleRankItem({ style }: { style: StyleMatchResult }) {
  return (
    <Link
      href={`/styles/${style.styleId}`}
      className="group flex items-center justify-between gap-3 rounded-xl border border-creme-200 bg-creme-50 p-3 transition-all hover:border-ink-300 hover:shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium text-ink-800 transition-colors group-hover:text-ink-900">
            {style.styleName}
          </h4>
          <span className="shrink-0 text-xs font-semibold text-ink-700">
            {style.score}<span className="font-normal text-ink-300">分</span>
          </span>
        </div>
        <p className="mt-1 truncate text-[11px] text-ink-400 leading-relaxed">
          {style.matchReasons.slice(0, 1).join('；')}
        </p>
      </div>
      <span className="shrink-0 text-xs font-medium text-ink-400 transition-colors group-hover:text-ink-600">
        查看完整档案 →
      </span>
    </Link>
  );
}

// ============================================================
// 旧版组件保留导出（兼容引用）
// ============================================================

/** @deprecated 使用 BodyFitCard 替代 */
export const BodyExplainCard = BodyFitCard;

/** @deprecated 使用 StyleRanking 替代 */
export const MultiDimensionPanel = StyleRanking;