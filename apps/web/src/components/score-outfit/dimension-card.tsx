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
      className="group p-4 rounded-xl bg-white border border-[#e5dfd7] hover:border-[#c4a35a] transition-all duration-200"
    >
      <span className="text-sm font-semibold text-[#1a1a2e] block mb-1">{dimension.label}</span>
      <p className="text-xs text-[#5c5c5c] leading-relaxed">{dimension.comment}</p>
    </motion.div>
  );
}
