"use client";

import { DimensionScore } from "@/lib/scoring-types";
import { motion } from "framer-motion";

interface DimensionCardProps {
  dimension: DimensionScore;
  index: number;
}

export default function DimensionCard({ dimension, index }: DimensionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="group border border-ink-900/10 bg-white/55 p-4 transition-all duration-200 hover:border-ink-900/35"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="block text-sm font-semibold text-ink-900">{dimension.label}</span>
        <span className="font-display text-2xl leading-none text-ink-900">{dimension.score}</span>
      </div>
      <div className="mb-3 h-1 bg-ink-900/10">
        <div className="h-full bg-ink-900" style={{ width: `${Math.max(0, Math.min(100, dimension.score))}%` }} />
      </div>
      <p className="text-xs leading-relaxed text-ink-500">{dimension.comment}</p>
    </motion.div>
  );
}
