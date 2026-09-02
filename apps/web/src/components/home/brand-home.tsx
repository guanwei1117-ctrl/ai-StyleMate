'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, CheckCircle2, Palette, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const styleCards = [
  {
    name: '法式松弛',
    copy: '干净、自然、不费力',
    image: '/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
  },
  {
    name: '韩系简约',
    copy: '比例清楚，日常好穿',
    image: '/styles/kr_effortless/Korean_effortless_minimal_fashi_2026-06-30T06-49-46.png',
  },
  {
    name: '通勤质感',
    copy: '得体、轻熟、有精神',
    image: '/styles/office_chic/Office_chic_power_dressing__a_p_2026-06-30T06-53-28.png',
  },
];

const featureCards = [
  {
    icon: Sparkles,
    title: '测风格',
    copy: '3 分钟生成个人方向。',
    href: '/onboarding',
  },
  {
    icon: Camera,
    title: '看今天',
    copy: '上传 Look，马上知道怎么改。',
    href: '/score-outfit',
  },
  {
    icon: Palette,
    title: '找灵感',
    copy: '看风格、单品、配色。',
    href: '/styles',
  },
];

const steps = [
  ['01', '基础信息', '身高、体重、场景。'],
  ['02', '审美偏好', '喜欢什么、想避开什么。'],
  ['03', '建议报告', '风格、版型、改法。'],
];

const diagnosisTags = ['比例', '色彩', '场景', '协调性', '趋势', '创意', '身材适配', '实穿性'];

function SectionHeader({ label, title, copy }: { label: string; title: string; copy: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-[#9b8f80]">{label}</p>
        <h2 className="font-display text-[clamp(2rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.035em] text-[#2d2926]">{title}</h2>
      </div>
      <p className="max-w-xl text-sm leading-7 text-[#7a7168]">{copy}</p>
    </motion.div>
  );
}

function StyleImageCard({ item, index }: { item: typeof styleCards[number]; index: number }) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-[#fffdf8] shadow-[0_18px_50px_rgba(83,65,45,0.08)]"
    >
      <div className="aspect-[4/3] bg-[#efe7da]">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-5">
        <h3 className="font-display text-3xl leading-none text-[#2d2926]">{item.name}</h3>
        <p className="mt-3 text-sm text-[#7a7168]">{item.copy}</p>
      </div>
    </motion.article>
  );
}

