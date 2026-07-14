import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import { CATEGORY_LABELS, DIMENSION_LABELS, STYLES, type StyleCard } from '@/data/styles';
import styleImages from '@/data/style-images.json';

function getStyleImage(styleId: string): string | undefined {
  return (styleImages as Record<string, string>)[styleId];
}

export function generateStaticParams() {
  return STYLES.map((style) => ({ id: style.id }));
}

function getFitCopy(style: StyleCard) {
  if (style.difficulty <= 2) return '适合刚开始建立个人风格、希望日常好执行的人。';
  if (style.difficulty === 3) return '适合已经有一定穿搭习惯，愿意在基础款上加入辨识度的人。';
  return '适合审美表达欲更强、愿意投入时间维护整体造型的人。';
}

function getCautionCopy(style: StyleCard) {
  if (style.difficulty <= 2) return '不要只买相似基础款，容易变得平淡。需要用面料、比例或小配饰做出层次。';
  if (style.difficulty === 3) return '不要把所有代表元素一次穿满。保留一两个核心符号，其他部分保持干净。';
  return '慎选廉价材质和过度堆叠。高难度风格最怕元素很多但质感跟不上。';
}

export default function StyleDetailPage({ params }: { params: { id: string } }) {
  const style = STYLES.find((item) => item.id === params.id);
  if (!style) notFound();

  const imageUrl = getStyleImage(style.id);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#f4f1ea] pt-28 pb-24 text-ink-900">
        <section className="mx-auto max-w-7xl px-6 lg:px-10">
          <Link href="/styles" className="mb-10 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={16} />
            返回风格库
          </Link>

          <div className="grid gap-10 border-b border-ink-900/10 pb-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs tracking-[0.3em] text-ink-400">STYLE FILE</p>
              <h1 className="font-display text-[clamp(3.4rem,8vw,8rem)] leading-[0.86]">{style.name}</h1>
              <p className="mt-7 max-w-xl text-sm leading-7 text-ink-500">{style.description}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="border border-ink-900/10 bg-white/45 px-3 py-1 text-xs tracking-[0.16em] text-ink-500">
                  {DIMENSION_LABELS[style.dimension]}
                </span>
                <span className="border border-ink-900 bg-ink-900 px-3 py-1 text-xs tracking-[0.16em] text-creme-100">
                  {CATEGORY_LABELS[style.category] || style.category}
                </span>
              </div>
            </div>

            <div className="overflow-hidden border border-ink-900/10 bg-[#fbfaf6]">
              <div className="aspect-[4/3] bg-[#ebe7df]">
                {imageUrl ? (
                  <img src={imageUrl} alt={style.name} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs tracking-[0.22em] text-ink-300">
                    IMAGE SLOT
                  </div>
                )}
              </div>
              <div className="flex h-2">
                {style.colorPalette.map((color) => (
                  <span key={color} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
            <aside>
              <p className="mb-4 text-xs tracking-[0.28em] text-ink-400">PHILOSOPHY</p>
              <blockquote className="font-display text-[clamp(2rem,4vw,4.5rem)] leading-[0.95]">
                “{style.philosophy}”
              </blockquote>
            </aside>

            <div className="grid gap-5 md:grid-cols-2">
              <InfoBlock title="适合谁" body={getFitCopy(style)} />
              <InfoBlock title="入门难度" body={`难度 ${style.difficulty}/5。${style.difficulty >= 4 ? '需要更强的整体控制力。' : '日常可执行度较高。'}`} />
              <InfoBlock title="避雷点" body={getCautionCopy(style)} />
              <InfoBlock title="场景建议" body="先从日常出街、上课通勤或轻社交场景开始，不建议第一次就做满全套造型。" />
            </div>
          </div>

          <div className="grid gap-5 border-t border-ink-900/10 pt-12 lg:grid-cols-3">
            <Panel title="核心单品">
              <ul className="space-y-3">
                {style.keyItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-ink-600">
                    <span className="h-1.5 w-1.5 bg-ink-900" />
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="廓形规则">
              <div className="flex flex-wrap gap-2">
                {style.silhouette.map((item) => (
                  <span key={item} className="border border-ink-900/10 bg-white/45 px-3 py-2 text-sm text-ink-600">
                    {item}
                  </span>
                ))}
              </div>
            </Panel>

            <Panel title="颜色体系">
              <div className="grid grid-cols-2 gap-3">
                {style.colorPalette.map((color) => (
                  <div key={color} className="flex items-center gap-3">
                    <span className="h-9 w-9 border border-ink-900/10" style={{ backgroundColor: color }} />
                    <span className="text-xs uppercase text-ink-400">{color}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mt-16 grid gap-6 bg-[#111315] p-8 text-creme-100 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="mb-4 text-xs tracking-[0.28em] text-creme-200/45">FIT CHECK</p>
              <h2 className="font-display text-4xl leading-none">想知道它是否真的适合你？</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-creme-200/55">
                让 StyleMate 把你的身高、体型、日常场景和审美偏好一起计算，给出适配分和调整方式。
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-creme-100 px-6 py-3 text-sm text-ink-900 transition hover:bg-white"
            >
              开始风格测评
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-ink-900/10 bg-[#fbfaf6] p-5">
      <h3 className="mb-4 text-xs tracking-[0.24em] text-ink-400">{title}</h3>
      <p className="text-sm leading-7 text-ink-600">{body}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink-900/10 bg-[#fbfaf6] p-6">
      <h2 className="mb-6 text-xs tracking-[0.24em] text-ink-400">{title}</h2>
      {children}
    </section>
  );
}
