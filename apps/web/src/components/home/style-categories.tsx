'use client';

import { motion } from 'framer-motion';
import ScrollReveal from './scroll-reveal';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    id: 'jp_fresh',
    name: '日系清新',
    desc: '柔和色调、宽松廓形',
    image: '/styles/jp_zen/Japanese_zen_minimalist_fashio_2026-06-30T06-49-07.png',
    accent: 'bg-haze-pale',
  },
  {
    id: 'kr_minimal',
    name: '韩系简约',
    desc: '干净线条、高级日常',
    image: '/styles/kr_effortless/Korean_minimalist_casual_fashi_2026-06-30T06-49-46.png',
    accent: 'bg-silver-pale',
  },
  {
    id: 'cn_new_chinese',
    name: '新中式',
    desc: '东方元素、现代剪裁',
    image: '/styles/cn_new_chinese/Modern_Chinese_neo_traditional_2026-06-30T06-49-15.png',
    accent: 'bg-almond-pale',
  },
  {
    id: 'fr_elegance',
    name: '法式优雅',
    desc: '简约精致、随性魅力',
    image: '/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    accent: 'bg-olive-pale',
  },
  {
    id: 'minimalist',
    name: '极简主义',
    desc: '少即是多、质感为王',
    image: '/styles/minimalist/Extreme_minimalist_fashion__a__2026-06-30T06-51-32.png',
    accent: 'bg-creme-200',
  },
  {
    id: 'streetwear',
    name: '街头潮流',
    desc: '态度穿搭、打破规则',
    image: '/styles/us_street/American_streetwear_hip_hop_fa_2026-06-30T06-48-37.png',
    accent: 'bg-haze-pale',
  },
  {
    id: 'commute',
    name: '通勤穿搭',
    desc: '职场气场、利落干练',
    image: '/styles/office_boss/Office_elite_corporate_fashion_2026-06-30T06-55-39.png',
    accent: 'bg-silver-pale',
  },
  {
    id: 'us_vintage',
    name: '美式复古',
    desc: '经典回潮、自在随性',
    image: '/styles/us_prep_vintage/American_90s_high_school_vinta_2026-06-30T06-48-32.png',
    accent: 'bg-almond-pale',
  },
];

function CategoryCard({
  cat,
  index,
}: {
  cat: (typeof CATEGORIES)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
    >
      <Link
        href={`/styles?category=${cat.id}`}
        className="group relative block aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-lg cursor-pointer"
      >
        <img
          src={cat.image}
          alt={cat.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-800 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/10 to-transparent transition-opacity duration-500 group-hover:opacity-95" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
          <motion.div
            variants={{
              hover: { y: -6, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
            }}
          >
            <h3 className="font-display text-2xl lg:text-3xl text-creme-100 mb-1.5">{cat.name}</h3>
            <p className="text-creme-200/55 text-sm font-light">{cat.desc}</p>
          </motion.div>
        </div>
        <div className="absolute inset-3 border border-creme-100/0 group-hover:border-creme-100/12 rounded-md transition-all duration-700 pointer-events-none" />
      </Link>
    </motion.div>
  );
}

export default function StyleCategories() {
  return (
    <section id="styles" className="py-28 lg:py-36 bg-creme-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <ScrollReveal className="mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.25em] text-ink-400 mb-4">风格库预览</p>
            <h2 className="font-display text-section text-ink-900">
              探索你的<span className="italic">风格可能</span>
            </h2>
            <p className="mt-3 text-ink-500 font-light max-w-md">
              无论你的身形、气质或生活方式如何，总有一种风格在等你发现
            </p>
          </div>
          <Link
            href="/styles"
            className="hidden lg:inline-flex items-center gap-2 text-xs tracking-[0.15em] text-ink-500 hover:text-ink-900 transition-colors duration-300"
          >
            浏览全部 80 种风格 <ArrowUpRight size={14} />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center lg:hidden">
          <Link
            href="/styles"
            className="inline-flex items-center gap-2 text-xs tracking-[0.15em] text-ink-500 hover:text-ink-900 transition-colors"
          >
            浏览全部 80 种风格 <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
