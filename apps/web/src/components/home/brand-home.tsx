'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Library, Trophy } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const featured = {
  name: 'CLEAN MINIMAL',
  title: '清冷简约风',
  likes: 2486,
  image: '/styles/minimalist/Extreme_minimalist_fashion__a__2026-06-30T06-51-32.png',
};

const hotCards = [
  {
    name: 'NEW CHINESE',
    blogger: '@style_cn_new',
    likes: 1928,
    image: '/styles/cn_new_chinese/Modern_Chinese_neo_traditional_2026-06-30T06-49-15.png',
  },
  {
    name: 'OLD MONEY',
    blogger: '@quiet_luxury',
    likes: 1742,
    image: '/styles/old_money/Old_money_quiet_luxury_fashion_2026-06-30T06-51-37.png',
  },
  {
    name: 'KOREAN STREET',
    blogger: '@kr_street_fit',
    likes: 1639,
    image: '/styles/kr_street/Korean_street_idol_inspired_fa_2026-06-30T06-49-48.png',
  },
];

const libraryShots = [
  { name: '法式', image: '/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png' },
  { name: '港风', image: '/styles/hk_retro/Hong_Kong_80s_90s_retro_glamou_2026-06-30T06-49-43.png' },
  { name: 'Y2K', image: '/styles/y2k/Y2K_millennium_fashion__a_youn_2026-06-30T06-52-14.png' },
  { name: '暗黑诗意', image: '/styles/dark_poetry/Dark_poetic_avant_garde_fashio_2026-06-30T06-52-45.png' },
  { name: '芭蕾核', image: '/styles/ballet_core/Balletcore_dancer_fashion__a_g_2026-06-30T06-52-52.png' },
  { name: '机能户外', image: '/styles/gorpcore/Gorpcore_outdoor_aesthetic_fas_2026-06-30T06-53-59.png' },
];

const leaderboard = [
  { rank: '01', name: '极简高级', likes: 3201, image: '/styles/quiet_luxury/Quiet_luxury_silent_wealth_fas_2026-06-30T06-51-40.png' },
  { rank: '02', name: '新中式', likes: 2864, image: '/styles/cn_new_chinese/Modern_Chinese_neo_traditional_2026-06-30T06-49-15.png' },
  { rank: '03', name: '法式慵懒', likes: 2719, image: '/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png' },
  { rank: '04', name: '街头日常', likes: 2450, image: '/styles/us_street/American_streetwear_hip_hop_fa_2026-06-30T06-48-37.png' },
];

function MStripe() {
  return (
    <div className="grid h-1 w-full grid-cols-3">
      <span className="bg-[#0066b1]" />
      <span className="bg-[#1c69d4]" />
      <span className="bg-[#e22718]" />
    </div>
  );
}

function ImagePanel({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#111] ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover transition duration-1000 hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
    </div>
  );
}

function SectionHeader({ index, title, copy }: { index: string; title: string; copy?: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.65 }} className="mb-10 flex flex-col gap-5 border-t border-white/20 pt-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-4 text-xs font-bold tracking-[0.28em] text-white/38">{index}</p>
        <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-black uppercase leading-[0.92] tracking-[-0.03em] text-white">{title}</h2>
      </div>
      {copy && <p className="max-w-md text-sm font-light leading-7 text-white/48">{copy}</p>}
    </motion.div>
  );
}

