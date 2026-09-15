'use client';

import Link from 'next/link';
import { Camera, Sparkles, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';

export default function CameraPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-creme-200 pt-28 pb-24 text-ink-900">
        <section className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-2xl bg-warning/20 text-warning">
            <Camera className="h-10 w-10" />
          </div>
          <p className="mb-3 text-xs tracking-[0.3em] text-warning">拍立搭 · CAMERA STYLE</p>
          <h1 className="mb-6 font-display text-4xl text-ink-900 lg:text-5xl">
            AI 风格识别 · 适配评估
          </h1>
          <p className="mb-10 text-lg leading-8 text-ink-500">
            在小红书 / Instagram / 任何地方看到喜欢的穿搭图？
            <br />
            上传给我们，AI 立刻告诉你：<b>这是什么风格</b>、<b>适不适合你</b>。
          </p>

          <div className="mx-auto mb-10 max-w-md rounded-2xl border border-ink-900/10 bg-white p-8 shadow-card">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-warning" />
            <p className="text-base font-medium text-ink-800">功能开发中</p>
            <p className="mt-2 text-sm leading-6 text-ink-500">
              我们正在打磨 AI 识别准确度，预计很快上线。
              <br />
              上线后这里会出现一个上传按钮 + 拍照入口。
            </p>
          </div>

          <Link
            href="/styles"
            className="inline-flex items-center gap-2 text-sm text-ink-700 transition hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            返回风格百科
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
