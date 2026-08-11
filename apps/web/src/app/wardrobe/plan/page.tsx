'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, X, Shirt, Sparkles } from 'lucide-react';
import { fetchSavedOutfits } from '@/lib/today-outfit-api';
import { fetchWardrobeItems } from '@/lib/wardrobe-api';
import type { WardrobeItem } from '@/lib/wardrobe-types';

type SavedOutfit = Awaited<ReturnType<typeof fetchSavedOutfits>>[number];

interface DayPlan {
  outfitId: string;
  outfitName: string;
  worn: boolean;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PlanPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [plans, setPlans] = useState<Record<string, DayPlan>>({});
  const [pickerDay, setPickerDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 详情弹窗
  const [detailOutfit, setDetailOutfit] = useState<SavedOutfit | null>(null);
  const [itemPhotos, setItemPhotos] = useState<Map<string, string>>(new Map());

  const loadOutfits = useCallback(async () => {
    try { setSavedOutfits(await fetchSavedOutfits()); } catch { /* */ }
  }, []);

  // 加载衣橱物品照片（用于详情弹窗）
  const loadItemPhotos = useCallback(async () => {
    try {
      const items: WardrobeItem[] = await fetchWardrobeItems();
      const map = new Map<string, string>();
      for (const item of items) {
        if (item.imageUrls?.[0]) map.set(item.id, item.imageUrls[0]);
      }
      setItemPhotos(map);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOutfits(), loadItemPhotos()]).finally(() => setLoading(false));

    try {
      const saved = localStorage.getItem('stylemate.plan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setPlans(parsed as Record<string, DayPlan>);
        }
      }
    } catch { /* */ }
  }, [loadOutfits, loadItemPhotos]);

  const savePlans = useCallback((updated: Record<string, DayPlan>) => {
    setPlans(updated);
    localStorage.setItem('stylemate.plan', JSON.stringify(updated));
  }, []);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }), [weekStart]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
  const monthLabel = weekStart.getMonth() === weekEnd.getMonth()
    ? `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月`
    : `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}-${weekEnd.getMonth() + 1}月`;

  const scheduleOutfit = (dateStr: string, outfit: SavedOutfit) => {
    savePlans({
      ...plans,
      [dateStr]: { outfitId: outfit.id, outfitName: outfit.title || outfit.name || '未命名', worn: plans[dateStr]?.worn ?? false },
    });
    setPickerDay(null);
  };

  const toggleWorn = (dateStr: string) => {
    if (!plans[dateStr]) return;
    savePlans({ ...plans, [dateStr]: { ...plans[dateStr], worn: !plans[dateStr].worn } });
  };

  const removePlan = (dateStr: string) => {
    const updated = { ...plans };
    delete updated[dateStr];
    savePlans(updated);
  };

  const openDetail = (outfitId: string) => {
    const outfit = savedOutfits.find(o => o.id === outfitId);
    if (outfit) setDetailOutfit(outfit);
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] pb-24">
      <div className="sticky top-0 z-30 border-b border-ink-900/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="text-sm text-ink-500 hover:text-ink-900">← 返回首页</Link>
          <p className="font-display text-lg tracking-wide">STYLEMATE</p>
          <p className="text-sm text-ink-900 font-medium">计划</p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={prevWeek} aria-label="上一周"
            className="flex items-center justify-center size-10 rounded-full border border-ink-900/10 bg-white hover:border-ink-900/30">
            <ChevronLeft size={18} className="text-ink-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-1">{monthLabel}</h1>
            <p className="text-sm text-ink-500">{formatDateStr(weekStart)} — {formatDateStr(weekEnd)}</p>
          </div>
          <button type="button" onClick={nextWeek} aria-label="下一周"
            className="flex items-center justify-center size-10 rounded-full border border-ink-900/10 bg-white hover:border-ink-900/30">
            <ChevronRight size={18} className="text-ink-600" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-ink-400">加载中…</div>
        ) : (
          <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {weekDays.map((day, idx) => {
              const dateStr = formatDateStr(day);
              const isToday = day.getTime() === today.getTime();
              const plan = plans[dateStr];

              return (
                <div key={dateStr} className={`rounded-xl border min-h-[180px] lg:min-h-[240px] flex flex-col ${isToday ? 'border-ink-900/30 bg-white shadow-sm' : 'border-ink-900/10 bg-white/60'}`}>
                  <div className={`px-2 py-2 border-b text-center ${isToday ? 'bg-ink-900 text-creme-100' : 'bg-ink-50/50 border-ink-900/5'}`}>
                    <p className="text-[10px] lg:text-xs opacity-70">周{WEEKDAYS[idx]}</p>
                    <p className={`text-lg lg:text-xl font-bold ${isToday ? '' : 'text-ink-900'}`}>{day.getDate()}</p>
                  </div>
                  <div className="flex-1 p-1.5 lg:p-2 space-y-1">
                    {plan ? (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => openDetail(plan.outfitId)}
                          className="w-full text-left bg-ink-100/60 hover:bg-ink-100 rounded-lg p-1.5 transition-colors"
                        >
                          <span className="text-[10px] lg:text-xs text-ink-700 truncate block">{plan.outfitName}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => removePlan(dateStr)} aria-label="移除穿搭"
                            className="shrink-0 text-ink-300 hover:text-red-500"><X size={12} /></button>
                          <button type="button" onClick={() => toggleWorn(dateStr)}
                            className={`flex-1 text-[10px] lg:text-xs py-0.5 rounded-full transition-colors ${plan.worn ? 'bg-green-100 text-green-700 font-medium' : 'text-ink-300 hover:text-ink-500'}`}>
                            {plan.worn ? '✓ 已穿' : '标记已穿'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setPickerDay(dateStr)}
                        className="w-full flex items-center justify-center gap-0.5 text-[10px] lg:text-xs text-ink-300 hover:text-ink-500 py-2">
                        <Plus size={12} /> 添加
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {savedOutfits.length === 0 && !loading && (
          <div className="mt-8 text-center py-12 border border-dashed border-ink-900/10 rounded-2xl">
            <p className="text-sm text-ink-500 mb-3">还没有保存的穿搭方案</p>
            <Link href="/wardrobe" className="inline-flex items-center gap-1.5 bg-ink-900 text-creme-100 px-5 py-2.5 text-sm rounded-full hover:bg-ink-800">
              去衣橱生成穿搭
            </Link>
          </div>
        )}

        {/* 选择穿搭弹窗 */}
        {pickerDay && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[60vh] overflow-y-auto pb-6">
              <div className="sticky top-0 bg-white border-b border-ink-900/10 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink-900">选择穿搭 — {pickerDay}</h3>
                <button type="button" onClick={() => setPickerDay(null)} aria-label="关闭选择" className="text-ink-400 hover:text-ink-600"><X size={20} /></button>
              </div>
              <div className="p-3 space-y-2">
                {savedOutfits.length === 0 ? (
                  <p className="text-sm text-ink-400 text-center py-8">暂无穿搭方案，先去衣橱页面生成吧</p>
                ) : savedOutfits.map(outfit => (
                  <button key={outfit.id} type="button" onClick={() => scheduleOutfit(pickerDay, outfit)}
                    className="w-full text-left p-3 rounded-xl border border-ink-900/10 hover:border-ink-900/30 transition-colors">
                    <p className="font-medium text-sm text-ink-900">{outfit.title || outfit.name || '未命名'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {outfit.occasion?.map(o => <span key={o} className="text-[10px] text-ink-400 bg-ink-50 px-1.5 py-0.5 rounded">{o}</span>)}
                      {outfit.score && <span className="text-[10px] text-ink-400">评分 {outfit.score}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 穿搭详情弹窗 */}
        {detailOutfit && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-y-auto pb-6">
              <div className="sticky top-0 bg-white border-b border-ink-900/10 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-ink-600" />穿搭详情
                </h3>
                <button type="button" onClick={() => setDetailOutfit(null)} aria-label="关闭详情" className="text-ink-400 hover:text-ink-600"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* 标题 + 评分 */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink-900">{detailOutfit.title || detailOutfit.name || '未命名'}</h2>
                  {detailOutfit.score && (
                    <span className="bg-ink-50 rounded-full px-3 py-1 text-sm font-semibold text-ink-600">{detailOutfit.score} 分</span>
                  )}
                </div>

                {/* 场合标签 */}
                {detailOutfit.occasion && detailOutfit.occasion.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {detailOutfit.occasion.map(o => <span key={o} className="text-xs text-ink-500 bg-ink-50 px-2 py-0.5 rounded-full">{o}</span>)}
                  </div>
                )}

                {/* 单品照片网格 */}
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.2em] text-ink-400 mb-2">穿搭单品</h4>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {detailOutfit.items?.map((it: { itemId: string; position: number }) => {
                      const photo = itemPhotos.get(it.itemId);
                      return (
                        <div key={it.itemId} className="flex flex-col items-center gap-1">
                          <div className="size-14 sm:size-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                            {photo ? (
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Shirt size={20} className="text-gray-300" />
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">#{it.position + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setDetailOutfit(null)}
                    className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400">关闭</button>
                  <Link href={`/wardrobe/items/${detailOutfit.items?.[0]?.itemId || ''}`}
                    className="flex-1 rounded-full bg-ink-900 py-2.5 text-sm font-medium text-creme-100 hover:bg-ink-700 text-center">
                    查看单品
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
