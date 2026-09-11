'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, X, Plus, Shirt, Sparkles, XCircle } from 'lucide-react';
import WardrobeUploader from '@/components/wardrobe/wardrobe-uploader';
import ManualAddDialog from '@/components/wardrobe/manual-add-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
  fetchWardrobeItems,
} from '@/lib/wardrobe-api';
import { generateTodayOutfit } from '@/lib/today-outfit-api';
import type { TodayOutfitResponse, OutfitPlan } from '@/lib/today-outfit-types';
import {
  WardrobeItem,
  WardrobeCategory,
  CATEGORY_LABELS,
  SUBCATEGORIES,
} from '@/lib/wardrobe-types';
import { useRequireAuth } from '@/lib/require-auth';
import { cn } from '@/lib/utils';

type Filter = 'all' | WardrobeCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'top', label: CATEGORY_LABELS.top },
  { key: 'outerwear', label: CATEGORY_LABELS.outerwear },
  { key: 'bottom', label: CATEGORY_LABELS.bottom },
  { key: 'dress', label: CATEGORY_LABELS.dress },
  { key: 'shoes', label: CATEGORY_LABELS.shoes },
  { key: 'bag', label: CATEGORY_LABELS.bag },
  { key: 'hat', label: CATEGORY_LABELS.hat },
  { key: 'accessory', label: CATEGORY_LABELS.accessory },
];

