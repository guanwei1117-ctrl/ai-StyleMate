'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: '风格库', href: '/styles' },
  { label: '喜爱榜', href: '/styles' },
  { label: '测评', href: '/onboarding' },
  { label: '诊断', href: '/score-outfit' },
];

const ACTION_LINKS = [
  { label: '说明', href: '#' },
  { label: '投稿', href: '/styles' },
  { label: '登录', href: '#' },
];

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-5 w-8 grid-cols-3">
        <span className="bg-[#0066b1]" />
        <span className="bg-[#1c69d4]" />
        <span className="bg-[#e22718]" />
      </span>
      <span className="text-sm font-black uppercase tracking-[0.22em] text-white">STYLEMATE</span>
    </Link>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 transition-colors duration-300 ${scrolled ? 'bg-black/92 backdrop-blur' : 'bg-black/60 backdrop-blur-sm'}`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <BrandMark />

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="text-xs uppercase tracking-[0.18em] text-white/62 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            {ACTION_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="text-xs uppercase tracking-[0.18em] text-white/45 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white md:hidden" aria-label="打开菜单">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black pt-20 text-white md:hidden">
            <div className="px-6">
              <div className="mb-10 grid h-1 grid-cols-3">
                <span className="bg-[#0066b1]" />
                <span className="bg-[#1c69d4]" />
                <span className="bg-[#e22718]" />
              </div>
              <div className="flex flex-col gap-7">
                {[...NAV_LINKS, ...ACTION_LINKS].map((link, index) => (
                  <motion.a key={link.label} href={link.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + index * 0.04 }} onClick={() => setMobileOpen(false)} className="text-3xl font-black uppercase tracking-[-0.03em]">
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
