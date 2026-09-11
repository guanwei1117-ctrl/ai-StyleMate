'use client';

/**
 * M15：穿搭成长雷达图 + 月度总结
 *
 * 设计：
 * - 不依赖外部图表库（避免 200KB+ 依赖）
 * - 用纯 SVG 绘制 5 维雷达图
 * - 算法基于 userStyleProfile + recentFeedbacks（轻量数据，无需后端额外调用）
 *
 * 5 个维度：
 * - color: 颜色搭配（likedColors + dislikedColors 共同反映）
 * - proportion: 版型比例（bodyConcerns + dressGoals 反映）
 * - style: 风格统一（likedStyles + dislikedStyles 反映）
 * - occasion: 场合匹配（commonOccasions 反映）
 * - body: 身材扬避（avoidRules + bodyConcerns 反映）
 *
 * 算法（每维 0-100）：
 * - 基础分 30（任何人都有）
 * - liked 字段每条 +5，上限 30
 * - disliked 字段每条 +3（明确知道不喜欢的也算成长）
 * - avoidRules 每条 +5（说明用户知道避坑）
 * - recentFeedbacks like 每条 +2，dislike 每条 +1
 * - 上限 100
 */

import type { UserStyleProfile, OutfitFeedbackRecord } from '@/lib/memory-api';

const DIMENSIONS = [
  { key: 'color', label: '颜色搭配', emoji: '🎨' },
  { key: 'proportion', label: '版型比例', emoji: '📏' },
  { key: 'style', label: '风格统一', emoji: '🎭' },
  { key: 'occasion', label: '场合匹配', emoji: '📅' },
  { key: 'body', label: '身材扬避', emoji: '💃' },
] as const;

type Dimension = (typeof DIMENSIONS)[number]['key'];

interface GrowthScore {
  color: number;
  proportion: number;
  style: number;
  occasion: number;
  body: number;
}

function calcScore(profile: UserStyleProfile | null, feedbacks: OutfitFeedbackRecord[]): GrowthScore {
  const score: GrowthScore = { color: 30, proportion: 30, style: 30, occasion: 30, body: 30 };

  if (profile) {
    // color: likedColors + dislikedColors
    score.color += Math.min(30, (profile.preferredColors?.length ?? 0) * 5);
    score.color += Math.min(20, (profile.dislikedColors?.length ?? 0) * 3);

    // style: likedStyles + dislikedStyles
    score.style += Math.min(30, (profile.likedStyles?.length ?? 0) * 5);
    score.style += Math.min(20, (profile.dislikedStyles?.length ?? 0) * 3);

    // proportion: dressGoals + bodyConcerns
    score.proportion += Math.min(20, (profile.dressGoals?.length ?? 0) * 4);
    score.proportion += Math.min(15, (profile.bodyConcerns?.length ?? 0) * 3);

    // occasion: commonOccasions
    score.occasion += Math.min(30, (profile.commonOccasions?.length ?? 0) * 6);

    // body: avoidRules
    const avoidCount = (profile.avoidRules ?? []).filter((r) => r.weight > 0).length;
    score.body += Math.min(30, avoidCount * 5);
    score.body += Math.min(15, (profile.bodyConcerns?.length ?? 0) * 3);
  }

  // feedback 累积（最近 30 条反馈）
  const recentFb = feedbacks.slice(0, 30);
  for (const fb of recentFb) {
    if (fb.feedbackType === 'like') {
      // 喜欢反馈平均加分
      score.style += 1;
      score.color += 0.5;
    } else if (fb.feedbackType === 'dislike') {
      // 明确不喜欢也算成长
      score.proportion += 0.5;
      score.body += 0.5;
    } else if (fb.feedbackType === 'worn_today') {
      score.occasion += 1;
    } else if (fb.feedbackType === 'too_formal' || fb.feedbackType === 'occasion_mismatch') {
      score.occasion += 1;
    } else if (fb.feedbackType === 'color_dislike') {
      score.color += 1;
    } else if (fb.feedbackType === 'too_fat' || fb.feedbackType === 'uncomfortable') {
      score.body += 1;
      score.proportion += 0.5;
    }
  }

  return {
    color: Math.min(100, Math.round(score.color)),
    proportion: Math.min(100, Math.round(score.proportion)),
    style: Math.min(100, Math.round(score.style)),
    occasion: Math.min(100, Math.round(score.occasion)),
    body: Math.min(100, Math.round(score.body)),
  };
}

