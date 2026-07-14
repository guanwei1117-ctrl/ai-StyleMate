'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  ChevronRight,
  Library,
  PanelsTopLeft,
  ScanFace,
  Shirt,
  Sparkles,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const modules = [
  {
    title: 'AI 风格测评',
    desc: '把基础信息、体型数据和审美偏好合成一份风格档案。',
    href: '/onboarding',
    icon: ScanFace,
    imageNeed: '年轻用户半身或全身照，干净背景，男女/中性表达都可出现。',
  },
  {
    title: '穿搭诊断',
    desc: '上传今日 Look，得到整体印象、问题拆解和可执行修改建议。',
    href: '/score-outfit',
    icon: Camera,
    imageNeed: '一组街拍式穿搭照，画面要能看清比例、鞋子和外套层次。',
  },
  {
    title: '风格库',
    desc: '用风格画像反查适合的单品、颜色、廓形和避雷区。',
    href: '/styles',
    icon: Library,
    imageNeed: '四宫格风格拼贴：Clean Fit、学院、街头、新中式等。',
  },
];

const atlas = [
  { name: 'Clean Fit', mood: '干净、松弛、利落', tone: 'bg-[#dfe7e2]' },
  { name: '学院感', mood: '年轻、秩序、书卷气', tone: 'bg-[#d8dce8]' },
  { name: '新中式', mood: '克制、风骨、东方线条', tone: 'bg-[#e5ded5]' },
  { name: '街头日常', mood: '自在、层次、态度感', tone: 'bg-[#ded6e8]' },
];

function VisualSlot({
  label,
  note,
  className = '',
  dark = false,
}: {
  label: string;
  note: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        'relative overflow-hidden border',
        dark
          ? 'border-white/15 bg-white/[0.06] text-white'
          : 'border-ink-900/10 bg-white/45 text-ink-900',
        className,
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_48%,rgba(10,10,10,0.08)_49%,rgba(10,10,10,0.08)_51%,transparent_52%)] bg-[length:28px_28px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <span className="w-fit rounded-full border border-current/15 px-3 py-1 text-[10px] tracking-[0.2em] opacity-70">
          IMAGE SLOT
        </span>
        <div>
          <p className="font-display text-xl leading-tight">{label}</p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed opacity-55">{note}</p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  dark?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-3xl"
    >
      <p className={['mb-4 text-xs tracking-[0.28em]', dark ? 'text-creme-200/45' : 'text-ink-400'].join(' ')}>
        {eyebrow}
      </p>
      <h2
        className={[
          'font-display text-[clamp(2.25rem,5vw,5.4rem)] leading-[0.98]',
          dark ? 'text-creme-100' : 'text-ink-900',
        ].join(' ')}
      >
        {title}
      </h2>
      {copy && (
        <p className={['mt-5 max-w-xl text-sm leading-7', dark ? 'text-creme-200/48' : 'text-ink-500'].join(' ')}>
          {copy}
        </p>
      )}
    </motion.div>
  );
}

