'use client';

import { Search, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import { AiWatermark } from '@/components/ui/ai-watermark';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Tag } from '@/components/ui/tag';
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
        className="overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] bg-creme-300">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={style.name}
                className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <AiWatermark />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] text-ink-300">
              IMAGE SLOT
            </div>
          )}
          <Tag variant="badge" className="absolute left-3 top-3">
            {DIMENSION_LABELS[style.dimension]}
          </Tag>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl leading-tight text-ink-900">{style.name}</h3>
            <Tag className="mt-0.5 shrink-0">
              {CATEGORY_LABELS[style.category] || style.category}
            </Tag>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-ink-500">{style.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {style.keyItems.slice(0, 3).map((item) => (
              <span key={item} className="rounded-md bg-creme-200 px-2.5 py-1 text-[11px] text-ink-500">
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
      <main className="min-h-screen bg-creme-200 pt-28 pb-24 text-ink-900">
        <section className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 grid gap-8 border-b border-ink-900/10 pb-10 lg:grid-cols-[3fr_2fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs tracking-[0.3em] text-ink-400">STYLE ATLAS</p>
              <h1 className="text-balance font-display text-display text-ink-900">
                风格档案库
              </h1>
            </div>
            <div>
              <p className="max-w-xl text-sm leading-7 text-ink-500">
                共收录 <b className="font-display text-xl font-semibold text-ink-900">{STYLES.length}</b> 种穿搭风格，
                按地域文化、视觉元素、场景圈层、人物原型 <b className="font-display text-xl font-semibold text-ink-900">4</b> 个维度组织。
                每个风格都能继续展开为单品、配色、版型和适配建议。
              </p>
              <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-ink-400">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                目前风格照片均由 AI 生成，后续会上线网络穿搭图库；你也可以上传自己的穿搭，审核通过后有机会展示在风格首页。
              </p>
            </div>
          </div>

          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['全部', ...DIMENSIONS] as const).map((dimension) => {
                const active = activeDimension === dimension;
                return (
                  <button
                    key={dimension}
                    onClick={() => setActiveDimension(dimension)}
                    className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'border-ink-900 bg-ink-900 text-creme-50 shadow-sm'
                        : 'border-ink-200 bg-white text-ink-500 hover:border-ink-400 hover:text-ink-900'
                    }`}
                  >
                    {dimension === '全部' ? '全部风格' : DIMENSION_LABELS[dimension]}
                    <span className={`text-xs ${active ? 'text-creme-200' : 'text-ink-300'}`}>
                      {dimensionCounts[dimension]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-[380px] lg:shrink-0">
              <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-300" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索风格、单品、廓形关键词"
                className="pl-11 pr-11"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="清除搜索"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-300 transition-colors hover:text-ink-700"
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
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="没有找到相关风格"
              description={
                searchQuery
                  ? `没有与「${searchQuery}」匹配的结果，试试换个关键词或清除筛选。`
                  : '该维度下暂时没有收录风格，切换到其他维度看看。'
              }
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveDimension('全部');
                  }}
                >
                  清除筛选条件
                </Button>
              }
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
