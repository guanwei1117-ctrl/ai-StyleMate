'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import { STYLES, ALL_CATEGORIES, CATEGORY_LABELS, type StyleCategory, type StyleCard } from '@/data/styles';

function StarRating({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`text-[10px] ${n <= difficulty ? 'text-ink-600' : 'text-ink-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function StyleCard({ style }: { style: StyleCard }) {
  return (
    <Link href={`/styles/${style.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover="hover"
        className="group bg-creme-100 rounded-xl border border-creme-200/60 overflow-hidden hover:border-creme-300 hover:shadow-sm transition-all duration-400"
      >
        {/* Color palette strip */}
        <div className="flex h-2">
          {style.colorPalette.map((color) => (
            <div key={color} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </div>

        <div className="p-5 lg:p-6">
          {/* Category badge */}
          <span className="inline-block px-2.5 py-0.5 bg-creme-200/60 text-ink-500 text-[10px] tracking-wider rounded-full mb-3">
            {CATEGORY_LABELS[style.category]}
          </span>

          {/* Name + difficulty */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display text-xl lg:text-2xl text-ink-900 leading-tight">
              {style.name}
            </h3>
            <StarRating difficulty={style.difficulty} />
          </div>

          {/* Description */}
          <p className="text-sm text-ink-500 font-light leading-relaxed mb-4">
            {style.description}
          </p>

          {/* Key items */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {style.keyItems.slice(0, 4).map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 bg-creme-200/50 text-ink-600 text-[11px] rounded-md"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Philosophy */}
          <p className="text-xs text-ink-400 font-light italic leading-relaxed border-t border-creme-200 pt-3">
            {style.philosophy}
          </p>
        </div>

        {/* Hover reveal */}
        <motion.div
          variants={{ hover: { opacity: 1 } }}
          className="absolute inset-0 bg-gradient-to-t from-ink-900/5 to-transparent opacity-0 pointer-events-none rounded-xl"
        />
      </motion.div>
    </Link>
  );
}

export default function StylesPage() {
  const [activeCategory, setActiveCategory] = useState<StyleCategory | '全部'>('全部');

  const filteredStyles = useMemo(() => {
    if (activeCategory === '全部') return STYLES;
    return STYLES.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  // Count styles per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部': STYLES.length };
    ALL_CATEGORIES.forEach((cat) => {
      counts[cat] = STYLES.filter((s) => s.category === cat).length;
    });
    return counts;
  }, []);

  const tabs = ['全部', ...ALL_CATEGORIES] as const;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-creme-100 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.25em] text-ink-400 mb-4 uppercase">Style Library</p>
            <h1 className="font-display text-display text-ink-900 mb-4">
              风格<span className="italic">库</span>
            </h1>
            <p className="text-ink-500 font-light max-w-lg mx-auto">
              22 种风格，五大维度精准匹配——找到最适合你的那一个
            </p>
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-14">
            {tabs.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs tracking-wider rounded-full transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-ink-900 text-creme-100 shadow-sm'
                    : 'bg-creme-200/60 text-ink-500 hover:bg-creme-200 hover:text-ink-700'
                }`}
              >
                {cat === '全部' ? cat : CATEGORY_LABELS[cat]}
                <span className={`ml-1.5 ${activeCategory === cat ? 'text-creme-200/60' : 'text-ink-300'}`}>
                  {categoryCounts[cat]}
                </span>
              </button>
            ))}
          </div>

          {/* Style cards grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredStyles.map((style) => (
                <StyleCard key={style.id} style={style} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          {filteredStyles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-ink-400 font-light">该分类暂无风格</p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-ink-400 text-sm font-light mb-6">
              不确定哪种风格适合你？让 AI 帮你分析
            </p>
            <Link
              href="/onboarding"
              className="inline-block px-10 py-4 bg-ink-900 text-creme-100 text-sm tracking-wider hover:bg-ink-800 transition-all duration-400"
            >
              开始风格测试
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
