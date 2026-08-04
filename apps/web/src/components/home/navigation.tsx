'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import AboutDialog from './about-dialog';

type NavItem = { label: string; href: string } | { label: string; dialog: true };

const NAV_LINKS: NavItem[] = [
  { label: '风格百科', href: '/styles' },
  { label: '风格测评', href: '/onboarding' },
  { label: '我的档案', href: '/onboarding?view=history' },
  { label: '灵感墙', href: '#trending' },
  { label: '衣橱', href: '/wardrobe' },
  { label: 'AI 记忆', href: '/memory' },
  { label: '关于', dialog: true },
];

function isDialogItem(item: NavItem): item is { label: string; dialog: true } {
  return 'dialog' in item;
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = `text-sm tracking-widest uppercase transition-colors duration-300 ${
    scrolled
      ? 'text-ink-600 hover:text-ink-900'
      : 'text-creme-200/90 hover:text-creme-100'
  }`;

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-creme-100/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a
            href="#"
            className={`font-display text-xl lg:text-2xl tracking-wide transition-colors duration-300 ${
              scrolled ? 'text-ink-900' : 'text-creme-100'
            }`}
          >
            STYLEMATE
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) =>
              isDialogItem(item) ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className={linkClass}
                >
                  {item.label}
                </button>
              ) : (
                <a key={item.label} href={item.href} className={linkClass}>
                  {item.label}
                </a>
              ),
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 transition-colors duration-300 ${
              scrolled ? 'text-ink-900' : 'text-creme-100'
            }`}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-creme-100/95 backdrop-blur-xl pt-20"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8 -mt-16">
              {NAV_LINKS.map((item, i) => {
                const handle = () => {
                  setMobileOpen(false);
                  if (isDialogItem(item)) setAboutOpen(true);
                };
                const commonProps = {
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.1 + i * 0.06 },
                  onClick: handle,
                  className: 'font-display text-2xl text-ink-800 tracking-wide',
                };
                return isDialogItem(item) ? (
                  <motion.button key={item.label} type="button" {...commonProps}>
                    {item.label}
                  </motion.button>
                ) : (
                  <motion.a key={item.label} href={item.href} {...commonProps}>
                    {item.label}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