export default function BrandHome() {
  return (
    <main className="overflow-hidden bg-[#f4f1ea] text-ink-900">
      <section className="relative min-h-screen bg-[#101113] text-creme-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(113,139,128,0.28),transparent_28%),linear-gradient(115deg,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f4f1ea] to-transparent" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-28 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pb-20 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col justify-center"
          >
            <p className="mb-6 text-xs tracking-[0.32em] text-creme-200/55">
              AI PERSONAL STYLE ADVISOR
            </p>
            <h1 className="font-display text-[clamp(4.2rem,11vw,10.5rem)] leading-[0.82] tracking-normal">
              STYLE
              <br />
              MATE
            </h1>
            <p className="mt-8 max-w-xl text-[clamp(1.35rem,2.4vw,2.4rem)] font-light leading-tight text-creme-100/86">
              用 AI 建立你的个人风格档案，让每一次买衣服和出门搭配都有依据。
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-creme-100 px-6 py-3 text-sm font-medium text-ink-900 transition hover:bg-white"
              >
                开始风格测评 <ArrowRight size={16} />
              </Link>
              <Link
                href="/styles"
                className="inline-flex items-center justify-center gap-2 border border-creme-100/20 px-6 py-3 text-sm text-creme-100/80 transition hover:border-creme-100/45 hover:text-creme-100"
              >
                浏览风格库 <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="grid min-h-[560px] grid-cols-6 grid-rows-6 gap-3 lg:min-h-0"
          >
            <VisualSlot
              dark
              label="首屏主视觉"
              note="一张高级年轻感全身穿搭大片，人物占画面 60%，留出干净负空间。"
              className="col-span-6 row-span-4 rounded-[2rem] lg:col-span-4 lg:row-span-6"
            />
            <div className="col-span-3 row-span-2 rounded-[1.5rem] border border-white/12 bg-white/[0.08] p-5 backdrop-blur lg:col-span-2 lg:row-span-3">
              <Sparkles className="mb-7 h-5 w-5 text-[#c9d8d0]" />
              <p className="text-xs tracking-[0.22em] text-creme-200/45">STYLE DNA</p>
              <p className="mt-3 font-display text-4xl leading-none">87%</p>
              <p className="mt-3 text-xs leading-relaxed text-creme-200/48">
                简洁线条、低饱和色、利落比例更接近你的核心风格区间。
              </p>
            </div>
            <VisualSlot
              dark
              label="细节视觉"
              note="衣料质感、配饰或鞋包特写，用来强化高级品牌气质。"
              className="col-span-3 row-span-2 rounded-[1.5rem] lg:col-span-2 lg:row-span-3"
            />
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-y border-ink-900/10 py-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <SectionTitle
              eyebrow="THE LOGIC"
              title="不是追流行，是找到你的风格坐标。"
            />
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              {[
                ['01', '脸部与气质', '可选上传正脸照，辅助判断风格气质。'],
                ['02', '身高与比例', '用基础身体信息识别更适合的版型。'],
                ['03', '审美偏好', '把喜欢的风格转成可执行的穿搭建议。'],
              ].map(([num, title, copy]) => (
                <div key={num} className="border-l border-ink-900/12 pl-5">
                  <p className="text-xs text-ink-300">{num}</p>
                  <h3 className="mt-4 font-display text-2xl">{title}</h3>
                  <p className="mt-3 text-xs leading-6 text-ink-500">{copy}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#e8ece8] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="PRODUCT SYSTEM"
              title="三个入口，解决同一个问题。"
              copy="先让用户相信品牌审美，再用清晰入口告诉他：我可以测风格、评穿搭、查风格。"
            />
            <Link
              href="/onboarding"
              className="inline-flex w-fit items-center gap-2 border border-ink-900/20 px-5 py-3 text-sm text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
            >
              进入测评 <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {modules.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.65, delay: index * 0.08 }}
                  className="group bg-[#f8f7f2]"
                >
                  <VisualSlot
                    label={item.title}
                    note={item.imageNeed}
                    className="aspect-[4/3] rounded-none border-x-0 border-t-0"
                  />
                  <Link href={item.href} className="block p-6">
                    <div className="mb-8 flex items-center justify-between">
                      <Icon className="h-5 w-5 text-ink-500" />
                      <ArrowRight className="h-4 w-4 text-ink-300 transition group-hover:translate-x-1 group-hover:text-ink-900" />
                    </div>
                    <h3 className="font-display text-3xl">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-ink-500">{item.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionTitle
              eyebrow="REPORT PREVIEW"
              title="先给结论，再展开分析。"
              copy="测评结果不做复杂论文，先让用户马上知道自己适合什么，再给足够专业的解释。"
            />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="border border-ink-900/12 bg-[#fbfaf6]"
          >
            <div className="grid border-b border-ink-900/10 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="p-7">
                <p className="text-xs tracking-[0.25em] text-ink-300">STYLE RESULT</p>
                <h3 className="mt-8 font-display text-5xl leading-none">清冷简约</h3>
                <p className="mt-5 text-sm leading-7 text-ink-500">
                  你的核心优势是干净线条和少年感比例，适合低饱和色、直线廓形和轻量层次。
                </p>
              </div>
              <VisualSlot
                label="结果页人物图"
                note="同一用户的推荐风格示例照，最好是测评前后对比或一套完整 Look。"
                className="min-h-[320px] border-y-0 border-r-0"
              />
            </div>
            <div className="grid gap-0 md:grid-cols-3">
              {[
                ['适合颜色', '雾蓝、石灰白、炭黑、浅橄榄'],
                ['适合版型', '短外套、高腰直筒裤、窄长鞋型'],
                ['需要调整', '减少过甜元素，避免大面积高饱和撞色'],
              ].map(([title, copy]) => (
                <div key={title} className="border-b border-ink-900/10 p-6 md:border-b-0 md:border-r last:md:border-r-0">
                  <p className="text-xs tracking-[0.22em] text-ink-300">{title}</p>
                  <p className="mt-5 text-sm leading-7 text-ink-600">{copy}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#111315] px-6 py-24 text-creme-100 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="STYLE ATLAS"
              title="风格库不只是图片墙。"
              copy="每一种风格都要回答：适合谁、怎么穿、买什么、避开什么。"
              dark
            />
            <Link
              href="/styles"
              className="inline-flex w-fit items-center gap-2 border border-white/20 px-5 py-3 text-sm text-white/75 transition hover:border-white/45 hover:text-white"
            >
              看完整风格库 <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {atlas.map((item, index) => (
              <motion.div
                key={item.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: index * 0.06 }}
                className="group"
              >
                <div className={`aspect-[3/4] ${item.tone} p-4`}>
                  <VisualSlot
                    dark={false}
                    label={item.name}
                    note="对应风格的真实穿搭大片或高质量拼贴，不使用纯商品白底图。"
                    className="h-full border-ink-900/12 bg-white/25"
                  />
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-3xl">{item.name}</h3>
                  <p className="mt-2 text-sm text-creme-200/48">{item.mood}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <SectionTitle
              eyebrow="SIMPLIFIED FLOW"
              title="测评流程从六步压成三步。"
              copy="照片改为可选增强项，先降低进入门槛，再在结果页引导用户补充信息。"
            />
            <div className="space-y-4">
              {[
                ['01', '填写基础信息', '身高、体型、年龄段、日常场景。'],
                ['02', '选择喜欢的风格', '用视觉选择代替长问卷，用户更容易完成。'],
                ['03', '生成风格档案', '先显示简洁结论，再展开专业分析。'],
              ].map(([num, title, copy]) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-[64px_1fr] border-t border-ink-900/10 py-6"
                >
                  <p className="font-display text-3xl text-ink-300">{num}</p>
                  <div>
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className="mt-2 text-sm text-ink-500">{copy}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d8dce8] px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-6 text-xs tracking-[0.3em] text-ink-500">NEXT STEP</p>
              <h2 className="font-display text-[clamp(3rem,7vw,7.5rem)] leading-[0.9]">
                让用户先被审美吸引，
                <br />
                再被建议留下。
              </h2>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-ink-900 px-6 py-3 text-sm text-creme-100 transition hover:bg-ink-800"
              >
                开始风格测评 <ArrowRight size={16} />
              </Link>
              <Link
                href="/score-outfit"
                className="inline-flex items-center justify-center gap-2 border border-ink-900/20 px-6 py-3 text-sm text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
              >
                诊断今日穿搭 <Shirt size={16} />
              </Link>
            </div>
          </div>
          <VisualSlot
            label="结尾品牌视觉"
            note="多人群像或一组风格档案拼贴，强调 16-25 岁、性别不限定、审美多样。"
            className="min-h-[420px]"
          />
        </div>
      </section>
    </main>
  );
}
