'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function BrandStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 0.6], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.5], ['0%', '100%']);

  return (
    <section
      ref={ref}
      id="story"
      className="relative py-36 lg:py-48 bg-creme-100 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_#0A0A0A_1px,_transparent_1px)] bg-[length:48px_48px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <motion.p
          style={{ opacity: textOpacity, y: textY }}
          className="text-xs tracking-[0.25em] text-ink-400 mb-8"
        >
          为什么做这个
        </motion.p>

        <motion.blockquote
          style={{ opacity: textOpacity, y: textY }}
          className="font-display text-display text-ink-900 leading-tight mb-12 text-balance"
        >
          &ldquo;穿衣服这件事，
          <br />
          <span className="italic">不该是玄学。</span>&rdquo;
        </motion.blockquote>

        <motion.div
          style={{ width: lineWidth }}
          className="h-px bg-ink-200 mx-auto mb-12 max-w-[120px]"
        />

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="max-w-lg mx-auto"
        >
          <p className="text-ink-500 leading-relaxed font-light text-sm lg:text-base">
            我们相信每个人都有一个「最对」的风格区间——不是某种固定的穿搭公式，而是一种让你穿得舒服、别人看着也舒服的状态。风格没有标准答案，但一定有更适合你的解法。
          </p>
          <p className="text-ink-400 leading-relaxed font-light text-xs lg:text-sm mt-5">
            不做时尚警察，只做你的穿搭参谋。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
