import { Instagram, Mail, Twitter } from 'lucide-react';

const columns = [
  {
    title: 'EXPLORE',
    links: [
      { label: '风格库', href: '/styles' },
      { label: '喜爱榜', href: '/styles' },
      { label: '风格测评', href: '/onboarding' },
    ],
  },
  {
    title: 'TOOLS',
    links: [
      { label: '穿搭诊断', href: '/score-outfit' },
      { label: '智能衣橱', href: '/wardrobe' },
      { label: '投稿入口', href: '/styles' },
    ],
  },
  {
    title: 'NOTICE',
    links: [
      { label: '非商用展示', href: '#' },
      { label: '侵权联系删除', href: '#' },
      { label: '来源链接说明', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/12 bg-black px-6 py-16 text-white lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 grid h-1 max-w-xs grid-cols-3">
          <span className="bg-[#0066b1]" />
          <span className="bg-[#1c69d4]" />
          <span className="bg-[#e22718]" />
        </div>

        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-[0.18em]">STYLEMATE</h3>
            <p className="mt-5 max-w-sm text-sm font-light leading-7 text-white/42">
              一个以图片、风格、博主内容和用户互动为核心的视觉风格库。
            </p>
            <div className="mt-7 flex items-center gap-3">
              {[Instagram, Twitter, Mail].map((Icon, index) => (
                <a key={index} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/55 transition hover:bg-white hover:text-black" aria-label="社交入口">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-white/36">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm font-light text-white/50 transition hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.16em] text-white/24 sm:flex-row">
          <p>© 2026 STYLEMATE</p>
          <p>NON-COMMERCIAL STYLE REFERENCE</p>
        </div>
      </div>
    </footer>
  );
}
