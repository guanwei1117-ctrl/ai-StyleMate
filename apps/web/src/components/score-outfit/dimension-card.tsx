"use client";

import { DimensionScore } from "@/lib/scoring-types";
import { motion } from "framer-motion";

interface DimensionCardProps {
  dimension: DimensionScore;
  index: number;
}

const COLOR_MAP: Record<string, string> = {
  proportion: "#5a7d8c",
  color: "#c4a35a",
  occasion: "#7a9e7e",
  coherence: "#2d4a5c",
  trend: "#8b7355",
  creativity: "#c46564",
  bodyFit: "#4682b4",
  practicality: "#5a7d8c",
};

export default function DimensionCard({ dimension, index }: DimensionCardProps) {
  const color = COLOR_MAP[dimension.key] || "#5a7d8c";
  const scorePercent = Math.max(0, Math.min(100, dimension.score));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="group p-4 rounded-xl bg-white border border-[#e5dfd7] hover:border-[#c4a35a] transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#1a1a2e]">{dimension.label}</span>
        <span className="text-sm font-bold font-display" style={{ color }}>
          {scorePercent}
          <span className="text-xs text-[#8a8a8a] font-normal">/100</span>
        </span>
      </div>

      {/* 渐进度条 */}
      <div className="w-full h-2 bg-[#f0ebe3] rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${scorePercent}%` }}
          transition={{ delay: 0.2 + index * 0.08, duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>

      <p className="text-xs text-[#5c5c5c] leading-relaxed">{dimension.comment}</p>
    </motion.div>
  );
}
