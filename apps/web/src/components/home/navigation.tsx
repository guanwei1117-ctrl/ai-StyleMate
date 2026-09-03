'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Menu, User, ChevronDown, X } from 'lucide-react';
import AboutDialog from './about-dialog';
import { isAuthenticated, logout } from '@/lib/auth';

type NavItem = { label: string; href: string } | { label: string; dialog: true };

const NAV_LINKS: NavItem[] = [
  { label: '风格百科', href: '/styles' },
  { label: '风格测评', href: '/onboarding' },
  { label: '我的档案', href: '/onboarding?view=history' },
  { label: '衣橱', href: '/wardrobe' },
  { label: '社区', href: '/ootd' },
  { label: '关于', dialog: true },
];

function isDialogItem(item: NavItem): item is { label: string; dialog: true } {
  return 'dialog' in item;
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuthed(isAuthenticated());
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 点击菜单外部关闭下拉
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

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
            {authed ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`${linkClass} inline-flex items-center gap-1.5`}
                >
                  <User size={14} />
                  <span>我的</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-ink-900/10 bg-white py-2 shadow-lift">
                    <Link
                      href="/onboarding?view=history"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-creme-100"
                    >
                      我的档案
                    </Link>
                    <Link
                      href="/memory"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-creme-100"
                    >
                      AI 记忆管理
                    </Link>
                    <hr className="my-1 border-ink-900/5" />
                    <button
                      type="button"
                      onClick={() => { logout(); setUserMenuOpen(false); setAuthed(false); }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className={`${linkClass} inline-flex items-center gap-1.5`}
              >
                <LogIn size={14} />
                <span>登录</span>
              </Link>
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
              {authed && (
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + NAV_LINKS.length * 0.06 }}
                  onClick={() => { setMobileOpen(false); logout(); setAuthed(false); }}
                  className="font-display text-xl text-red-500 tracking-wide mt-4"
                >
                  退出登录
                </motion.button>
              )}
              {!authed && (
                <motion.a
                  href="/auth"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + NAV_LINKS.length * 0.06 }}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-xl text-ink-500 tracking-wide"
                >
                  登录 / 注册
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
