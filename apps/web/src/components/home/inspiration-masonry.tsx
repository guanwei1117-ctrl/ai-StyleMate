'use client';

import { motion } from 'framer-motion';
import ScrollReveal from './scroll-reveal';

const INSPIRATIONS = [
  {
    id: 1,
    image: '/styles/jp_sweet/Japanese_sweet_feminine_fashio_2026-06-30T06-49-10.png',
    user: 'Yuki Chen',
    style: '日系清新',
    aspect: '3/4',
  },
  {
    id: 2,
    image: '/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    user: 'Emma Wang',
    style: '法式优雅',
    aspect: '3/5',
  },
  {
    id: 3,
    image: '/styles/us_street/American_streetwear_hip_hop_fa_2026-06-30T06-48-37.png',
    user: 'Lin Zhao',
    style: '街头潮流',
    aspect: '3/4',
  },
  {
    id: 4,
    image: '/styles/minimalist/Extreme_minimalist_fashion__a__2026-06-30T06-51-32.png',
    user: 'Sophie Li',
    style: '极简主义',
    aspect: '3/5',
  },
  {
    id: 5,
    image: '/styles/office_boss/Office_elite_corporate_fashion_2026-06-30T06-55-39.png',
    user: 'Mia Zhang',
    style: '通勤穿搭',
    aspect: '3/4',
  },
  {
    id: 6,
    image: '/styles/us_prep_vintage/American_90s_high_school_vinta_2026-06-30T06-48-32.png',
    user: 'Rui Huang',
    style: '美式复古',
    aspect: '3/5',
  },
  {
    id: 7,
    image: '/styles/cn_new_chinese/Modern_Chinese_neo_traditional_2026-06-30T06-49-15.png',
    user: 'Jia Liu',
    style: '新中式',
    aspect: '3/4',
  },
  {
    id: 8,
    image: '/styles/y2k/Y2K_millennium_fashion__a_youn_2026-06-30T06-52-14.png',
    user: 'Yan Xu',
    style: 'Y2K 千禧',
    aspect: '3/5',
  },
  {
    id: 9,
    image: '/styles/quiet_luxury/Quiet_luxury_silent_wealth_fas_2026-06-30T06-51-40.png',
    user: 'Ting Wu',
    style: '轻熟风',
    aspect: '3/4',
  },
  {
    id: 10,
    image: '/styles/intellectual/Intellectual_academic_fashion__2026-06-30T06-55-09.png',
    user: 'Mei Sun',
    style: '知识分子风',
    aspect: '3/5',
  },
];

function MasonryItem({
  item,
  index,
}: {
  item: (typeof INSPIRATIONS)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      className="break-inside-avoid mb-4 lg:mb-5 group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg bg-ink-50">
        <img
          src={item.image}
          alt={item.user}
          className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ aspectRatio: item.aspect }}
          loading="lazy"
        />

        {/* Hover overlay */}
        <motion.div
          variants={{
            hover: { opacity: 1 },
          }}
          className="absolute inset-0 bg-gradient-to-t from-ink-900/65 via-ink-900/5 to-transparent opacity-0 transition-opacity duration-400 flex flex-col justify-end p-4"
        >
          <p className="text-creme-100/90 text-sm font-medium">{item.user}</p>
          <p className="text-creme-200/60 text-xs mt-0.5">{item.style}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function InspirationMasonry() {
  return (
    <section className="py-28 lg:py-36 bg-creme-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <ScrollReveal className="mb-14">
          <p className="text-xs tracking-[0.3em] text-ink-400 uppercase mb-4">
            社区灵感
          </p>
          <h2 className="font-display text-section text-ink-900">
            穿搭<span className="italic">日记</span>
          </h2>
          <p className="mt-3 text-ink-500 font-light max-w-md">
            来自社区的穿搭灵感——看看大家今天穿了什么
          </p>
        </ScrollReveal>

        {/* Masonry grid using CSS columns */}
        <div className="columns-2 lg:columns-4 gap-4 lg:gap-5">
          {INSPIRATIONS.map((item, i) => (
            <MasonryItem key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 border border-ink-200 text-ink-600 text-xs tracking-[0.2em] uppercase hover:bg-ink-900 hover:text-creme-100 hover:border-ink-900 transition-all duration-400">
            加载更多
          </button>
        </div>
      </div>
    </section>
  );
}
