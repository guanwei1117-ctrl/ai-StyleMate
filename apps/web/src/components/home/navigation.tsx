'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: '风格库', href: '/styles' },
  { label: '测评', href: '/onboarding' },
  { label: '诊断', href: '/score-outfit' },
  { label: '衣橱', href: '/wardrobe' },
];

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c8f73] font-display text-sm text-white">S</span>
      <span className="text-sm font-semibold tracking-[0.2em] text-[#2d2926]">STYLEMATE</span>
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
        className={`fixed left-0 right-0 top-0 z-50 border-b border-[#eadfce]/80 transition-colors duration-300 ${scrolled ? 'bg-[#fffdf8]/92 shadow-sm backdrop-blur' : 'bg-[#fffdf8]/76 backdrop-blur-md'}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <BrandMark />

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm text-[#6f665d] transition hover:text-[#2d2926]">
                {link.label}
              </Link>
            ))}
          </div>

          <Link href="/onboarding" className="hidden rounded-full bg-[#7c8f73] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d8065] lg:inline-flex">
            开始测评
          </Link>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-[#2d2926] md:hidden" aria-label="打开菜单">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[#f7f2ea] pt-24 text-[#2d2926] md:hidden">
            <div className="px-6">
              <div className="flex flex-col gap-6">
                {NAV_LINKS.map((link, index) => (
                  <motion.a key={link.label} href={link.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + index * 0.04 }} onClick={() => setMobileOpen(false)} className="font-display text-4xl leading-none">
                    {link.label}
                  </motion.a>
                ))}
              </div>
              <Link href="/onboarding" onClick={() => setMobileOpen(false)} className="mt-10 inline-flex rounded-full bg-[#7c8f73] px-6 py-3 text-sm font-semibold text-white">
                开始风格测评
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
