'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { register, login, isAuthenticated } from '@/lib/auth';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 已登录则跳转首页（useEffect 避免 hydration 不匹配）
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password.trim()) {
      setError('请填写手机号和密码');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'register') {
        await register(phone.trim(), password, nickname.trim() || undefined);
      } else {
        await login(phone.trim(), password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <div className="border border-ink-900/10 bg-[#fbfaf6] p-8">
          <h1 className="mb-2 font-display text-3xl">STYLEMATE</h1>
          <p className="mb-8 text-sm text-ink-500">登录后数据跨设备同步，换手机也不丢失</p>

          {/* Tabs */}
          <div className="mb-6 flex border-b border-ink-900/10">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === t ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-600'
                }`}
              >
                {t === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs tracking-[0.12em] text-ink-400">手机号</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="输入手机号"
                className="w-full border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none focus:border-ink-900/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs tracking-[0.12em] text-ink-400">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none focus:border-ink-900/40"
              />
            </div>
            {tab === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs tracking-[0.12em] text-ink-400">昵称（选填）</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="给自己起个名字"
                  className="w-full border border-ink-900/10 bg-white/50 px-4 py-3 text-sm outline-none focus:border-ink-900/40"
                />
              </div>
            )}

            {error && (
              <p className="rounded bg-red-50/60 px-3 py-2 text-xs text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-900 py-3 text-sm font-medium text-creme-100 transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '处理中…' : tab === 'login' ? '登录' : '注册'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
