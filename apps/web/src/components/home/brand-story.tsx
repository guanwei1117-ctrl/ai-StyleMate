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
          我们的理念
        </motion.p>

        <motion.blockquote
          style={{ opacity: textOpacity, y: textY }}
          className="font-display text-display text-ink-900 leading-tight mb-12 text-balance"
        >
          &ldquo;风格是你不需要开口
          <br />
          <span className="italic">就能表达的自我。</span>&rdquo;
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
            穿搭不是盲目追随潮流，而是找到与自己的骨相、体型、肤色和气质最为自洽的表达方式。
            每一种风格都有它的语言，而你要做的，是找到最接近内心的那一种。
          </p>
          <p className="text-ink-400 leading-relaxed font-light text-xs lg:text-sm mt-5">
            我们不定义美，我们帮你发现——那个本来就很好的你。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
