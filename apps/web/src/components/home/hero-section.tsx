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
      {/* Background image */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/styles/quiet_luxury/Quiet_luxury_silent_wealth_fas_2026-06-30T06-51-40.png')] bg-cover bg-center" />
        {/* Lighter gradient — more natural, less dramatic */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/25 via-transparent to-ink-900/50" />
      </motion.div>

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

          {/* Main title — Chinese forward, more approachable */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
            className="font-display text-hero text-creme-100 mb-6 text-balance"
          >
            测一测：你到底
            <br />
            <span className="italic">适合怎么穿？</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.65 }}
            className="text-creme-200/50 text-base lg:text-lg max-w-lg mx-auto font-light leading-relaxed"
          >
            不用看时尚杂志，你的身材已经在告诉你答案了
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.9 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/styles"
              className="inline-block px-8 py-3.5 bg-creme-100 text-ink-900 text-sm tracking-wider hover:bg-creme-200 transition-all duration-400"
            >
              看看风格百科 →
            </a>
            <a
              href="/onboarding"
              className="inline-block px-8 py-3.5 border border-creme-100/25 text-creme-100 text-sm tracking-wider hover:bg-creme-100/10 transition-all duration-400"
            >
              测测你的穿搭人设 👀
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-creme-200/30 text-[10px] tracking-[0.2em]">往下看，有好东西</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-creme-200/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
