'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import WardrobeUploader from '@/components/wardrobe/wardrobe-uploader';
import WardrobeItemCard from '@/components/wardrobe/wardrobe-item-card';
import TodayOutfitDialog from '@/components/wardrobe/today-outfit-dialog';
import PurchaseEvaluationDialog from '@/components/wardrobe/purchase-evaluation-dialog';
import {
  fetchWardrobeItems,
  getLocalUserId,
} from '@/lib/wardrobe-api';
import {
  WardrobeItem,
  WardrobeCategory,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
} from '@/lib/wardrobe-types';

type Filter = 'all' | WardrobeCategory;

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '🗂️' },
  { key: 'top', label: CATEGORY_LABELS.top, emoji: CATEGORY_EMOJI.top },
  { key: 'bottom', label: CATEGORY_LABELS.bottom, emoji: CATEGORY_EMOJI.bottom },
  { key: 'outerwear', label: CATEGORY_LABELS.outerwear, emoji: CATEGORY_EMOJI.outerwear },
  { key: 'dress', label: CATEGORY_LABELS.dress, emoji: CATEGORY_EMOJI.dress },
  { key: 'shoes', label: CATEGORY_LABELS.shoes, emoji: CATEGORY_EMOJI.shoes },
  { key: 'accessory', label: CATEGORY_LABELS.accessory, emoji: CATEGORY_EMOJI.accessory },
];

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [todayOutfitOpen, setTodayOutfitOpen] = useState(false);
  const [purchaseEvalOpen, setPurchaseEvalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWardrobeItems(
        filter === 'all' ? undefined : filter,
      );
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const userId = typeof window !== 'undefined' ? getLocalUserId() : '';

  const countByCategory = (cat: WardrobeCategory) =>
    items.filter((i) => i.category === cat).length;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">我的衣橱</h1>
              <p className="mt-1 text-gray-500">
                拍照上传，AI 自动识别品类、颜色、风格和百搭程度
              </p>
            </div>
            <WardrobeUploader onUploaded={load} />
          </div>

          {/* 今天穿什么入口 */}
          <button
            type="button"
            onClick={() => setTodayOutfitOpen(true)}
            className="mb-8 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-ink-900 to-ink-700 px-6 py-5 text-left transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                ✨
              </div>
              <div>
                <h2 className="text-lg font-bold text-creme-100">
                  今天穿什么？
                </h2>
                <p className="mt-0.5 text-sm text-creme-200/70">
                  告诉我城市和场合，AI 从你的衣橱里搭 3 套方案
                </p>
              </div>
            </div>
            <span className="text-creme-200/60">→</span>
          </button>

          <TodayOutfitDialog
            open={todayOutfitOpen}
            onClose={() => setTodayOutfitOpen(false)}
          />

          {/* 这件值得买吗入口 */}
          <button
            type="button"
            onClick={() => setPurchaseEvalOpen(true)}
            className="mb-8 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-purple-900 to-purple-700 px-6 py-5 text-left transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                🤔
              </div>
              <div>
                <h2 className="text-lg font-bold text-creme-100">
                  这件值得买吗？
                </h2>
                <p className="mt-0.5 text-sm text-creme-200/70">
                  上传商品截图，AI 结合你的衣橱判断是否值得入手
                </p>
              </div>
            </div>
            <span className="text-creme-200/60">→</span>
          </button>

          <PurchaseEvaluationDialog
            open={purchaseEvalOpen}
            onClose={() => setPurchaseEvalOpen(false)}
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((f) => {
              const count =
                f.key === 'all'
                  ? items.length
                  : countByCategory(f.key as WardrobeCategory);
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-ink-900 text-creme-100'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{f.emoji}</span>
                  {f.label}
                  <span className={`text-xs ${active ? 'text-creme-200' : 'text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">加载中…</div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-4 rounded-full bg-ink-900 px-6 py-2 text-sm text-creme-100"
              >
                重试
              </button>
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <WardrobeItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Debug: userId（开发期可见，正式版可移除） */}
          <p className="mt-16 text-xs text-gray-300">
            当前用户 ID：{userId}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">👔</div>
      <h3 className="text-xl font-semibold text-gray-900">衣橱还是空的</h3>
      <p className="mt-2 text-gray-500 max-w-md mx-auto">
        点击上方「添加衣物」，上传一件衣服的照片，AI 会自动识别品类、颜色、材质和风格标签。
      </p>
    </div>
  );
}
