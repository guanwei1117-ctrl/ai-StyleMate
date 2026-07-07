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
// 体型解读卡片
// ============================================================

export function BodyExplainCard({ explain, tone = 'nice' }: { explain: BodyExplain; tone?: ToneMode }) {
  const t = BODY_EXPLAIN_TONE[tone];
  return (
    <div className="p-6 bg-white rounded-2xl border border-creme-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{tone === 'nice' ? '🪞' : '🔍'}</span>
        <h2 className="text-lg font-display text-ink-900">{t.title}</h2>
      </div>

      {/* 特征描述 */}
      <p className="text-sm text-ink-700 leading-relaxed mb-4 font-light">
        {explain.featureDesc}。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 优势 */}
        <div>
          <p className="text-xs font-semibold text-ink-500 mb-2 flex items-center gap-1">
            <span className="text-green-600">✦</span> 你的身材优势
          </p>
          <ul className="space-y-1.5">
            {explain.advantages.map((a, i) => (
              <li key={i} className="text-sm text-ink-700 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-ink-400 mt-2 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* 版型建议 */}
        <div>
          <p className="text-xs font-semibold text-ink-500 mb-2 flex items-center gap-1">
            <span>✂️</span> 版型建议
          </p>
          <p className="text-sm text-ink-700 leading-relaxed font-light">
            {explain.silhouetteAdvice}
          </p>
        </div>
      </div>

      {/* 配色 + 气质 */}
      <div className="mt-4 pt-4 border-t border-creme-200 space-y-2">
        <p className="text-sm text-ink-700">
          <span className="text-xs font-semibold text-ink-500 mr-2">🎨 配色</span>
          {explain.colorAdvice}
        </p>
        <p className="text-sm text-ink-700">
          <span className="text-xs font-semibold text-ink-500 mr-2">💫 气质</span>
          {explain.auraDescription}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 避雷专区
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
    <div className="p-6 bg-creme-200/60 rounded-2xl border border-creme-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{tone === 'nice' ? '🚫' : '💣'}</span>
        <h2 className="text-lg font-display text-ink-900">{t.title}</h2>
        <span className="text-xs text-ink-400 ml-1">{t.subtitle}</span>
      </div>

      <div className="space-y-3">
        {advice.map((a, i) => {
          const warning = tone === 'roast' ? getRoastWarning(a.warning) : a.warning;
          const alternative = tone === 'roast' ? getRoastAlternative(a.alternatives) : a.alternatives.join(' / ');
          return (
          <div key={i} className="p-3 bg-white/70 rounded-xl">
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-sm shrink-0">{CATEGORY_ICON[a.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-800">
                  <span className={tone === 'roast' ? 'text-ink-500' : 'text-red-500'}>{t.warningPrefix}</span>
                  {' '}{warning}
                </p>
                <p className="text-xs text-ink-500 mt-0.5">{a.reason}</p>
              </div>
            </div>
            <p className="text-xs text-ink-600 pl-6">
              <span className={tone === 'roast' ? 'text-ink-600' : 'text-green-600'}>{t.alternativePrefix}</span>
              {' '}{alternative}
            </p>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 多维评分面板
// ============================================================

export function MultiDimensionPanel({ score, tone = 'nice' }: { score: MultiDimensionScore; tone?: ToneMode }) {
  const t = SCORE_TONE[tone];
  return (
    <div className="p-6 bg-white rounded-2xl border border-creme-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{tone === 'nice' ? '📊' : '🤖'}</span>
        <h2 className="text-lg font-display text-ink-900">{t.title}</h2>
      </div>

      {/* 三维度适配度 */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <DimBar label="色彩适配度" value={score.colorScore} />
        <DimBar label="廓形适配度" value={score.silhouetteScore} />
        <DimBar label="场景适配度" value={score.sceneScore} />
      </div>

      {/* 最佳版型 / 配色 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="p-3 bg-creme-100 rounded-xl">
          <p className="text-xs font-semibold text-ink-500 mb-2">✂️ 最佳版型</p>
          <div className="flex flex-wrap gap-1.5">
            {score.bestSilhouettes.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-white text-ink-700 text-xs rounded-full border border-creme-200">
                {s}
              </span>
            ))}
            {score.bestSilhouettes.length === 0 && (
              <span className="text-xs text-ink-400">暂无</span>
            )}
          </div>
        </div>
        <div className="p-3 bg-creme-100 rounded-xl">
          <p className="text-xs font-semibold text-ink-500 mb-2">🎨 最佳配色</p>
          <div className="flex flex-wrap gap-1.5">
            {score.bestColors.map((c) => (
              <span key={c} className="px-2 py-0.5 bg-white text-ink-700 text-xs rounded-full border border-creme-200">
                {c}
              </span>
            ))}
            {score.bestColors.length === 0 && (
              <span className="text-xs text-ink-400">暂无</span>
            )}
          </div>
        </div>
      </div>

      {/* 风格分层 */}
      <div className="space-y-3">
        <StyleGroup
          title="核心风格"
          icon="⭐"
          styles={score.coreStyles}
          tone="core"
        />
        <StyleGroup
          title="次级可尝试"
          icon="✨"
          styles={score.secondaryStyles}
          tone="secondary"
        />
        {score.cautionStyles.length > 0 && (
          <StyleGroup
            title="慎选风格"
            icon="⚠️"
            styles={score.cautionStyles}
            tone="caution"
          />
        )}
      </div>

      {/* 风险提示 */}
      {score.riskFlags.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-xs font-semibold text-orange-700 mb-1.5">⚡ 风险提示</p>
          <ul className="space-y-1">
            {score.riskFlags.map((f, i) => (
              <li key={i} className="text-xs text-orange-800 flex items-start gap-1.5">
                <span className="mt-0.5">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 子组件
// ============================================================

function DimBar({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 75 ? 'bg-green-400' : value >= 50 ? 'bg-yellow-400' : 'bg-ink-300';
  const tag = value >= 75 ? '优秀' : value >= 50 ? '良好' : '待提升';
  return (
    <div className="text-center">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-ink-500">{label}</span>
        <span className="text-ink-400">{tag}</span>
      </div>
      <div className="text-xl font-display text-ink-900 mb-1">{value}</div>
      <div className="h-1.5 rounded-full bg-creme-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', tone)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function StyleGroup({
  title,
  icon,
  styles,
  tone,
}: {
  title: string;
  icon: string;
  styles: StyleMatchResult[];
  tone: 'core' | 'secondary' | 'caution';
}) {
  if (styles.length === 0) return null;
  const labelColor =
    tone === 'core'
      ? 'text-ink-800'
      : tone === 'secondary'
        ? 'text-ink-600'
        : 'text-ink-400';

  return (
    <div>
      <p className={cn('text-xs font-semibold mb-2 flex items-center gap-1', labelColor)}>
        <span>{icon}</span> {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {styles.map((s) => (
          <Link
            key={s.styleId}
            href={`/styles/${s.styleId}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all hover:shadow-md',
              tone === 'core'
                ? 'bg-ink-900 text-creme-100 hover:bg-ink-800'
                : tone === 'secondary'
                  ? 'bg-creme-200 text-ink-700 hover:bg-creme-300'
                  : 'bg-creme-100 text-ink-400 hover:bg-creme-200',
            )}
          >
            <span>{s.styleName}</span>
            <span className="opacity-60">{s.score}分</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