export default function BrandHome() {
  return (
    <main className="overflow-hidden bg-black text-white">
      <section className="relative min-h-screen bg-black pt-20">
        <div className="absolute inset-0 opacity-70">
          <ImagePanel src="/styles/old_money/Old_money_quiet_luxury_fashion_2026-06-30T06-51-37.png" alt="Style archive hero" className="h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/20" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }} className="flex flex-col justify-end pb-8">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.32em] text-white/45">VISUAL STYLE LIBRARY</p>
            <h1 className="text-[clamp(4.8rem,13vw,12rem)] font-black uppercase leading-[0.78] tracking-[-0.06em] text-white">
              STYLE
              <br />
              ARCHIVE
            </h1>
            <p className="mt-8 max-w-xl text-lg font-light leading-8 text-white/68">
              用图片先抓住审美，再进入风格、博主、喜爱榜与穿搭灵感。
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/styles" className="inline-flex h-12 items-center justify-center gap-3 border border-white bg-white px-8 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white">
                进入风格库 <ArrowRight size={16} />
              </Link>
              <Link href="/onboarding" className="inline-flex h-12 items-center justify-center gap-3 border border-white/35 px-8 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-white">
                开始测评
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.12 }} className="grid min-h-[520px] grid-cols-6 grid-rows-6 gap-3 self-end">
            <ImagePanel src="/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png" alt="French style" className="col-span-3 row-span-3" />
            <ImagePanel src="/styles/cn_new_chinese/Modern_Chinese_neo_traditional_2026-06-30T06-49-15.png" alt="New Chinese style" className="col-span-3 row-span-4" />
            <div className="col-span-3 row-span-3 border border-white/18 bg-black/68 p-5 backdrop-blur">
              <MStripe />
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-white/42">CURATED</p>
              <p className="mt-3 text-4xl font-black uppercase leading-none">80+</p>
              <p className="mt-3 text-xs font-light leading-6 text-white/48">风格图片、博主参考、来源链接与喜爱榜排序。</p>
            </div>
            <ImagePanel src="/styles/kr_street/Korean_street_idol_inspired_fa_2026-06-30T06-49-48.png" alt="Korean street style" className="col-span-3 row-span-2" />
          </motion.div>
        </div>
      </section>

      <MStripe />

      <section className="px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeader index="01 / HOT" title="热门精选" copy="先展示最有视觉冲击的风格图，让用户第一时间进入图片审美状态。" />
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid border border-white/16 bg-[#0d0d0d] lg:grid-cols-[1.15fr_0.85fr]">
            <ImagePanel src={featured.image} alt={featured.title} className="min-h-[560px]" />
            <div className="flex flex-col justify-between p-7 lg:p-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/38">FEATURED STYLE</p>
                <h3 className="mt-8 text-[clamp(3rem,7vw,6.5rem)] font-black uppercase leading-[0.88] tracking-[-0.05em]">{featured.name}</h3>
                <p className="mt-6 text-xl font-light text-white/58">{featured.title}</p>
              </div>
              <div className="mt-12">
                <div className="mb-8 grid grid-cols-2 border-y border-white/14">
                  <div className="border-r border-white/14 py-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">likes</p>
                    <p className="mt-2 text-3xl font-black">{featured.likes}</p>
                  </div>
                  <div className="py-5 pl-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">rank</p>
                    <p className="mt-2 text-3xl font-black">#01</p>
                  </div>
                </div>
                <Link href="/styles" className="inline-flex h-12 items-center justify-center gap-3 border border-white px-8 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black">
                  查看风格 <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeader index="02 / LIBRARY" title="风格库入口" copy="从完整风格库中浏览图片、翻页、看来源、看博主信息，后续再接投稿审核。" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {libraryShots.map((item, index) => (
              <motion.article key={item.name} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.55, delay: index * 0.04 }} className="group border border-white/14 bg-[#0d0d0d]">
                <ImagePanel src={item.image} alt={item.name} className="aspect-[16/11]" />
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">STYLE CATEGORY</p>
                    <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.02em]">{item.name}</h3>
                  </div>
                  <ArrowRight className="text-white/35 transition group-hover:translate-x-1 group-hover:text-white" size={18} />
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 flex justify-end">
            <Link href="/styles" className="inline-flex h-12 items-center justify-center gap-3 border border-white px-8 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black">
              进入完整风格库 <Library size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0d0d0d] px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeader index="03 / RANK" title="喜爱榜" copy="用点赞数形成排序，让用户快速看到大家最喜欢的风格。" />
          <div className="divide-y divide-white/12 border-y border-white/12">
            {leaderboard.map((item) => (
              <motion.div key={item.rank} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.55 }} className="grid items-center gap-5 py-5 md:grid-cols-[90px_140px_1fr_160px]">
                <p className="text-4xl font-black text-white/28">{item.rank}</p>
                <ImagePanel src={item.image} alt={item.name} className="aspect-[4/3]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/35">FAVORITE STYLE</p>
                  <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.03em]">{item.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-white/70 md:justify-end">
                  <Heart size={18} />
                  <span className="text-2xl font-black">{item.likes}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex justify-end">
            <Link href="/styles" className="inline-flex h-12 items-center justify-center gap-3 border border-white/35 px-8 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-white">
              查看完整喜爱榜 <Trophy size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
