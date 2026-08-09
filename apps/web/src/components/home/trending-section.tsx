'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import ScrollReveal from './scroll-reveal';
import { LOOKS, type Look } from '@/data/looks';

type TabKey = 'monthly' | 'all';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'monthly', label: '美月榜' },
  { key: 'all', label: '总榜单' },
];

function TrendingCard({
  look,
  index,
  tab,
}: {
  look: Look;
  index: number;
  tab: TabKey;
}) {
  const likes = tab === 'monthly' ? look.monthlyLikes : look.likes;
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
        <p className="mt-2 text-sm text-ink-500 font-light leading-relaxed line-clamp-2">
          {look.description}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-ink-800">
          <Heart size={14} className="text-[#C75D5D]" fill="#C75D5D" />
          <span className="text-sm font-medium tabular-nums">{likes.toLocaleString()}</span>
          <span className="text-xs text-ink-400 font-light">
            {tab === 'monthly' ? '本月喜欢' : '累计喜欢'}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function TrendingSection() {
  const ref = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('monthly');
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const sortedLooks = useMemo(() => {
    const metric = activeTab === 'monthly' ? 'monthlyLikes' : 'likes';
    return [...LOOKS].sort((a, b) => b[metric] - a[metric]);
  }, [activeTab]);

  return (
    <section id="trending" className="relative py-28 lg:py-36 overflow-hidden bg-creme-200">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#0A0A0A_0.5px,_transparent_0.5px)] bg-[length:32px_32px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <ScrollReveal className="mb-10">
          <p className="text-xs tracking-[0.25em] text-ink-400 mb-4">灵感墙</p>
          <h2 className="font-display text-section text-ink-900">
            大家最近<span className="italic">怎么穿</span>
          </h2>
          <p className="mt-3 text-ink-500 font-light max-w-md">
            来自社区的穿搭灵感，风格没有标准答案，但一定有更适合你的解法
          </p>
        </ScrollReveal>

        {/* 提示：当前为虚拟演示数据，图片由 AI 生成，后续将接入真实社区内容 */}
        <p className="mb-6 text-2xl text-amber-600/80">
          以下为虚拟演示数据，图片均由 AI 生成，后续将接入真实社区穿搭投稿，敬请期待。
        </p>

        {/* 榜单 Tab 切换 */}
        <div className="flex items-center gap-3 mb-8">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm tracking-wider transition-all duration-300 ${
                  active
                    ? 'bg-ink-900 text-creme-100'
                    : 'bg-transparent border border-ink-200 text-ink-500 hover:text-ink-900 hover:border-ink-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-6 lg:gap-8 overflow-x-auto pb-4 -mx-6 px-6 lg:-mx-10 lg:px-10 scrollbar-hide snap-x snap-mandatory">
          {sortedLooks.map((look, i) => (
            <div key={look.id} className="snap-start">
              <TrendingCard look={look} index={i} tab={activeTab} />
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
