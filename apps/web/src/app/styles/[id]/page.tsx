import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import { STYLES, CATEGORY_LABELS, DIMENSION_LABELS } from '@/data/styles';
import styleImages from '@/data/style-images.json';

function getStyleImage(styleId: string): string | undefined {
  return (styleImages as Record<string, string>)[styleId];
}

export function generateStaticParams() {
  return STYLES.map((style) => ({ id: style.id }));
}

export default function StyleDetailPage({ params }: { params: { id: string } }) {
  const style = STYLES.find((s) => s.id === params.id);
  if (!style) notFound();
  const imageUrl = getStyleImage(style.id);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-creme-100 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <Link
            href="/styles"
            className="text-xs tracking-wider text-ink-400 hover:text-ink-600 transition-colors"
          >
            ← 返回风格库
          </Link>

          {/* Color palette */}
          <div className="flex gap-1.5 mt-8 mb-10">
            {style.colorPalette.map((c) => (
              <div key={c} className="w-10 h-10 rounded-full border border-creme-300" style={{ backgroundColor: c }} />
            ))}
          </div>

          {/* Reference image — 自适应完整显示 */}
          {imageUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-creme-200 shadow-sm bg-white flex items-center justify-center">
              <img
                src={imageUrl}
                alt={style.name}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          )}

          {/* Header */}
          <div className="flex gap-2 mb-4">
            <span className="inline-block px-3 py-1 bg-creme-200/60 text-ink-500 text-xs tracking-wider rounded-full">
              {DIMENSION_LABELS[style.dimension]}
            </span>
            <span className="inline-block px-3 py-1 bg-ink-800 text-creme-100 text-xs tracking-wider rounded-full">
              {CATEGORY_LABELS[style.category] || style.category}
            </span>
          </div>
          <h1 className="font-display text-display text-ink-900 mb-4">{style.name}</h1>
          <p className="text-lg text-ink-500 font-light max-w-xl leading-relaxed">{style.description}</p>

          {/* Philosophy */}
          <div className="mt-12 p-8 bg-creme-200/50 rounded-xl border border-creme-200/60">
            <p className="text-xs tracking-[0.2em] text-ink-400 mb-3 uppercase">风格哲学</p>
            <p className="text-ink-600 font-light leading-relaxed italic">&ldquo;{style.philosophy}&rdquo;</p>
          </div>

          {/* Details grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* Key items */}
            <div>
              <h3 className="text-sm tracking-wider text-ink-400 mb-4">标志单品</h3>
              <ul className="space-y-2">
                {style.keyItems.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-ink-700 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Silhouette */}
            <div>
              <h3 className="text-sm tracking-wider text-ink-400 mb-4">典型廓形</h3>
              <div className="flex flex-wrap gap-2">
                {style.silhouette.map((s) => (
                  <span key={s} className="px-3 py-1.5 bg-creme-200/60 text-ink-600 text-sm rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="mt-10 flex items-center gap-3">
            <span className="text-sm tracking-wider text-ink-400">入门难度</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= style.difficulty ? 'text-ink-800' : 'text-ink-200'}>
                  {n <= style.difficulty ? '★' : '☆'}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 pt-12 border-t border-creme-200 text-center">
            <p className="text-ink-500 font-light mb-4">
              想知道{style.name}是否真的适合你？
            </p>
            <Link
              href="/onboarding"
              className="inline-block px-8 py-3 bg-ink-900 text-creme-100 text-sm tracking-wider hover:bg-ink-800 transition-all"
            >
              开始风格测试
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
