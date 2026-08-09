"use client";

import { useState, useEffect } from "react";
import { EvaluateOutfitResponse } from "@/lib/scoring-types";
import DimensionCard from "./dimension-card";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Clipboard, Lightbulb, RotateCcw, Shirt, Sparkles } from "lucide-react";
import { buildScoringSummaryText } from "@/lib/scoring-summary";

interface ScoreResultProps {
  result: EvaluateOutfitResponse;
  onReset: () => void;
}

export default function ScoreResult({ result, onReset }: ScoreResultProps) {
  const [mounted, setMounted] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  useEffect(() => { setMounted(true); }, []);

  const handleCopySummary = async () => {
    const summary = buildScoringSummaryText(result);
    try {
      await navigator.clipboard.writeText(summary);
      setCopyMessage("已复制诊断摘要");
    } catch {
      setCopyMessage("复制失败，请手动复制页面内容");
    }
  };

  const radarData = result.dimensions.map((d) => ({
    dimension: d.label,
    score: d.score,
  }));

  return (
    <div className="w-full space-y-8">
      <div className="border-b border-ink-900/10 pb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-[0.28em] text-ink-400">DIAGNOSIS REPORT</p>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center justify-center gap-2 border border-ink-900/10 px-4 py-2 text-xs text-ink-600 transition hover:border-ink-900 hover:text-ink-900"
          >
            <Clipboard size={14} />
            复制报告摘要
          </button>
        </div>
        <h1 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.9] text-ink-900">
          今日 Look
          <br />
          诊断完成
        </h1>
        {copyMessage && <p className="mt-4 text-sm text-ink-500">{copyMessage}</p>}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-ink-900/10 bg-[#e8ece8] p-5"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center bg-ink-900">
            <Sparkles className="w-5 h-5 text-creme-100" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900 mb-1">
              StyleMate 穿搭诊断结论
            </p>
            <p className="text-ink-600 leading-relaxed">{result.greeting}</p>
          </div>
        </div>
      </motion.div>

      {/* 雷达图 — 等待组件挂载后再渲染，避免 Recharts getBoundingClientRect 空值 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="border border-ink-900/10 bg-white/55 p-5"
        style={{ width: "100%", minHeight: 320 }}
      >
        <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-3">
          EIGHT DIMENSIONS
        </h3>
        {mounted && (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#d7d0c4" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: "#555555" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#8C8C8C" }}
              />
              <Radar
                name="评分"
                dataKey="score"
                stroke="#0A0A0A"
                fill="#6B7F5E"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* 整体评价 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="border-y border-ink-900/10 py-8 text-center"
      >
        <p className="text-ink-900 font-display text-2xl leading-relaxed">
          &ldquo;{result.overallComment}&rdquo;
        </p>
      </motion.div>

      {/* 8 维度卡片 */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 flex items-center gap-2">
          <Shirt className="w-4 h-4" />
          DIMENSION BREAKDOWN
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {result.dimensions.map((dim, idx) => (
            <DimensionCard key={dim.key} dimension={dim} index={idx} />
          ))}
        </div>
      </div>

      {/* 逐件分析 */}
      {result.itemComments && result.itemComments.length > 0 && (
        <div className="border border-ink-900/10 bg-white/45 p-5 space-y-2">
          <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-3">
            ITEM ANALYSIS
          </h3>
          {result.itemComments.map((comment, idx) => (
            <p key={idx} className="border-l border-ink-900/20 pl-4 text-sm leading-7 text-ink-600">
              {comment}
            </p>
          ))}
        </div>
      )}

      {/* 改良建议 */}
      {result.improvements && result.improvements.length > 0 && (
        <div className="border border-ink-900/10 bg-[#f4f1ea] p-5">
          <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-ink-600" />
            IMMEDIATE FIXES
          </h3>
          <div className="space-y-2">
            {result.improvements.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 font-display text-xl leading-none text-ink-900">0{idx + 1}</span>
                <span className="text-sm leading-7 text-ink-600">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 重新评分 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onReset}
        className="inline-flex w-full items-center justify-center gap-2 border border-ink-900 px-6 py-3 text-sm font-medium text-ink-900 transition-all duration-200 hover:bg-ink-900 hover:text-creme-100"
      >
        <RotateCcw size={16} />
        重新评分
      </motion.button>
    </div>
  );
}