/** 计算总分（5 维平均） */
function totalScore(s: GrowthScore): number {
  return Math.round((s.color + s.proportion + s.style + s.occasion + s.body) / 5);
}

/** 找出最高和最低维度，给出针对性建议 */
function pickGrowthTip(s: GrowthScore): { best: Dimension; weakest: Dimension; tip: string } {
  let best: Dimension = 'color';
  let weakest: Dimension = 'color';
  let bestVal = 0;
  let weakestVal = 100;
  for (const d of DIMENSIONS) {
    if (s[d.key] > bestVal) {
      bestVal = s[d.key];
      best = d.key;
    }
    if (s[d.key] < weakestVal) {
      weakestVal = s[d.key];
      weakest = d.key;
    }
  }
  const tips: Record<Dimension, string> = {
    color: '颜色搭配',
    proportion: '版型比例',
    style: '风格统一',
    occasion: '场合匹配',
    body: '身材扬避',
  };
  return {
    best,
    weakest,
    tip: `${tips[best]}是你目前最强的（${bestVal}分），可以多尝试分享给朋友；${tips[weakest]}是你的成长空间（${weakestVal}分），下个月我重点教你这块。`,
  };
}

interface RadarChartProps {
  scores: GrowthScore;
}

function RadarChart({ scores }: RadarChartProps) {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const labelR = 100;
  const numDims = DIMENSIONS.length;

  // 计算每个维度对应的角度（从顶部开始，顺时针）
  const angle = (i: number) => (Math.PI * 2 * i) / numDims - Math.PI / 2;

  // 网格圈（25, 50, 75, 100）
  const gridLevels = [25, 50, 75, 100];

  // 数据点
  const dataPoints = DIMENSIONS.map((d, i) => {
    const v = scores[d.key];
    const a = angle(i);
    return {
      x: cx + (r * Math.cos(a) * v) / 100,
      y: cy + (r * Math.sin(a) * v) / 100,
      labelX: cx + labelR * Math.cos(a),
      labelY: cy + labelR * Math.sin(a),
    };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      {/* 网格圈 */}
      {gridLevels.map((level) => {
        const points = DIMENSIONS.map((_, i) => {
          const a = angle(i);
          const x = cx + (r * Math.cos(a) * level) / 100;
          const y = cy + (r * Math.sin(a) * level) / 100;
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={0.5}
            opacity={0.6}
          />
        );
      })}
      {/* 轴线 */}
      {DIMENSIONS.map((_, i) => {
        const a = angle(i);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            opacity={0.6}
          />
        );
      })}
      {/* 数据多边形 */}
      <polygon
        points={dataPolygon}
        fill="#1f2937"
        fillOpacity={0.2}
        stroke="#1f2937"
        strokeWidth={1.5}
      />
      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#1f2937" />
      ))}
      {/* 标签 */}
      {DIMENSIONS.map((d, i) => {
        const p = dataPoints[i];
        const anchor = p.labelX > cx + 10 ? 'start' : p.labelX < cx - 10 ? 'end' : 'middle';
        return (
          <text
            key={d.key}
            x={p.labelX}
            y={p.labelY}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="9"
            fill="#374151"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

interface GrowthDashboardProps {
  profile: UserStyleProfile | null;
  feedbacks: OutfitFeedbackRecord[];
}

export function GrowthDashboard({ profile, feedbacks }: GrowthDashboardProps) {
  const scores = calcScore(profile, feedbacks);
  const total = totalScore(scores);
  const tip = pickGrowthTip(scores);

  return (
    <div className="mb-6 rounded-2xl border border-olive-pale bg-gradient-to-br from-olive-pale/20 to-creme-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-olive-dark/70">📈 GROWTH REPORT</p>
          <h2 className="mt-1 font-display text-lg text-ink-900">
            你的穿搭成长度 · {total} 分
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 雷达图 */}
        <div className="flex items-center justify-center">
          <div className="h-48 w-48 md:h-56 md:w-56">
            <RadarChart scores={scores} />
          </div>
        </div>

        {/* 5 维度详细分 + 建议 */}
        <div className="space-y-2">
          {DIMENSIONS.map((d) => {
            const v = scores[d.key];
            return (
              <div key={d.key} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-ink/70">{d.emoji} {d.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-olive-pale to-olive-dark transition-all"
                    style={{ width: `${v}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-medium text-ink/80">{v}</span>
              </div>
            );
          })}
          <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs leading-relaxed text-ink/75">
            💡 <span className="font-medium text-ink/90">成长建议：</span>
            {tip.tip}
          </p>
        </div>
      </div>
    </div>
  );
}