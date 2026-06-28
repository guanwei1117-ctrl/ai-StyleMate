'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollReveal from './scroll-reveal';

const TRENDING_LOOKS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80',
    style: '极简主义',
    title: '极简层次穿搭',
    pieces: 4,
    by: '张微',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
    style: '法式优雅',
    title: '毫不费力的时髦',
    pieces: 3,
    by: '李娜',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
    style: '韩系简约',
    title: '温柔通勤日常',
    pieces: 4,
    by: '金秀雅',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
    style: '日系清新',
    title: '周末柔软时光',
    pieces: 3,
    by: '陈雨',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    style: '街头潮流',
    title: '都市街头态度',
    pieces: 5,
    by: '王放',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
    style: '美式复古',
    title: '九零复古回潮',
    pieces: 4,
    by: '赵磊',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&q=80',
    style: '新中式',
    title: '东方留白之美',
    pieces: 4,
    by: '刘梅',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    style: '原宿风',
    title: '不被定义的色彩',
    pieces: 6,
    by: '林小希',
  },
];

function TrendingCard({ look, index }: { look: (typeof TRENDING_LOOKS)[0]; index: number }) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      className="group flex-shrink-0 w-[280px] lg:w-[340px] cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
        <img
          src={look.image}
          alt={look.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        <span className="absolute top-4 left-4 px-3 py-1.5 bg-creme-100/90 backdrop-blur-sm text-ink-800 text-[11px] tracking-wider">
          {look.style}
        </span>
      </div>
      <div className="mt-4 px-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-ink-800 tracking-wide">{look.title}</h3>
          <span className="text-xs text-ink-400 font-light">{look.pieces} 件单品</span>
        </div>
        <p className="text-xs text-ink-400 mt-1 font-light">来自 {look.by}</p>
      </div>
    </motion.a>
  );
}

export default function TrendingSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section id="trending" className="relative py-28 lg:py-36 overflow-hidden bg-creme-200">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#0A0A0A_0.5px,_transparent_0.5px)] bg-[length:32px_32px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <ScrollReveal className="mb-14">
          <p className="text-xs tracking-[0.25em] text-ink-400 mb-4">本周精选</p>
          <h2 className="font-display text-section text-ink-900">
            流行<span className="italic">穿搭</span>
          </h2>
          <p className="mt-3 text-ink-500 font-light max-w-md">
            本周社区最受欢迎的穿搭灵感，精选自真实用户的风格表达
          </p>
        </ScrollReveal>

        <div className="flex gap-6 lg:gap-8 overflow-x-auto pb-4 -mx-6 px-6 lg:-mx-10 lg:px-10 scrollbar-hide snap-x snap-mandatory">
          {TRENDING_LOOKS.map((look, i) => (
            <div key={look.id} className="snap-start">
              <TrendingCard look={look} index={i} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
