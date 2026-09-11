'use client';

import { useEffect, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Camera, Loader2, Share2, X } from 'lucide-react';
import { useRequireAuth } from '@/lib/require-auth';
import { publishOotd, blobToDataUrl } from '@/lib/ootd-api';

const FAV_KEY = 'stylemate:favorite-styles';

function readFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('stylemate:favorites-updated'));
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * 收藏按钮 — 风格详情页 hero 区右上角使用
 * 已登录：toggle localStorage 收藏状态
 * 未登录：依赖父级 requireAuth 拦截（这里只做存储逻辑）
 */
export function FavoriteButton({ styleId }: { styleId: string }) {
  const { requireAuth } = useRequireAuth();
  const [favorited, setFavorited] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setFavorited(readFavorites().includes(styleId));
  }, [styleId]);

  useEffect(() => {
    const handler = () => setFavorited(readFavorites().includes(styleId));
    window.addEventListener('storage', handler);
    window.addEventListener('stylemate:favorites-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('stylemate:favorites-updated', handler);
    };
  }, [styleId]);

  const toggleFavorite = () => {
    if (!requireAuth('请先登录后再收藏风格')) return;
    const list = readFavorites();
    const next = list.includes(styleId) ? list.filter((id) => id !== styleId) : [...list, styleId];
    writeFavorites(next);
    setFavorited(next.includes(styleId));
    setToast(next.includes(styleId) ? '已加入收藏' : '已取消收藏');
    window.setTimeout(() => setToast(null), 1600);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleFavorite}
        className={cn(
          'inline-flex items-center gap-1.5 border bg-white/50 px-4 py-1.5 text-base transition',
          favorited
            ? 'border-rose-300 text-rose-600 font-medium hover:border-rose-400'
            : 'border-ink-900/20 text-ink-700 hover:border-ink-900/40 hover:text-ink-900'
        )}
        aria-pressed={favorited}
      >
        {favorited ? (
          <BookmarkCheck size={15} fill="currentColor" />
        ) : (
          <Bookmark size={15} />
        )}
        {favorited ? '已收藏' : '收藏'}
      </button>

      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2 border border-ink-900/10 bg-white/95 px-4 py-2 text-xs text-ink-700 shadow-sm">
          {toast}
        </div>
      )}
    </>
  );
}

/**
 * 分享按钮 — 风格详情页 hero 区右上角，与收藏按钮并列
 * 复制当前页面链接到剪贴板
 */
export function ShareButton({ styleName }: { styleName: string }) {
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setToast(`「${styleName}」链接已复制，快去分享吧`);
    } catch {
      setToast('复制失败，请手动复制地址栏链接');
    }
    window.setTimeout(() => setToast(null), 1600);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 border border-ink-900/20 bg-white/50 px-4 py-1.5 text-base text-ink-700 transition hover:border-ink-900/40 hover:text-ink-900"
        aria-label="分享"
      >
        <Share2 size={15} />
        分享
      </button>

      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2 border border-ink-900/10 bg-white/95 px-4 py-2 text-xs text-ink-700 shadow-sm">
          {toast}
        </div>
      )}
    </>
  );
}

/**
 * 上传 OOTD 弹窗 — 风格详情页穿搭灵感章节使用
 * 父级需自行做登录拦截（用 useRequireAuth）
 */
export function SubmitOotdDialog({
  styleId,
  styleName,
  onClose,
}: {
  styleId: string;
  styleName: string;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await blobToDataUrl(file);
      setImageData(dataUrl);
    } catch {
      setError('图片读取失败，请重试');
    }
  };

  const onSubmit = async () => {
    if (!imageData) {
      setError('请先选择一张穿搭照片');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await publishOotd({
        imageData,
        caption: caption.trim() || `我的「${styleName}」穿搭`,
        styleTags: styleId,
      });
      onClose();
      window.alert('发布成功！');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-ink-900/10 bg-[#fbfaf6] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">
            上传「{styleName}」穿搭
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 transition hover:text-ink-900"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="mb-4 flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden border border-dashed border-ink-900/30 bg-white/50 transition hover:border-ink-900/60"
        >
          {imageData ? (
            <img src={imageData} alt="穿搭预览" className="h-full w-full object-contain" />
          ) : (
            <div className="text-center">
              <Camera size={32} className="mx-auto mb-2 text-ink-300" />
              <p className="text-xs text-ink-500">点击选择穿搭照片</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="说点什么吧（选填）"
          className="mb-3 w-full resize-none border border-ink-900/10 bg-white/50 p-3 text-sm text-ink-700 outline-none transition focus:border-ink-900/40"
          rows={3}
        />

        {error && (
          <p className="mb-3 border border-rose-300/50 bg-rose-50/40 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-ink-900/10 bg-white/60 py-2 text-sm text-ink-600 transition hover:bg-white"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !imageData}
            className="flex-1 bg-ink-900 py-2 text-sm text-creme-100 transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400"
          >
            {submitting ? <Loader2 size={14} className="mx-auto animate-spin" /> : '发布'}
          </button>
        </div>
      </div>
    </div>
  );
}
