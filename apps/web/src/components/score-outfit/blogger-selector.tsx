"use client";

import { useState, useEffect } from "react";
import { Check, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BloggerInfo } from "@/lib/scoring-types";
import { fetchBloggers } from "@/lib/scoring-api";

interface BloggerSelectorProps {
  onSelect: (bloggerId: string) => void;
  selectedId: string | null;
}

export default function BloggerSelector({ onSelect, selectedId }: BloggerSelectorProps) {
  const [bloggers, setBloggers] = useState<BloggerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBloggers()
      .then(setBloggers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3"
        >
          {bloggers.map((blogger) => {
            const isSelected = selectedId === blogger.id;
            return (
              <motion.button
                key={blogger.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(blogger.id)}
                className={`w-full text-left border p-5 transition-all duration-200 ${
                  isSelected
                    ? "border-ink-900 bg-[#e8ece8]"
                    : "border-ink-900/10 bg-white/50 hover:border-ink-900/35"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border ${
                      isSelected ? "border-ink-900 bg-ink-900 text-creme-100" : "border-ink-900/10 bg-[#f4f1ea] text-ink-500"
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : <UserRound className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-2xl leading-none text-ink-900">
                        {blogger.name}
                      </h3>
                      <span className="border border-ink-900/10 px-2 py-0.5 text-[10px] tracking-[0.14em] text-ink-400">
                        诊断视角
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-ink-700">{blogger.styleSignature}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-500">{blogger.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
