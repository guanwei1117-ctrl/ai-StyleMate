'use client';

import { motion } from 'framer-motion';
import ScrollReveal from './scroll-reveal';
import { ArrowUpRight, Heart } from 'lucide-react';

const PICKS = [
  {
    id: 1,
    image: '/styles/office_boss/Office_elite_corporate_fashion_2026-06-30T06-55-39.png',
    brand: 'COS',
    name: '宽松羊毛大衣',
    style: '极简',
    price: '¥1,290',
  },
  {
    id: 2,
    image: '/styles/jp_zen/Japanese_zen_minimalist_fashio_2026-06-30T06-49-07.png',
    brand: 'Uniqlo U',
    name: '纯棉府绸衬衫',
    style: '日系',
    price: '¥299',
  },
  {
    id: 3,
    image: '/styles/kr_street/Korean_street_idol_inspired_fa_2026-06-30T06-49-48.png',
    brand: 'Ader Error',
    name: '解构阔腿西裤',
    style: '韩系',
    price: '¥1,580',
  },
  {
    id: 4,
    image: '/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    brand: 'Lemaire',
    name: '牛角包皮革手袋',
    style: '法式',
    price: '¥2,350',
  },
  {
    id: 5,
    image: '/styles/earthy_relax/Earthy_relaxed_tonal_fashion___2026-06-30T06-53-28.png',
    brand: 'MUJI',
    name: '美利奴羊毛针织衫',
    style: '日系',
    price: '¥398',
  },
  {
    id: 6,
    image: '/styles/avant_garde/Avant_garde_experimental_fashi_2026-06-30T06-55-41.png',
    brand: 'Marni',
    name: '雕塑跟短靴',
    style: '前卫',
    price: '¥2,100',
  },
];

function PickCard({ pick, index }: { pick: (typeof PICKS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      className="group"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-ink-50">
        <img
          src={pick.image}
          alt={pick.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay with quick actions */}
        <motion.div
          variants={{
            hover: { opacity: 1 },
          }}
          className="absolute inset-0 bg-ink-900/20 opacity-0 transition-opacity duration-400 flex items-end justify-between p-4"
        >
          <span className="px-3 py-1.5 bg-creme-100/90 backdrop-blur-sm text-ink-800 text-[10px] tracking-widest uppercase font-medium rounded-full">
            {pick.style}
          </span>
          <button className="p-2 bg-creme-100/90 backdrop-blur-sm rounded-full text-ink-700 hover:text-ink-900 transition-colors">
            <Heart size={14} />
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <p className="text-[10px] tracking-[0.2em] text-ink-400 uppercase">{pick.brand}</p>
        <h3 className="text-sm font-medium text-ink-800 mt-1 leading-snug">{pick.name}</h3>
        <p className="text-xs text-ink-500 mt-1 font-light">{pick.price}</p>
      </div>
    </motion.div>
  );
}

export default function CuratedPicks() {
  return (
    <section id="curated" className="py-28 lg:py-36 bg-creme-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <ScrollReveal className="mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.3em] text-ink-400 uppercase mb-4">
              编辑精选
            </p>
            <h2 className="font-display text-section text-ink-900">
              本季<span className="italic">推荐</span>
            </h2>
            <p className="mt-3 text-ink-500 font-light max-w-md">
              由我们的风格编辑精选的本季必备单品，兼顾质感与设计感
            </p>
          </div>
          <a
            href="#"
            className="hidden lg:inline-flex items-center gap-2 text-xs tracking-[0.2em] text-ink-500 hover:text-ink-900 uppercase transition-colors duration-300"
          >
            查看全部 <ArrowUpRight size={14} />
          </a>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
          {PICKS.map((pick, i) => (
            <PickCard key={pick.id} pick={pick} index={i} />
          ))}
        </div>

        {/* Centered mobile CTA */}
        <div className="mt-10 text-center lg:hidden">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-ink-500 hover:text-ink-900 uppercase transition-colors"
          >
            查看全部 <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
