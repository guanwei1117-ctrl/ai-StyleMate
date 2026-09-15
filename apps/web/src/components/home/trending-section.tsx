'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import ScrollReveal from './scroll-reveal';
import { LOOKS } from '@/data/looks';

/**
 * 首页灵感墙 — 静态展示
 *
 * 设计理由：
 * - 已登录用户访问首页会被 redirect 到 /memory，根本看不到 trending
 * - 去掉 API 调用（fetchOotdFeed）+ useState/useEffect → 渲染更快、零流量
 * - 未登录用户看到的是产品方精选的 6 张风格图（不是用户发布），反而更聚焦"灵感"主题
 */
export default function TrendingSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  // 静态取前 6 张
  const displayPosts = LOOKS.slice(0, 6);

  return (
    <section id="trending" ref={ref} className="relative py-28 lg:py-36 overflow-hidden bg-creme-200">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {displayPosts.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                href={'/ootd'}
                className="group cursor-pointer block"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.style}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-creme-100/90 backdrop-blur-sm text-ink-800 text-[10px] tracking-wider">
                    {item.style}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-ink-600 font-light">{item.by}</span>
                  <div className="flex items-center gap-1 text-ink-800">
                    <Heart size={13} className="text-[#C75D5D]" fill="#C75D5D" />
                    <span className="text-sm font-medium tabular-nums">{item.likes.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
