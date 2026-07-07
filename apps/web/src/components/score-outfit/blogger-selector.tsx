"use client";

import { useState, useEffect } from "react";
import { User, Check } from "lucide-react";
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
        <div className="w-8 h-8 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          {bloggers.map((blogger) => {
            const isSelected = selectedId === blogger.id;
            return (
              <motion.button
                key={blogger.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(blogger.id)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#1a1a2e] bg-[#f0ebe3] shadow-md"
                    : "border-[#e5dfd7] bg-white hover:border-[#c4a35a] hover:bg-[#faf8f5]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-[#1a1a2e] text-white" : "bg-[#f0ebe3] text-[#5c5c5c]"
                    }`}
                  >
                    {isSelected ? <Check className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-display font-semibold text-[#1a1a2e]">
                        {blogger.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0ebe3] text-[#5c5c5c]">
                        {blogger.platform}
                      </span>
                    </div>
                    <p className="text-sm text-[#c4a35a] font-medium mt-0.5">{blogger.styleSignature}</p>
                    <p className="text-sm text-[#8a8a8a] mt-1.5 line-clamp-2">{blogger.description}</p>
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
