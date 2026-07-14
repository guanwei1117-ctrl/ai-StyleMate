'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import {
  CATEGORY_LABELS,
  DIMENSIONS,
  DIMENSION_LABELS,
  STYLES,
  type StyleCard,
  type StyleDimension,
} from '@/data/styles';
import styleImages from '@/data/style-images.json';

function getStyleImage(styleId: string): string | undefined {
  return (styleImages as Record<string, string>)[styleId];
}

function StyleCardView({ style, index }: { style: StyleCard; index: number }) {
  const imageUrl = getStyleImage(style.id);

  return (
    <Link href={`/styles/${style.id}`} className="group block">
      <motion.article
        layout
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.42, delay: index * 0.015, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden border border-ink-900/10 bg-[#fbfaf6] transition hover:border-ink-900/35"
      >
        <div className="relative aspect-[4/3] bg-[#ebe7df]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={style.name}
              className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] text-ink-300">
              IMAGE SLOT
            </div>
          )}
          <div className="absolute left-4 top-4 bg-[#fbfaf6]/90 px-3 py-1 text-[10px] tracking-[0.18em] text-ink-500 backdrop-blur">
            {DIMENSION_LABELS[style.dimension]}
          </div>
        </div>
        <div className="flex h-1.5">
          {style.colorPalette.map((color) => (
            <span key={color} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="font-display text-3xl leading-none text-ink-900">{style.name}</h3>
            <span className="shrink-0 border border-ink-900/10 px-2 py-1 text-[10px] tracking-[0.14em] text-ink-400">
              {CATEGORY_LABELS[style.category] || style.category}
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-ink-500">{style.description}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {style.keyItems.slice(0, 3).map((item) => (
              <span key={item} className="bg-[#f4f1ea] px-2.5 py-1 text-[11px] text-ink-500">
                {item}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default function StylesPage() {
  const [activeDimension, setActiveDimension] = useState<StyleDimension | '全部'>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStyles = useMemo(() => {
    let result = activeDimension === '全部' ? STYLES : STYLES.filter((style) => style.dimension === activeDimension);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((style) =>
        style.name.toLowerCase().includes(q) ||
        style.description.toLowerCase().includes(q) ||
        style.category.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[style.category] || '').toLowerCase().includes(q) ||
        style.keyItems.some((item) => item.toLowerCase().includes(q)) ||
        style.silhouette.some((silhouette) => silhouette.toLowerCase().includes(q)) ||
        style.philosophy.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeDimension, searchQuery]);

  const dimensionCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: STYLES.length };
    DIMENSIONS.forEach((dimension) => {
      counts[dimension] = STYLES.filter((style) => style.dimension === dimension).length;
    });
    return counts;
  }, []);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#f4f1ea] pt-28 pb-24 text-ink-900">
        <section className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 grid gap-8 border-b border-ink-900/10 pb-12 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs tracking-[0.3em] text-ink-400">STYLE ATLAS</p>
              <h1 className="font-display text-[clamp(3.4rem,8vw,8rem)] leading-[0.86]">
                风格
                <br />
                档案库
              </h1>
            </div>
            <div>
              <p className="max-w-xl text-sm leading-7 text-ink-500">
                80 种穿搭风格按地域文化、视觉元素、场景圈层和人物原型组织。每个风格都能继续展开为单品、配色、版型和适配建议。
              </p>
              <div className="mt-7 flex gap-6 text-sm">
                <span><b className="font-display text-3xl">{STYLES.length}</b> styles</span>
                <span><b className="font-display text-3xl">4</b> dimensions</span>
              </div>
            </div>
          </div>

          <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_420px] lg:items-center">
            <div className="flex flex-wrap gap-2">
              {(['全部', ...DIMENSIONS] as const).map((dimension) => (
                <button
                  key={dimension}
                  onClick={() => setActiveDimension(dimension)}
                  className={`border px-4 py-2 text-xs tracking-[0.14em] transition ${
                    activeDimension === dimension
                      ? 'border-ink-900 bg-ink-900 text-creme-100'
                      : 'border-ink-900/10 bg-white/45 text-ink-500 hover:border-ink-900/35 hover:text-ink-900'
                  }`}
                >
                  {dimension === '全部' ? '全部风格' : DIMENSION_LABELS[dimension]}
                  <span className="ml-2 opacity-55">{dimensionCounts[dimension]}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索风格、单品、廓形关键词"
                className="w-full border border-ink-900/10 bg-[#fbfaf6] py-3 pl-11 pr-11 text-sm text-ink-700 outline-none transition placeholder:text-ink-300 focus:border-ink-900/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="清除搜索"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredStyles.map((style, index) => (
                <StyleCardView key={style.id} style={style} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredStyles.length === 0 && (
            <div className="py-24 text-center text-sm text-ink-400">
              {searchQuery ? `没有找到与 "${searchQuery}" 相关的风格` : '该分类暂无风格'}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
