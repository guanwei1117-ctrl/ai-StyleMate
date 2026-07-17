import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

const columns = [
  {
    title: '功能',
    links: [
      { label: '风格库', href: '/styles' },
      { label: '风格测评', href: '/onboarding' },
      { label: '穿搭诊断', href: '/score-outfit' },
    ],
  },
  {
    title: '探索',
    links: [
      { label: '我的衣橱', href: '/wardrobe' },
      { label: '最近诊断', href: '/score-outfit' },
      { label: '查看文档', href: '/styles' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#eadfce] bg-[#fffdf8] px-6 py-14 text-[#2d2926] lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <h3 className="font-display text-4xl leading-none">StyleMate</h3>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#7a7168]">
              一个温暖、轻盈的 AI 穿搭助手。帮你建立风格档案，诊断今日 Look，并把建议落到颜色、版型和单品上。
            </p>
            <div className="mt-6 flex gap-3 rounded-2xl border border-[#eadfce] bg-[#f7f2ea] p-4 text-sm leading-6 text-[#7a7168]">
              <ShieldCheck className="mt-1 shrink-0 text-[#7c8f73]" size={18} />
              照片只用于穿搭分析，不做身份识别。档案可随时清除。
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-5 text-xs font-semibold tracking-[0.22em] text-[#9b8f80]">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-[#7a7168] transition hover:text-[#2d2926]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#eadfce] pt-6 text-xs tracking-[0.14em] text-[#9b8f80] sm:flex-row">
          <p>© 2026 STYLEMATE</p>
          <p>AI STYLE COMPANION</p>
        </div>
      </div>
    </footer>
  );
}
