"use client";

import { motion } from "framer-motion";
import { CATEGORY_LABELS as CATEGORY_NAMES } from "@/lib/scoring-types";
import type { ScoringSnapshot, CategoryScore } from "@/lib/scoring-types";

interface StyleMatchResultProps {
  snapshot: ScoringSnapshot;
}

/**
 * 风格匹配分层结果展示组件
 *
 * 展示内容：
 *   1. 大类得分（横向柱状图）
 *   2. 核心风格（>=85分）列表
 *   3. 可尝试风格（65-84分）列表
 *   4. 调性过滤说明
 *   5. 如果用户已选风格，展示该风格的分析
 */
export default function StyleMatchResult({ snapshot }: StyleMatchResultProps) {
  const hasCoreStyles = snapshot.coreStyles.length > 0;
  const hasSecondaryStyles = snapshot.secondaryStyles.length > 0;

  return (
    <div className="w-full space-y-8">
      {/* 标题区 */}
      <div className="border-b border-ink-900/10 pb-6">
        <p className="mb-2 text-xs tracking-[0.28em] text-ink-400">
          STYLE MATCH REPORT
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] text-ink-900">
          你的风格匹配结果
        </h1>
        <p className="mt-3 text-sm text-ink-500">
          基于你的体型、偏好、生活方式综合计算，以下为分层推荐。
        </p>
      </div>

      {/* 已选风格分析 */}
      {snapshot.selectedStyleAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-ink-900/10 bg-[#e8ece8] p-5 space-y-4"
        >
          <p className="text-xs tracking-[0.24em] text-ink-500">
            YOUR SELECTED STYLE
          </p>
          <div className="flex items-start justify-between">
            <h2 className="font-display text-2xl text-ink-900">
              {snapshot.selectedStyleAnalysis.styleName}
            </h2>
          </div>

          {/* 优点 */}
          <div>
            <p className="text-xs font-semibold text-ink-600 mb-2">适配优势</p>
            <ul className="space-y-1">
              {snapshot.selectedStyleAnalysis.advantages.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* 注意事项 */}
          <div>
            <p className="text-xs font-semibold text-ink-600 mb-2">注意事项</p>
            <ul className="space-y-1">
              {snapshot.selectedStyleAnalysis.disadvantages.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* 类似风格推荐 */}
          {snapshot.selectedStyleAnalysis.similarRecommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-600 mb-2">
                调性相近的其他风格
              </p>
              <div className="flex flex-wrap gap-2">
                {snapshot.selectedStyleAnalysis.similarRecommendations.map((id) => (
                  <span
                    key={id}
                    className="border border-ink-900/10 bg-white px-3 py-1 text-xs text-ink-600"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 跨大类推荐 */}
          {snapshot.selectedStyleAnalysis.crossCategoryRecommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-600 mb-2">
                可尝试的相关大类
              </p>
              <div className="flex flex-wrap gap-2">
                {snapshot.selectedStyleAnalysis.crossCategoryRecommendations.map((catId) => (
                  <span
                    key={catId}
                    className="border border-ink-900/15 bg-[#f4f1ea] px-3 py-1 text-xs text-ink-700"
                  >
                    {CATEGORY_NAMES[catId]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 大类评分概览 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-ink-400">
          CATEGORY OVERVIEW
        </p>
        <div className="space-y-2">
          {snapshot.categoryScores.map((cs, idx) => (
            <CategoryBar
              key={cs.categoryId}
              score={cs}
              isRetained={snapshot.tonalConsistency.retainedCategoryIds.includes(cs.categoryId)}
              isDominant={cs.categoryId === snapshot.tonalConsistency.dominantCategoryId}
              index={idx}
            />
          ))}
        </div>
        {/* 调性过滤说明 */}
        {snapshot.tonalConsistency.filteredOutCategoryIds.length > 0 && (
          <p className="mt-2 text-xs text-ink-400">
            灰色大类因视觉调性差异较大已自动过滤，确保推荐风格调性一致。
          </p>
        )}
      </motion.div>

      {/* 核心风格 */}
      {hasCoreStyles && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-ink-400">
            CORE STYLES 强烈推荐
          </p>
          <div className="grid gap-3">
            {snapshot.coreStyles.map((style, idx) => (
              <StyleCardItem key={style.styleId} style={style} index={idx} />
            ))}
          </div>
        </motion.div>
      )}

      {/* 可尝试风格 */}
      {hasSecondaryStyles && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-ink-400">
            SECONDARY STYLES 值得尝试
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {snapshot.secondaryStyles.map((style, idx) => (
              <StyleCardItem key={style.styleId} style={style} index={idx} compact />
            ))}
          </div>
        </motion.div>
      )}

      {/* 无结果时的提示 */}
      {!hasCoreStyles && !hasSecondaryStyles && (
        <div className="border border-ink-900/10 bg-[#f4f1ea] p-8 text-center">
          <p className="text-sm text-ink-500">
            当前评分未产生核心或可尝试风格，建议补充更多个人信息后重新测评。
          </p>
        </div>
      )}
    </div>
  );
}

/* 子组件 */

function CategoryBar({
  score,
  isRetained,
  isDominant,
  index,
}: {
  score: CategoryScore;
  isRetained: boolean;
  isDominant: boolean;
  index: number;
}) {
  const pct = Math.min(100, score.totalScore);
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 py-1.5 ${!isRetained ? "opacity-40" : ""}`}
    >
      <span className="w-24 shrink-0 text-xs text-ink-500 text-right">
        {CATEGORY_NAMES[score.categoryId]}
      </span>
      <div className="flex-1 h-5 bg-ink-900/8 rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all duration-700 ${
            isDominant
              ? "bg-ink-900"
              : isRetained
              ? "bg-ink-600"
              : "bg-ink-300"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-xs font-semibold text-ink-600 text-right">
        {score.totalScore}
      </span>
    </motion.div>
  );
}

function StyleCardItem({
  style,
  index,
  compact,
}: {
  style: { styleId: string; styleName: string; categoryName: string; score: number; reasons: string[]; riskFlags: string[] };
  index: number;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`border border-ink-900/10 bg-white/55 p-4 transition-all hover:border-ink-900/30`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <span className="inline-block px-2 py-0.5 bg-creme-200 text-ink-500 text-[10px] rounded-full mb-1">
            {style.categoryName}
          </span>
          <h3 className={`font-display text-ink-900 ${compact ? "text-lg" : "text-xl"}`}>
            {style.styleName}
          </h3>
        </div>
        <span className={`font-display leading-none text-ink-900 ${compact ? "text-xl" : "text-3xl"}`}>
          {style.score}
        </span>
      </div>

      {/* 推荐理由 */}
      {style.reasons.length > 0 && (
        <ul className="space-y-0.5 mb-2">
          {style.reasons.map((r, i) => (
            <li key={i} className="flex items-center gap-1.5 text-xs text-ink-500">
              <span className="h-1 w-1 rounded-full bg-ink-400 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      )}

      {/* 风险标记 */}
      {style.riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {style.riskFlags.map((flag, i) => (
            <span
              key={i}
              className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] text-amber-700"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