export default function WardrobePage() {
  const { requireAuth } = useRequireAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [manualOpen, setManualOpen] = useState(false);

  // M4：AI 帮你挑 —— 调用 daily-recommend 拿 3 套方案，从方案中提取用到的单品 id
  // 在 grid 中高亮这些单品，让用户立刻看到"AI 觉得我今天最适合穿的"
  const [aiPick, setAiPick] = useState<{
    itemIds: Set<string>;
    plans: OutfitPlan[];
    memoryEcho: string[];
    loading: boolean;
    error: string | null;
  }>({ itemIds: new Set(), plans: [], memoryEcho: [], loading: false, error: null });

  const handleAiPick = useCallback(async () => {
    if (!requireAuth('请先登录后再使用 AI 帮你挑')) return;
    setAiPick((p) => ({ ...p, loading: true, error: null }));
    try {
      const data: TodayOutfitResponse = await generateTodayOutfit({
        city: '上海', // 默认城市（后续可让用户选）
        occasion: 'commute',
        styleGoal: 'comfortable',
        constraints: [],
      });
      // 从所有 plans 提取用到的单品 id（itemId 非空 = 用户衣橱里真实存在的）
      const itemIds = new Set<string>();
      for (const plan of data.plans) {
        for (const slot of [plan.hat, plan.top, plan.bottom, plan.outerwear, plan.shoes, plan.bag, plan.accessory]) {
          if (slot?.itemId && !slot.isSuggestion) itemIds.add(slot.itemId);
        }
      }
      setAiPick({
        itemIds,
        plans: data.plans,
        memoryEcho: data.memoryEcho ?? [],
        loading: false,
        error: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI 帮你挑失败';
      setAiPick((p) => ({ ...p, loading: false, error: msg }));
    }
  }, [requireAuth]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWardrobeItems(
        filter === 'all' ? undefined : filter,
        signal,
      );
      setItems(data);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof TypeError && err.message === 'Failed to fetch'
        ? '无法连接后端服务，请确认 API 已启动 (localhost:4000)'
        : err instanceof Error ? err.message : '加载失败';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // 前端搜索 + 二级子类过滤
  const filteredItems = items.filter((item) => {
    if (subFilter && item.subCategory !== subFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (item.subCategory?.toLowerCase().includes(q)) ||
        (item.color?.toLowerCase().includes(q)) ||
        (item.material?.toLowerCase().includes(q)) ||
        item.styleTags?.some((t) => t.toLowerCase().includes(q)) ||
        item.occasionTags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // M7：AI 智能整理模式 —— 按"百搭程度 + 季节匹配 + 颜色偏好 + 风格匹配"智能排序
  const [aiSort, setAiSort] = useState(false);
  const sortedItems = aiSort
    ? [...filteredItems].sort((a, b) => {
        // 综合评分：百搭 50% + matchability 30% + 颜色偏好 20%
        const scoreOf = (it: typeof a) => {
          let s = (it.matchabilityScore ?? 0) * 0.3;
          // 风格匹配（likedStyles 优先）
          const likedStyles = ['极简', '通勤', '休闲']; // 简化：通用偏好
          if (it.styleTags?.some((t) => likedStyles.includes(t))) s += 15;
          // 颜色匹配（preferredColors 优先）
          const preferredColors = ['黑', '白', '灰', '蓝', '米']; // 简化：通用安全色
          if (it.color && preferredColors.includes(it.color)) s += 10;
          // 季节匹配（春秋季优先，因为是当前过渡季）
          if (it.season?.includes('spring') || it.season?.includes('autumn')) s += 8;
          return s;
        };
        return scoreOf(b) - scoreOf(a);
      })
    : filteredItems;

  const countByCategory = (cat: WardrobeCategory) =>
    items.filter((i) => i.category === cat).length;

  return (
    <main className="min-h-screen bg-creme-200 pb-16">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-ink-900/10 bg-creme-200/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            ← 返回首页
          </Link>
          <p className="font-display text-lg tracking-wide">STYLEMATE</p>
          <p className="text-sm text-ink-900 font-medium">衣橱</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">我的衣橱</h1>
            <p className="mt-0.5 text-sm text-ink-400">
              {loading ? '加载中…' : `${items.length} 件`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!requireAuth('请先登录后再管理衣橱')) return;
                setManualOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/15 px-4 py-2.5 text-sm text-ink-700 hover:border-ink-900/40 transition-colors"
            >
              <Plus size={16} />
              手动录入
            </button>
            <button
              type="button"
              onClick={handleAiPick}
              disabled={aiPick.loading}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all',
                aiPick.loading
                  ? 'bg-olive-pale/50 text-olive-dark/70 cursor-wait'
                  : 'bg-gradient-to-r from-olive-dark to-olive-dark/90 text-creme-50 hover:shadow-lift hover:-translate-y-0.5',
              )}
            >
              <Sparkles size={16} className={aiPick.loading ? 'animate-pulse' : ''} />
              {aiPick.loading ? 'AI 在挑...' : '✨ AI 帮你挑'}
            </button>
            <WardrobeUploader onUploaded={load} requireAuth={requireAuth} />
          </div>
        </div>

        {/* 分类筛选 + 搜索 */}
        <div className="mb-6 space-y-3">
          {/* 筛选 chips */}
          <div className="flex flex-wrap gap-2">
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
                  onClick={() => { setFilter(f.key); setSubFilter(null); }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all duration-200 ${
                    active
                      ? 'bg-ink-900 text-creme-100'
                      : 'border border-ink-900/10 bg-white text-ink-600 hover:border-ink-900/30'
                  }`}
                >
                  {f.label}
                  <span className={`text-xs ${active ? 'text-creme-200' : 'text-ink-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 二级子类筛选 */}
          {filter !== 'all' && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSubFilter(null)}
                className={`rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
                  subFilter === null ? 'bg-ink-900 text-creme-100' : 'bg-white border border-ink-900/10 text-ink-500 hover:border-ink-900/30'
                }`}
              >
                全部
              </button>
              {SUBCATEGORIES[filter].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubFilter(sub)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-all duration-200 ${
                    subFilter === sub ? 'bg-ink-900 text-creme-100' : 'bg-white border border-ink-900/10 text-ink-500 hover:border-ink-900/30'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* 搜索栏 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索颜色、材质、风格标签…"
              className="w-full rounded-full border border-ink-900/10 bg-white pl-9 pr-8 py-2.5 text-sm outline-none transition-all duration-200 focus:border-ink-900/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 transition-colors duration-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 激活的筛选标签 */}
          {filter !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-400">已筛选：</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs text-ink-600">
                {FILTERS.find((f) => f.key === filter)?.label || filter}
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="text-ink-400 hover:text-ink-600"
                >
                  <X size={12} />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* M4：AI 帮你挑 banner（点击按钮后展示） */}
        {(aiPick.itemIds.size > 0 || aiPick.error) && (
          <div className={cn(
            'mb-6 rounded-2xl border px-5 py-4 text-sm',
            aiPick.error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-olive-pale bg-gradient-to-br from-olive-pale/40 to-creme-50 text-olive-dark',
          )}>
            {aiPick.error ? (
              <p>⚠️ {aiPick.error}</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium mb-1">
                      ✨ AI 帮你挑了 {aiPick.itemIds.size} 件单品（来自 {aiPick.plans.length} 套方案）
                    </p>
                    <p className="text-xs text-olive-dark/80">
                      {aiPick.plans.slice(0, 3).map((p) => p.title).join(' / ')}
                    </p>
                    {aiPick.memoryEcho.length > 0 && (
                      <p className="text-xs text-ink/60 mt-2 italic">
                        我注意到你：{aiPick.memoryEcho.slice(0, 2).join('，')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiPick({ itemIds: new Set(), plans: [], memoryEcho: [], loading: false, error: null })}
                    className="text-ink-400 hover:text-ink-600"
                    title="清除高亮"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 内容 */}
        {loading ? (
          <div className="text-center py-20 text-ink-400">加载中…</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-4 rounded-full bg-ink-900 px-6 py-2 text-sm text-creme-100 hover:bg-ink-800 transition-colors"
            >
              重试
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Shirt size={28} strokeWidth={1.5} />}
            title={items.length > 0 ? '没有匹配的衣物' : '衣橱还是空的'}
            description={
              items.length > 0
                ? '试试调整筛选条件或搜索关键词'
                : '拍照上传第一件衣服，AI 会自动识别品类、颜色和风格标签'
            }
            action={
              items.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setManualOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-creme-50 transition-all duration-200 hover:bg-ink-800 active:scale-[0.98]"
                >
                  <Plus size={15} />
                  手动录入第一件
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-ink/60">
                {aiSort ? '🧠 AI 智能整理：按"今天最适合穿"排序' : `共 ${sortedItems.length} 件`}
              </p>
              <button
                type="button"
                onClick={() => setAiSort((s) => !s)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  aiSort
                    ? 'bg-olive-dark text-creme-50'
                    : 'border border-ink-900/15 text-ink-600 hover:border-ink-900/40'
                }`}
              >
                {aiSort ? '✓ AI 整理中' : '🧠 AI 整理'}
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
              {sortedItems.map((item) => (
              <Link
                key={item.id}
                href={`/wardrobe/items/${item.id}`}
                className={cn(
                  'group rounded-xl border bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift relative',
                  aiPick.itemIds.has(item.id)
                    ? 'ring-2 ring-olive-dark border-olive-dark shadow-lift'
                    : 'border-ink-900/10',
                )}
              >
                {/* M4：AI 选中标签 */}
                {aiPick.itemIds.has(item.id) && (
                  <div className="absolute top-2 right-2 z-10 rounded-full bg-olive-dark px-2 py-0.5 text-[10px] font-medium text-creme-50 shadow-md">
                    ✨ AI 选了
                  </div>
                )}
                {/* 照片区域 */}
                <div className="aspect-square bg-ink-50 relative overflow-hidden">
                  {item.imageUrls?.[0] ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.subCategory || item.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Shirt size={32} strokeWidth={1.5} className="text-ink-200" />
                    </div>
                  )}
                </div>
                {/* 信息 */}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-ink-900 truncate">
                    {item.subCategory || CATEGORY_LABELS[item.category as WardrobeCategory] || item.category}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="size-3 rounded-full border border-ink-200 shrink-0"
                      style={{ backgroundColor: item.colorHex || item.color || '#ccc' }}
                      title={item.color}
                    />
                    <span className="text-[10px] text-ink-400 truncate">{item.color}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </>
        )}
      </div>

      <ManualAddDialog open={manualOpen} onClose={() => setManualOpen(false)} onAdded={load} />
    </main>
  );
}
