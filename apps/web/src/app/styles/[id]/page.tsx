import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Shirt, Ruler, Palette, Sun, Snowflake, AlertTriangle } from 'lucide-react';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import { FavoriteButton, ShareButton } from '@/components/styles/style-actions';
import StyleCtaUpload from '@/components/styles/style-cta-upload';
import { CATEGORY_LABELS, DIMENSION_LABELS, STYLES, type StyleCard } from '@/data/styles';
import { LOOKS } from '@/data/looks';
import styleImages from '@/data/style-images.json';

const STYLE_IMAGES = styleImages as Record<string, string>;

function getStyleImage(styleId: string): string | undefined {
  return STYLE_IMAGES[styleId];
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

const BODY_SHAPE_LABELS: Record<string, string> = {
  pearShape: '梨形身材',
  appleShape: '苹果形身材',
  hourglass: '沙漏形身材',
  rectangle: '矩形身材',
  invertedTriangle: '倒三角身材',
};

export function generateStaticParams() {
  return STYLES.map((style) => ({ id: style.id }));
}

export default function StyleDetailPage({ params }: { params: { id: string } }) {
  const style = STYLES.find((item) => item.id === params.id);
  if (!style) notFound();

  const relatedLooks = LOOKS.filter((look) => look.styleId === style.id);
  const advice = style.styleSpecificAdvice;
  const cg = style.colorGuidance;
  const bft = style.bodyFitTips;
  const similarStyles = style.similarStyles
    ?.map((id) => STYLES.find((s) => s.id === id))
    .filter(isDefined);
  const nextStyles = style.nextStyles
    ?.map((id) => STYLES.find((s) => s.id === id))
    .filter(isDefined);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#f4f1ea] pt-28 pb-24 text-ink-900">
        <section className="mx-auto max-w-[1200px] px-6">
          {/* ===== Hero 首屏（纯文字，图片仅保留在穿搭灵感） ===== */}
          <div className="border-b border-ink-900/10 pb-12 mb-6">
            <div className="max-w-3xl">
              {/* 操作栏：返回链接 + 收藏 + 分享 */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <Link href="/styles" className="inline-flex items-center gap-2 text-base text-ink-600 hover:text-ink-900 transition-colors">
                  <ArrowLeft size={16} />
                  返回风格库
                </Link>
                <div className="flex items-center gap-5">
                  <FavoriteButton styleId={style.id} />
                  <ShareButton styleName={style.name} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="border border-ink-900/10 bg-white/45 px-3 py-1 text-xs tracking-[0.08em] text-ink-500">
                  {DIMENSION_LABELS[style.dimension]}
                </span>
                <span className="border border-ink-900 bg-ink-900 px-3 py-1 text-xs tracking-[0.08em] text-creme-100">
                  {CATEGORY_LABELS[style.category] || style.category}
                </span>
              </div>
              <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] text-ink-900 mb-4">
                {style.name}
              </h1>
              <p className="text-lg text-ink-500 mb-3 leading-relaxed">{style.description}</p>
              <p className="text-lg text-ink-600 leading-relaxed mb-5">{style.summary}</p>
              <blockquote className="border-l-[3px] border-ink-900/25 bg-white/40 py-2 pl-4 text-[clamp(1rem,1.8vw,1.35rem)] italic leading-relaxed text-ink-500">
                &ldquo;{style.philosophy}&rdquo;
              </blockquote>
              <div className="mt-8 flex h-2 border border-ink-900/10">
                {style.colorPalette.map((color) => (
                  <span key={color} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>

          {/* ===== 穿搭灵感（Look 展示，UGC 实例） ===== */}
          {relatedLooks.length > 0 && (
            <div id="section-looks" className="mb-6 scroll-mt-28">
              <h2 className="text-lg font-semibold text-ink-700 tracking-[0.08em] mb-4">穿搭灵感</h2>
              <StyleCtaUpload styleId={style.id} styleName={style.name} />
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
                {relatedLooks.map((look) => (
                  <div
                    key={look.id}
                    className="w-[78%] shrink-0 snap-start border border-ink-900/10 bg-[#fbfaf6] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:w-[48%] md:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)]"
                  >
                    <div className="aspect-[4/3] bg-[#ebe7df]">
                      <img src={look.image} alt={look.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-ink-900">{look.title}</h3>
                        <span className="text-xs text-ink-400">{look.pieces} 件单品</span>
                      </div>
                      <p className="text-sm text-ink-500 leading-relaxed">{look.description}</p>
                      <div className="mt-2 flex items-center justify-between border-t border-ink-900/5 pt-2">
                        <p className="text-xs text-ink-400">搭配师：{look.by}</p>
                        <p className="text-xs text-ink-400">♥ {look.likes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== 风格实用提示（合并为统一容器） ===== */}
          <div id="section-overview" className="mb-6 border-t border-ink-900/10 pt-6 scroll-mt-28">
            <h2 className="text-lg font-semibold text-ink-700 tracking-[0.08em] mb-4">风格实用提示</h2>
            <div className="border border-ink-900/10 bg-[#fbfaf6]">
              <div className="p-4">
                <h3 className="mb-2 text-base font-semibold text-ink-700">适合谁</h3>
                <p className="text-lg leading-relaxed text-ink-600">{advice?.suitableFor || `适合喜欢这种风格气质、愿意尝试新穿搭方式的人。不同身材都能通过调整版型和配色找到适合自己的表达方式。`}</p>
              </div>
              <div className="border-t border-ink-900/10 p-4">
                <h3 className="mb-2 text-base font-semibold text-ink-700">入门难度</h3>
                <p className="text-lg leading-snug text-ink-600">{`难度 ${style.difficulty}/5。${style.difficulty >= 4 ? '需要更强的整体控制力。' : '日常可执行度较高。'}`}</p>
              </div>
              <div className="border-t border-ink-900/10 bg-rose-50/40 p-4">
                <h3 className="mb-2 text-base font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertTriangle size={11} className="shrink-0" />
                  避雷点
                </h3>
                <p className="text-lg leading-relaxed text-ink-700">{advice?.cautionPoints || '不要一次性把所有代表元素穿满——保留一两个核心符号，其他部分保持干净，才能穿出高级感。'}</p>
              </div>
              <div className="border-t border-ink-900/10 p-4">
                <h3 className="mb-2 text-base font-semibold text-ink-700">场景建议</h3>
                <p className="text-lg leading-relaxed text-ink-600">{advice?.sceneAdvice || '先从日常出街、上课通勤或轻社交场景开始，不建议第一次就做满全套造型。'}</p>
              </div>
            </div>
          </div>

          {/* ===== 季节穿搭 ===== */}
          {style.seasonalLooks && style.seasonalLooks.length > 0 && (
            <div id="section-seasonal" className="mb-6 border-t border-ink-900/10 pt-6 scroll-mt-28">
              <h2 className="text-lg font-semibold text-ink-700 tracking-[0.08em] mb-4">季节穿搭建议</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {style.seasonalLooks.map((look, i) => (
                  <div key={i} className="border border-ink-900/10 bg-[#fbfaf6] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {look.season === 'spring_summer' ? (
                        <Sun size={16} className="text-amber-600/70" />
                      ) : (
                        <Snowflake size={16} className="text-sky-500/70" />
                      )}
                      <span className="text-xs tracking-[0.1em] text-ink-400">
                        {look.season === 'spring_summer' ? '春夏' : '秋冬'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-ink-900 mb-2">{look.title}</h3>
                    <p className="text-lg text-ink-500 leading-relaxed mb-3">{look.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {look.items.map((item) => (
                        <span key={item} className="bg-creme-200/70 px-2 py-0.5 text-xs text-ink-500">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== 风格核心要素 ===== */}
          <div id="section-elements" className="mb-6 border-t border-ink-900/10 pt-6 scroll-mt-28">
            <h2 className="text-lg font-semibold text-ink-700 tracking-[0.08em] mb-4">风格核心要素</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Panel title="核心单品" icon={<Shirt size={14} />}>
                <ul className="space-y-3">
                  {style.keyItems.map((item, i) => (
                    <li key={item} className="text-lg text-ink-600">
                      <div className="flex items-start gap-3">
                        <span className="h-1.5 w-1.5 bg-ink-900 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-ink-900">
                            {item}
                          </span>
                          {style.keyItemDescriptions?.[i] && (
                            <p className="text-sm text-ink-400 mt-0.5 leading-relaxed">{style.keyItemDescriptions[i]}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="廓形规则" icon={<Ruler size={14} />}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {style.silhouette.map((item) => (
                    <span key={item} className="border border-ink-900/10 bg-white/45 px-3 py-1.5 text-base text-ink-600">
                      {item}
                    </span>
                  ))}
                </div>
                {style.silhouetteDescription && (
                  <p className="text-lg text-ink-400 leading-relaxed">{style.silhouetteDescription}</p>
                )}
              </Panel>
              <Panel title="颜色体系" icon={<Palette size={14} />}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {style.colorPalette.map((color) => (
                    <div key={color} className="flex items-center gap-3">
                      <span className="h-9 w-9 border border-ink-900/10 shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs uppercase text-ink-400">{color}</span>
                    </div>
                  ))}
                </div>
                {style.colorDescription && (
                  <p className="text-lg text-ink-400 leading-relaxed">{style.colorDescription}</p>
                )}
              </Panel>
            </div>
          </div>

          {/* ===== 颜色搭配指南 + 品牌推荐（双栏并排） ===== */}
          {(cg || style.brandRecommendations) && (
            <div id="section-color-brand" className="mb-6 border-t border-ink-900/10 pt-6 scroll-mt-28">
              <h2 className="text-lg font-semibold text-ink-700 tracking-[0.08em] mb-4">配色方案 & 品牌推荐</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {cg && (
                  <div className="border border-ink-900/10 bg-[#fbfaf6] p-4">
                    <h3 className="text-lg font-semibold text-ink-700 mb-3">颜色搭配指南</h3>
                    <div className="space-y-3">
                      <ColorRow label="主色" desc={cg.primary} />
                      <ColorRow label="辅色" desc={cg.secondary} />
                      <ColorRow label="点缀色" desc={cg.accent} />
                      <div className="pt-2 border-t border-ink-900/5">
                        <p className="text-lg text-ink-500">
                          <span className="font-medium text-ink-700">搭配比例：</span>
                          {cg.ratio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {style.brandRecommendations && style.brandRecommendations.length > 0 && (
                  <div className="border border-ink-900/10 bg-[#fbfaf6] p-4">
                    <h3 className="text-base font-semibold text-ink-700 mb-3">品牌推荐</h3>
                    <div className="space-y-3">
                      {style.brandRecommendations.map((brand, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded shrink-0 mt-0.5',
                            brand.tier === 'premium' ? 'bg-ink-900 text-creme-100' :
                            brand.tier === 'mid' ? 'bg-creme-200 text-ink-700' :
                            'bg-creme-100 text-ink-500'
                          )}>
                            {brand.tier === 'premium' ? '高端' : brand.tier === 'mid' ? '中端' : '平价'}
                          </span>
                          <div>
                            <p className="text-base font-semibold text-ink-900">{brand.brandName}</p>
                            <p className="text-xs text-ink-400">{brand.priceRange}</p>
                            <p className="text-lg text-ink-500 mt-0.5 leading-relaxed">{brand.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== 身材适配建议 ===== */}
          {bft && (
            <div id="section-body" className="mb-6 border-t border-ink-900/10 pt-6 scroll-mt-28">
              <h2 className="text-lg font-semibold text-ink-700 tracking-[0.08em] mb-4">身材适配建议</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(bft).map(([shape, tip]) => (
                  <div key={shape} className="border border-ink-900/10 bg-[#fbfaf6] p-4">
                    <h3 className="text-base font-semibold text-ink-700 mb-1.5">{BODY_SHAPE_LABELS[shape] || shape}</h3>
                    <p className="text-lg text-ink-500 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== 风格对比与进阶路径 ===== */}
          {(similarStyles || nextStyles) && (
            <div id="section-related" className="mb-6 border-t border-ink-900/10 pt-6 scroll-mt-28">
              <h2 className="text-lg font-semibold text-ink-700 tracking-[0.08em] mb-4">相关风格</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {similarStyles && similarStyles.length > 0 && (
                  <div>
                    <p className="text-xs text-ink-500 mb-3 flex items-center gap-1.5">
                      <span className="text-ink-300">←</span> 相似风格
                    </p>
                    <div className="space-y-2">
                      {similarStyles.map((s) => (
                        <RelatedStyleCard key={s.id} style={s} />
                      ))}
                    </div>
                  </div>
                )}
                {nextStyles && nextStyles.length > 0 && (
                  <div>
                    <p className="text-xs text-ink-500 mb-3 flex items-center gap-1.5">
                      <span className="text-ink-300">→</span> 进阶尝试
                    </p>
                    <div className="space-y-2">
                      {nextStyles.map((s) => (
                        <RelatedStyleCard key={s.id} style={s} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== 底部 FIT CHECK ===== */}
          <div className="border-t border-ink-900/10 pt-8">
            <div className="grid gap-6 bg-[#111315] p-6 text-creme-100 md:grid-cols-[1fr_auto] md:items-center md:max-h-[160px]">
              <div>
                <p className="mb-2 text-xs tracking-[0.14em] text-creme-200/45">FIT CHECK</p>
                <h2 className="font-display text-2xl leading-none md:text-3xl">想知道它是否真的适合你？</h2>
                <p className="mt-2 max-w-xl text-lg leading-relaxed text-creme-200/55">
                  让 StyleMate 把你的身高、体型、日常场景和审美偏好一起计算，给出适配分和调整方式。
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-creme-100 px-7 py-3.5 text-base text-ink-900 transition hover:bg-white shrink-0"
              >
                开始风格测评
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function RelatedStyleCard({ style }: { style: StyleCard }) {
  const accent = style.colorPalette?.[0];
  return (
    <Link
      href={`/styles/${style.id}`}
      className="block border border-ink-900/10 bg-[#fbfaf6] p-3 transition-colors hover:border-ink-300"
    >
      <div className="mb-2 flex items-center gap-2">
        {accent && (
          <span className="h-3 w-3 shrink-0 border border-ink-900/10" style={{ backgroundColor: accent }} />
        )}
        <p className="text-base font-semibold text-ink-900">{style.name}</p>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <span className="bg-creme-200/70 px-1.5 py-0.5 text-[10px] text-ink-500">
          {DIMENSION_LABELS[style.dimension] || style.dimension}
        </span>
        <span className="bg-creme-200/70 px-1.5 py-0.5 text-[10px] text-ink-500">
          {CATEGORY_LABELS[style.category] || style.category}
        </span>
        <span className="bg-creme-200/70 px-1.5 py-0.5 text-[10px] text-ink-500">
          难度 {style.difficulty}/5
        </span>
      </div>
      <p className="text-sm text-ink-400 line-clamp-1">{style.description}</p>
    </Link>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-ink-900/10 bg-[#fbfaf6] p-4 h-full">
      <h2 className="mb-3 text-base font-semibold text-ink-700 flex items-center gap-1.5">
        {icon && <span className="text-ink-300">{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorRow({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-medium text-ink-600 w-14 shrink-0">{label}</span>
      <p className="text-lg text-ink-500 leading-relaxed">{desc}</p>
    </div>
  );
}