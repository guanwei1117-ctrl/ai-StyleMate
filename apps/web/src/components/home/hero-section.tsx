'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 40]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-ink-900">
      {/* Background image — 精确控制人像位置，避免缩放裁切 */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0">
        <img
          src="/images/home/image.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '60% 30%' }}
        />
        {/* 渐变 overlay — 加强以提升文字可读性，避免压人脸 */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/20 to-ink-900/70" />
      </motion.div>

      {/* 文字区独立渐变遮罩 — 任何缩放下保证文字可读性，图片大部分区域保留原样 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[20%] bottom-[10%] z-0 bg-gradient-to-b from-transparent via-ink-900/30 to-ink-900/70"
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div style={{ y: textY }}>
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            className="text-xs lg:text-sm tracking-[0.25em] text-creme-200/60 mb-6"
          >
            穿对衣服，比买贵的重要
          </motion.p>

          {/* Main title — text-display (36-72px) 替代 text-hero (48-112px) */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
            className="font-display text-display text-creme-100 mb-8 leading-[1.1] text-balance"
          >
            测一测：你到底
            <br />
            <span className="italic">适合怎么穿？</span>
          </motion.h1>

          {/* Subtitle — 对比度从 50% 提到 85%，行高 1.75 */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.65 }}
            className="text-creme-100/90 text-lg lg:text-xl max-w-lg mx-auto font-normal leading-[1.75] tracking-wide"
          >
            不用看时尚杂志，你的身材已经在告诉你答案了
          </motion.p>

          {/* CTA — 3+1 布局：1 主（深底白字） + 3 次（浅底）横排 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.9 }}
            className="mt-10 flex flex-col items-center gap-3 w-full max-w-xl"
          >
            {/* 主 CTA — 深底白字，第一眼焦点 */}
            <a
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:px-12 py-4 bg-ink-900 text-creme-100 text-base font-medium tracking-wider shadow-lift hover:bg-ink-800 transition-all duration-400"
            >
              测一测 · 我适合怎么穿
            </a>
            {/* 3 个次按钮横排 — 等宽 + 半透明白底（柔化割裂感） */}
            <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
              <a
                href="/styles"
                className="flex-1 min-w-[112px] inline-flex items-center justify-center px-4 py-2.5 bg-creme-100/85 text-ink-900 text-xs tracking-wider hover:bg-creme-200 transition-all duration-400"
              >
                看风格百科
              </a>
              <a
                href="/styles/camera"
                className="flex-1 min-w-[112px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-creme-100/85 text-ink-900 text-xs tracking-wider hover:bg-creme-200 transition-all duration-400"
              >
                <span aria-hidden>📸</span> 拍立搭
              </a>
              <a
                href="/wardrobe"
                className="flex-1 min-w-[112px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-creme-100/85 text-ink-900 text-xs tracking-wider hover:bg-creme-200 transition-all duration-400"
              >
                <span aria-hidden>👔</span> 衣橱
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator — 加大字号、对比度，加粗 chevron */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-creme-200/70 hover:text-creme-100 text-xs tracking-[0.25em] cursor-pointer transition-colors duration-300">往下看，有好东西</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-creme-200/60" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    </section>
  );
}
