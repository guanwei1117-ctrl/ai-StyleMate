'use client';

import { motion } from 'framer-motion';
import ScrollReveal from './scroll-reveal';

const INSPIRATIONS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&q=80',
    user: 'Yuki Chen',
    style: '日系清新',
    aspect: '3/4',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
    user: 'Emma Wang',
    style: '法式优雅',
    aspect: '3/5',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?w=500&q=80',
    user: 'Lin Zhao',
    style: '街头潮流',
    aspect: '3/4',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80',
    user: 'Sophie Li',
    style: '极简主义',
    aspect: '3/5',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1469504512102-900f29617541?w=500&q=80',
    user: 'Mia Zhang',
    style: '通勤穿搭',
    aspect: '3/4',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1456885284447-7dd4bb8720bf?w=500&q=80',
    user: 'Rui Huang',
    style: '美式复古',
    aspect: '3/5',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1425129812916-1e11fd7a84bc?w=500&q=80',
    user: 'Jia Liu',
    style: '新中式',
    aspect: '3/4',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1550639521-0f3a2b0b2461?w=500&q=80',
    user: 'Yan Xu',
    style: 'Y2K 千禧',
    aspect: '3/5',
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80',
    user: 'Ting Wu',
    style: '轻熟风',
    aspect: '3/4',
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=500&q=80',
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
