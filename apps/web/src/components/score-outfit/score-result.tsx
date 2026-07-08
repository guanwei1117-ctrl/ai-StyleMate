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
import { Sparkles, Shirt, Lightbulb } from "lucide-react";

interface ScoreResultProps {
  result: EvaluateOutfitResponse;
  onReset: () => void;
}

export default function ScoreResult({ result, onReset }: ScoreResultProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const radarData = result.dimensions.map((d) => ({
    dimension: d.label,
    score: d.score,
  }));

  return (
    <div className="w-full space-y-6">
      {/* 开场白气泡 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#faf8f5] border border-[#e5dfd7] rounded-2xl p-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a2e] mb-1">
              {result.bloggerName} 说：
            </p>
            <p className="text-[#5c5c5c] leading-relaxed">{result.greeting}</p>
          </div>
        </div>
      </motion.div>

      {/* 雷达图 — 等待组件挂载后再渲染，避免 Recharts getBoundingClientRect 空值 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-[#e5dfd7] p-5"
        style={{ width: "100%", minHeight: 320 }}
      >
        <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3 font-display">
          📊 8 维评分雷达图
        </h3>
        {mounted && (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5dfd7" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: "#5c5c5c" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#8a8a8a" }}
              />
              <Radar
                name="评分"
                dataKey="score"
                stroke="#5a7d8c"
                fill="#5a7d8c"
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
        className="bg-gradient-to-r from-[#faf8f5] to-[#f0ebe3] rounded-2xl p-5 text-center"
      >
        <p className="text-[#1a1a2e] font-display text-lg leading-relaxed">
          &ldquo;{result.overallComment}&rdquo;
        </p>
      </motion.div>

      {/* 8 维度卡片 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#1a1a2e] font-display flex items-center gap-2">
          <Shirt className="w-4 h-4" />
          维度拆解
        </h3>
        <div className="space-y-2">
          {result.dimensions.map((dim, idx) => (
            <DimensionCard key={dim.key} dimension={dim} index={idx} />
          ))}
        </div>
      </div>

      {/* 逐件分析 */}
      {result.itemComments && result.itemComments.length > 0 && (
        <div className="bg-[#faf8f5] rounded-2xl p-5 space-y-2">
          <h3 className="text-sm font-semibold text-[#1a1a2e] font-display mb-2">
            🔍 逐件分析
          </h3>
          {result.itemComments.map((comment, idx) => (
            <p key={idx} className="text-sm text-[#5c5c5c] pl-4 border-l-2 border-[#c4a35a]">
              {comment}
            </p>
          ))}
        </div>
      )}

      {/* 改良建议 */}
      {result.improvements && result.improvements.length > 0 && (
        <div className="bg-[#faf8f5] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#1a1a2e] font-display mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#c4a35a]" />
            改良建议
          </h3>
          <div className="space-y-2">
            {result.improvements.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="text-[#c4a35a] font-bold mt-0.5">{idx + 1}.</span>
                <span className="text-sm text-[#5c5c5c]">{tip}</span>
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
        className="w-full py-3 rounded-xl border-2 border-[#1a1a2e] text-[#1a1a2e] font-semibold hover:bg-[#1a1a2e] hover:text-white transition-all duration-200"
      >
        重新评分
      </motion.button>
    </div>
  );
}
