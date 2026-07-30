'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Megaphone, Compass, Send, Heart, MessageSquare } from 'lucide-react';

type TabId = 'intro' | 'notice' | 'guide' | 'contribute' | 'support' | 'contact';

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: 'intro', label: '介绍', icon: BookOpen },
  { id: 'notice', label: '公告', icon: Megaphone },
  { id: 'guide', label: '说明书', icon: Compass },
  { id: 'contribute', label: '投稿', icon: Send },
  { id: 'support', label: '资助', icon: Heart },
  { id: 'contact', label: '联系', icon: MessageSquare },
];

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutDialog({ open, onClose }: AboutDialogProps) {
  const [tab, setTab] = useState<TabId>('intro');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/45 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden border border-ink-900/10 bg-[#fbfaf6] shadow-[0_24px_80px_rgba(10,10,10,0.28)]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-ink-900/10 px-6 py-5 sm:px-8">
              <div>
                <p className="mb-1 text-xs tracking-[0.22em] text-ink-400">ABOUT</p>
                <h2 className="font-display text-3xl leading-none text-ink-900 sm:text-4xl">关于 StyleMate</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-ink-400 transition hover:text-ink-900"
                aria-label="关闭"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 overflow-x-auto border-b border-ink-900/10 bg-[#f4f1ea]/60">
              {TABS.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm transition sm:px-6 ${
                      active
                        ? 'border-b-2 border-ink-900 text-ink-900'
                        : 'border-b-2 border-transparent text-ink-500 hover:text-ink-900'
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="grow overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              {tab === 'intro' && <IntroSection />}
              {tab === 'notice' && <NoticeSection />}
              {tab === 'guide' && <GuideSection />}
              {tab === 'contribute' && <ContributeSection />}
              {tab === 'support' && <SupportSection />}
              {tab === 'contact' && <ContactSection />}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-ink-900/10 bg-[#f4f1ea]/60 px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-ink-900 px-5 py-3 text-sm text-creme-100 transition hover:bg-ink-800"
              >
                知道了
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============ 子区块 ============ */

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-display text-2xl leading-none text-ink-900">{children}</h3>
      {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-900/10 pt-5 first:border-t-0 first:pt-0">
      <p className="mb-2 text-xs tracking-[0.18em] text-ink-400">{title}</p>
      <div className="text-sm leading-7 text-ink-600">{children}</div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="bg-white/70 px-2.5 py-1 text-xs text-ink-500">{children}</span>;
}

function IntroSection() {
  return (
    <div className="space-y-6">
      <SectionTitle hint="一段关于 StyleMate 是什么、为什么做的简短说明。">
        我们是谁
      </SectionTitle>
      <Block title="一句话">
        StyleMate 是一个把穿搭建议从「玄学」变成「可执行」的风格参谋——不做时尚警察，只做你身边那个很会穿的朋友。
      </Block>
      <Block title="核心理念">
        <p>
          每个人都有一个「最对」的风格区间——不是固定公式，而是一种让你穿得舒服、别人看着也舒服的状态。风格没有标准答案，但一定有更适合你的解法。
        </p>
        <p className="mt-3 text-ink-400">真诚建议，不敷衍每一件衣服。</p>
      </Block>
      <Block title="目前提供">
        <div className="flex flex-wrap gap-2">
          <Pill>风格百科</Pill>
          <Pill>风格测评</Pill>
          <Pill>AI 风格档案</Pill>
          <Pill>博主语言风格</Pill>
          <Pill>智能衣橱</Pill>
          <Pill>灵感墙</Pill>
        </div>
      </Block>
    </div>
  );
}

function NoticeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle hint="版本更新、活动与重要通知会放在这里。">最新公告</SectionTitle>
      <Block title="2026.07 · v1 风格测评上线">
        <p>
          三步问卷（基础 → 喜好 → 生成）已稳定，照片全部选填；第三步可自选博主语言风格，让 AI 报告贴近你喜欢的博主口吻。
        </p>
      </Block>
      <Block title="关于 AI 报告">
        <p>
          AI 分析依赖大模型服务，偶尔可能因网络或限流失败。失败时会自动回落到本地规则报告，依然可以拿到风格匹配结果和三支柱评分。
        </p>
      </Block>
      <Block title="隐私提醒">
        <p>
          照片仅在本次分析中使用，不会长期存储；风格档案会保存在你的本地浏览器，可随时在测评页清除。
        </p>
      </Block>
    </div>
  );
}

function GuideSection() {
  return (
    <div className="space-y-6">
      <SectionTitle hint="怎么用、有什么功能，一页讲清楚。">总体说明书</SectionTitle>

      <Block title="01 · 风格测评（/onboarding）">
        <p>三步走：</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>基础：填性别、身高、体重、年龄（必填）；照片、三围、职业、场景选填。</li>
          <li>喜好：选预算、穿衣目标、优先级、风格接受度、气候城市；风格库可搜索多选，都可跳过。</li>
          <li>生成：确认自述，可选一位博主语言风格，点击「生成风格档案」即可。</li>
        </ul>
        <p className="mt-3 text-ink-400">报告包含：核心/次级/慎选风格、三支柱评分、体型解读、避雷建议、AI 深度分析（可选）。</p>
      </Block>

      <Block title="02 · 风格百科（/styles）">
        <p>浏览 80+ 种风格卡片，含核心单品、廓形、配色、难度，点击查看完整档案。</p>
      </Block>

      <Block title="03 · 智能衣橱（/wardrobe）">
        <p>录入你的单品，根据风格档案搭配建议（持续完善中）。</p>
      </Block>

      <Block title="04 · 灵感墙（#trending）">
        <p>瀑布流灵感图，点击可跳转对应风格详情。</p>
      </Block>

      <Block title="小贴士">
        <ul className="list-inside list-disc space-y-1">
          <li>不确定的选项全部可以跳过，不会阻塞流程。</li>
          <li>自述框可以手改，系统会自动提取关键词。</li>
          <li>报告生成后可随时「重新测试」覆盖旧档案。</li>
        </ul>
      </Block>
    </div>
  );
}

function ContributeSection() {
  return (
    <div className="space-y-6">
      <SectionTitle hint="欢迎你一起让风格库更丰富。">投稿</SectionTitle>
      <Block title="可以投什么">
        <ul className="list-inside list-disc space-y-1">
          <li>新风格条目（含名称、描述、核心单品、配色、参考图）</li>
          <li>博主语言风格建议（人设、口吻、标志性用语）</li>
          <li>避雷案例 / 真人试穿对比</li>
          <li>风格测评的体验反馈与 bug</li>
        </ul>
      </Block>
      <Block title="投稿方式">
        <p>把内容整理好后，通过「联系」标签页的邮箱或表单发给我们，附上你的署名和参考来源。我们会在一周内回复是否收录。</p>
      </Block>
      <Block title="收录原则">
        <p className="text-ink-500">真实可穿、来源清晰、不营销、不抄袭。商业软广暂不收录。</p>
      </Block>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="space-y-6">
      <SectionTitle hint="如果 StyleMate 帮到了你，欢迎支持我们继续做下去。">资助</SectionTitle>
      <Block title="为什么需要资助">
        <p>
          AI 调用、图片存储、服务器与日常维护都需要成本。你的支持能让我们保持独立判断、不靠软广变现，把建议做真诚。
        </p>
      </Block>
      <Block title="支持方式">
        <ul className="list-inside list-disc space-y-1">
          <li>小额赞助：扫码或点击「赞助」按钮，金额随意。</li>
          <li>持续会员：享受高级 AI 报告额度、衣橱云同步等（规划中）。</li>
          <li>资源对接：GPU、模型 API、设计合作都可以聊。</li>
        </ul>
      </Block>
      <Block title="透明承诺">
        <p className="text-ink-500">所有资助用于产品研发与运营，不用于个人分红。每季度会在公告里公开收支简报。</p>
      </Block>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="space-y-6">
      <SectionTitle hint="遇到问题、想吐槽、想合作，都可以从这里找到我们。">与管理员沟通</SectionTitle>
      <Block title="邮箱">
        <p>admin@stylemate.app（问题反馈、投稿、商务合作）</p>
      </Block>
      <Block title="社群">
        <p>微信群 / QQ 群入口会在公告区不定期开放，避免爬虫灌水。</p>
      </Block>
      <Block title="反馈表单">
        <p>页面右下角的「反馈」按钮可快速提交问题，会自动带上当前页面与设备信息（不含个人数据）。</p>
      </Block>
      <Block title="响应时间">
        <p className="text-ink-500">工作日 48 小时内回复；紧急 bug 优先处理。</p>
      </Block>
    </div>
  );
}
