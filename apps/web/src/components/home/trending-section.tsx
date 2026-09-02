'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import ScrollReveal from './scroll-reveal';
import { LOOKS } from '@/data/looks';
import { fetchOotdFeed, type OotdPostView } from '@/lib/ootd-api';

export default function TrendingSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const [posts, setPosts] = useState<OotdPostView[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchOotdFeed(1, 6)
      .then((data) => { if (!cancelled) setPosts(data.items); })
      .catch(() => { if (!cancelled) setPosts(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // 降级：API 失败或空数据时使用 mock 数据
  const displayPosts = (posts && posts.length > 0) ? posts : LOOKS.slice(0, 6);
  const isMock = !posts || posts.length === 0;

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

        {loading ? (
          <div className="flex items-center justify-center py-16 text-ink-400">
            <span className="text-sm">加载中...</span>
          </div>
        ) : (
          <>
            {isMock && (
              <p className="mb-6 text-xs text-ink-400">
                暂无社区穿搭 · 以下为灵感示例
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {(displayPosts as any[]).map((item, i) => {
                // 兼容 API 返回和 mock 数据两种格式
                const imageUrl = (item as any).imageData || (item as any).image;
                const styleLabel = (item as any).styleTags || (item as any).style || '穿搭';
                const author = (item as any).userId?.slice(0, 8) || (item as any).by || '匿名';
                const likes = (item as any).likeCount ?? (item as any).likes ?? 0;
                const linkHref = '/ootd';

                return (
                                <motion.div
                                  key={item.id || i}
                                  initial={{ opacity: 0, y: 24 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                <Link
                                  href={linkHref}
                                  className="group cursor-pointer block"
                                >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                      <img
                        src={imageUrl}
                        alt={styleLabel}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-creme-100/90 backdrop-blur-sm text-ink-800 text-[10px] tracking-wider">
                        {styleLabel}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-ink-600 font-light">{author}</span>
                      <div className="flex items-center gap-1 text-ink-800">
                        <Heart size={13} className="text-[#C75D5D]" fill="#C75D5D" />
                        <span className="text-sm font-medium tabular-nums">{likes.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}