export default function BrandHome() {
  return (
    <main className="overflow-hidden bg-[#f7f2ea] text-[#2d2926]">
      <section className="relative px-6 pb-20 pt-28 lg:px-10 lg:pb-28 lg:pt-36">
        <div className="pointer-events-none absolute left-[-10%] top-20 h-80 w-80 rounded-full bg-[#e9cfc6]/55 blur-3xl" />
        <div className="pointer-events-none absolute right-[-8%] top-28 h-96 w-96 rounded-full bg-[#dfe8d8]/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <p className="mb-5 inline-flex rounded-full border border-[#e3d7c8] bg-[#fffdf8]/80 px-4 py-2 text-xs font-medium tracking-[0.18em] text-[#7c8f73]">
              AI 穿搭助手
            </p>
            <h1 className="font-display text-[clamp(3.2rem,8vw,6.8rem)] leading-[0.9] tracking-[-0.055em] text-[#2d2926]">
              今天穿什么？
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#6f665d] sm:text-lg">
              测风格、看搭配、给改法。少一点纠结，多一点好穿。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding" className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#7c8f73] px-7 py-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,143,115,0.24)] transition hover:bg-[#6d8065]">
                开始风格测评 <ArrowRight size={16} />
              </Link>
              <Link href="/score-outfit" className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[#d8cbbb] bg-[#fffdf8] px-7 py-4 text-sm font-semibold text-[#2d2926] transition hover:border-[#7c8f73] hover:text-[#5e7457]">
                诊断今日穿搭
              </Link>
              <Link href="/styles" className="inline-flex h-13 items-center justify-center rounded-full px-5 py-4 text-sm font-medium text-[#7a7168] transition hover:text-[#2d2926]">
                浏览风格库
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-[#6f665d] sm:grid-cols-3">
              {['3 分钟建立风格档案', '拆解比例、色彩和场景', '给出马上能改的建议'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#7c8f73]" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
            <div className="grid gap-4 sm:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-4 pt-10">
                <div className="rounded-[2rem] border border-[#eadfce] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(83,65,45,0.08)]">
                  <p className="text-xs tracking-[0.2em] text-[#9b8f80]">STYLE</p>
                  <h3 className="mt-4 font-display text-4xl leading-none">韩系简约</h3>
                  <p className="mt-3 text-sm leading-6 text-[#7a7168]">干净、轻松、日常。</p>
                </div>
                <div className="rounded-[2rem] border border-[#eadfce] bg-[#e9cfc6]/55 p-5">
                  <p className="text-xs tracking-[0.2em] text-[#8b7067]">AVOID</p>
                  <p className="mt-3 text-sm leading-6 text-[#6f5048]">低腰线、重鞋型。</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-[2.4rem] border border-[#eadfce] bg-[#fffdf8] p-3 shadow-[0_24px_70px_rgba(83,65,45,0.12)]">
                <img src="/styles/kr_effortless/Korean_effortless_minimal_fashi_2026-06-30T06-49-46.png" alt="StyleMate outfit preview" className="h-[520px] w-full rounded-[1.8rem] object-cover" />
              </div>
            </div>
            <div className="absolute bottom-6 left-4 right-4 rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-[0_18px_40px_rgba(83,65,45,0.12)] backdrop-blur md:left-auto md:w-72">
              <p className="text-xs tracking-[0.2em] text-[#9b8f80]">LOOK DIAGNOSIS</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-[#6f665d]">
                <span className="rounded-full bg-[#edf3e9] px-2 py-2">比例 82</span>
                <span className="rounded-full bg-[#f4e2dc] px-2 py-2">色彩 88</span>
                <span className="rounded-full bg-[#e7eef3] px-2 py-2">实穿 91</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="WHAT YOU CAN DO" title="先解决今天怎么穿" copy="首页不再只是展示风格，而是直接把用户带到测评、诊断和灵感三个高价值入口。" />
          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.06 }}>
                  <Link href={item.href} className="group block h-full rounded-[2rem] border border-[#eadfce] bg-[#fffdf8] p-6 shadow-[0_14px_40px_rgba(83,65,45,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cdd9c4] hover:shadow-lift">
                    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf3e9] text-[#6d8065]">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display text-3xl leading-none text-[#2d2926]">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#7a7168]">{item.copy}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7c8f73]">
                      进入 <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf8] px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="ASSESSMENT" title="测评不复杂" copy="几个基础问题，换一份清楚建议。" />
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(([index, title, copy]) => (
              <motion.article key={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-[2rem] border border-[#eadfce] bg-[#f7f2ea] p-6">
                <p className="font-display text-5xl leading-none text-[#d2b8aa]">{index}</p>
                <h3 className="mt-8 text-xl font-semibold text-[#2d2926]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#7a7168]">{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-[#9b8f80]">DIAGNOSIS</p>
            <h2 className="font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.95] tracking-[-0.04em] text-[#2d2926]">拍一张，看问题</h2>
            <p className="mt-5 text-sm leading-7 text-[#7a7168]">比例、色彩、场景，哪里要改，一眼看清。</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {diagnosisTags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#eadfce] bg-[#fffdf8] px-4 py-2 text-sm text-[#6f665d]">{tag}</span>
              ))}
            </div>
            <Link href="/score-outfit" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#7a93a8] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#657f94]">
              诊断今日穿搭 <Wand2 size={16} />
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.55 }} className="rounded-[2.4rem] border border-[#eadfce] bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(83,65,45,0.1)]">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs tracking-[0.22em] text-[#9b8f80]">REPORT PREVIEW</p>
              <span className="rounded-full bg-[#edf3e9] px-3 py-1 text-sm font-semibold text-[#6d8065]">86</span>
            </div>
            <div className="space-y-3">
              {['提高腰线', '鞋包呼应', '外套短一点'].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-[#f7f2ea] p-4 text-sm leading-6 text-[#6f665d]">
                  <span className="font-display text-2xl leading-none text-[#d2b8aa]">0{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#fffdf8] px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader label="STYLE LIBRARY" title="从灵感开始也可以" copy="如果你还不知道喜欢什么，可以先看风格库。每个风格都有单品、配色和适配建议。" />
          <div className="grid gap-5 md:grid-cols-3">
            {styleCards.map((item, index) => <StyleImageCard key={item.name} item={item} index={index} />)}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/styles" className="inline-flex items-center gap-2 rounded-full border border-[#d8cbbb] bg-[#f7f2ea] px-7 py-4 text-sm font-semibold text-[#2d2926] transition hover:border-[#7c8f73] hover:text-[#5e7457]">
              查看 80 种风格 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[2rem] border border-[#eadfce] bg-[#fffdf8] p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-[#7c8f73]" size={20} />
            <p className="max-w-3xl text-sm leading-7 text-[#7a7168]">
              照片只用于穿搭分析，不做身份识别。档案可随时清除。
            </p>
          </div>
          <Link href="/onboarding" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#2d2926] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4a4038]">
            开始测评
          </Link>
        </div>
      </section>
    </main>
  );
}
