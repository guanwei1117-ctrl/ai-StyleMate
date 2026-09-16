import { Instagram, Twitter, Mail } from 'lucide-react';
import { STYLES } from '@/data/styles';

const FOOTER_LINKS = {
  explore: {
    title: '探索',
    links: [
      { label: '风格百科', href: '/styles' },
      { label: '生成档案', href: '/onboarding' },
      { label: '拍立搭', href: '/styles/camera' },
      { label: '智能衣橱', href: '/wardrobe' },
    ],
  },
  company: {
    title: '关于',
    links: [
      { label: '我们的故事', href: '#story' },
      { label: '灵感墙', href: '#trending' },
      { label: '风格库预览', href: '#styles' },
      { label: '加入社区', href: '/ootd' },
    ],
  },
  support: {
    title: '支持',
    links: [
      { label: '生成我的风格档案', href: '/onboarding' },
      { label: '上传 Look 拍立搭', href: '/styles/camera' },
      { label: `查看全部 ${STYLES.length} 种风格`, href: '/styles' },
      { label: '管理我的衣橱', href: '/wardrobe' },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-creme-100 pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Main grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Brand column */}
          <div className="col-span-2">
            <h3 className="font-display text-xl lg:text-2xl tracking-wide mb-4">
              STYLEMATE
            </h3>
            <p className="text-creme-200/40 text-sm leading-relaxed font-light max-w-xs">
              融合知识拆解 + 风格测评 + AI 教练三种穿搭视角。
              <br />
              不替你做决定，只帮你看清自己的选项。
            </p>
            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              {[Instagram, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-creme-100/10 text-creme-200/40 hover:text-creme-100 hover:border-creme-100/30 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.values(FOOTER_LINKS).map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] tracking-[0.25em] text-creme-200/30 uppercase mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-creme-200/40 hover:text-creme-100 transition-colors duration-300 font-light"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-creme-100/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-wider text-creme-200/20 uppercase font-light">
            &copy; 2026 StyleMate. All rights reserved.
          </p>
          <p className="text-[10px] tracking-wider text-creme-200/20 font-light">
            真诚建议，不敷衍每一件衣服。
          </p>
        </div>
      </div>
    </footer>
  );
}
