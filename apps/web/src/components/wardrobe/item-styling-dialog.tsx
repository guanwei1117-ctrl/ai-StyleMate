'use client';

import { useEffect, useState } from 'react';
import {
  Loader2, X, Sparkles, AlertTriangle, Shirt, ShoppingBag, Check,
} from 'lucide-react';
import { styleWardrobeItem, fetchWardrobeItems, addShoppingItems } from '@/lib/wardrobe-api';
import type {
  WardrobeItem,
  ItemStylingResult,
  ItemStylingPlan,
} from '@/lib/wardrobe-types';
import { STYLING_PLAN_LABELS } from '@/lib/wardrobe-types';

interface Props {
  open: boolean;
  item: WardrobeItem | null;
  onClose: () => void;
}

const SLOT_ORDER = ['hat', 'top', 'bottom', 'outerwear', 'shoes', 'bag', 'accessory'] as const;
const SLOT_LABELS: Record<string, string> = { hat: '帽子', top: '上衣', bottom: '下装', outerwear: '外套', shoes: '鞋子', bag: '包包', accessory: '配饰' };
const PLAN_EMOJI: Record<ItemStylingPlan['type'], string> = { safe: '🛡️', flattering: '✨', vibe: '🎨' };
const OCCASIONS = ['通勤', '约会', '周末出行', '正式场合', '旅行'];

export default function ItemStylingDialog({ open, item, onClose }: Props) {
  const [occasion, setOccasion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ItemStylingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoMap, setPhotoMap] = useState<Map<string, string>>(new Map());
  const [addedPlans, setAddedPlans] = useState<Set<string>>(new Set());
  const [addingPlan, setAddingPlan] = useState<string | null>(null);

  // 加载衣橱照片映射
  useEffect(() => {
    if (open) {
      fetchWardrobeItems()
        .then((items) => {
          const m = new Map<string, string>();
          for (const i of items) {
            if (i.imageUrls?.[0]) m.set(i.id, i.imageUrls[0]);
          }
          setPhotoMap(m);
        })
        .catch(() => {});
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!item) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAddedPlans(new Set());
    try {
      setResult(await styleWardrobeItem(item.id, occasion || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 把方案中建议购买的单品加入购物清单
  const addPlanToShoppingList = async (plan: ItemStylingPlan) => {
    setAddingPlan(plan.type);
    try {
      const items: Array<{
        category: string;
        description: string;
        budgetRange?: string;
        priority: number;
        reason?: string;
        source: string;
      }> = [];
      for (const slot of SLOT_ORDER) {
        const it = (plan as any)[slot] as { isSuggestion?: boolean; category: string; description: string; budgetHint?: string } | null;
        if (it?.isSuggestion) {
          items.push({
            category: it.category,
            description: it.description,
            budgetRange: it.budgetHint,
            priority: 2,
            reason: `「${plan.title}」方案的补充单品`,
            source: 'item-styling',
          });
        }
      }
      if (items.length === 0) return;
      await addShoppingItems(items);
      setAddedPlans((prev) => new Set(prev).add(plan.type));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入购物清单失败');
    } finally {
      setAddingPlan(null);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setOccasion('');
    onClose();
  };

  if (!open || !item) return null;

  const itemLabel = item.subCategory || item.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Sparkles size={20} className="text-ink-600" />
            帮我搭这件
          </h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* 焦点单品 */}
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-ink-900/10 bg-creme-50 px-4 py-3">
            {item.imageUrls?.[0] ? (
              <img src={item.imageUrls[0]} alt={itemLabel} className="size-14 rounded-lg object-cover" />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-lg bg-white">
                <Shirt size={22} className="text-ink-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-ink-900">
                {item.color} {itemLabel}
              </p>
              <p className="text-xs text-ink-500">
                围绕这件单品，AI 给你 3 套可以直接穿的搭配
              </p>
            </div>
          </div>

          {!result && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">想穿的场合（可选）</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOccasion(occasion === o ? '' : o)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        occasion === o
                          ? 'bg-ink-900 text-creme-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" />AI 正在搭配中…</>
                ) : (
                  <><Sparkles size={18} />生成搭配方案</>
                )}
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.note && (
                <p className="rounded-xl bg-creme-100 px-4 py-3 text-sm text-ink-600">
                  💡 {result.note}
                </p>
              )}
              {result.plans.map((plan) => (
                <StylingPlanCard
                  key={plan.type}
                  plan={plan}
                  photoMap={photoMap}
                  addedToList={addedPlans.has(plan.type)}
                  addingToList={addingPlan === plan.type}
                  onAddToList={() => addPlanToShoppingList(plan)}
                />
              ))}
              <button
                type="button"
                onClick={() => setResult(null)}
                className="w-full rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400"
              >
                换个场合重新搭配
              </button>
              {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StylingPlanCard({
  plan,
  photoMap,
  addedToList,
  addingToList,
  onAddToList,
}: {
  plan: ItemStylingPlan;
  photoMap: Map<string, string>;
  addedToList: boolean;
  addingToList: boolean;
  onAddToList: () => void;
}) {
  const hasSuggestion = SLOT_ORDER.some(
    (slotKey) => ((plan as any)[slotKey] as { isSuggestion?: boolean } | null)?.isSuggestion,
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{PLAN_EMOJI[plan.type]}</span>
          <div>
            <p className="text-xs text-gray-400">{STYLING_PLAN_LABELS[plan.type]}</p>
            <h3 className="text-sm font-bold text-gray-900">{plan.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
          <span className="text-xs font-semibold text-ink-600">{plan.score}</span>
          <span className="text-xs text-ink-400">分</span>
        </div>
      </div>

      {/* 7 slot */}
      <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
        {SLOT_ORDER.map((slotKey) => {
          const slotItem = (plan as any)[slotKey] as {
            itemId: string;
            description: string;
            isSuggestion?: boolean;
            budgetHint?: string;
          } | null;
          const photo = slotItem?.itemId ? photoMap.get(slotItem.itemId) : undefined;
          return (
            <div key={slotKey} className="flex flex-col items-center rounded-lg bg-gray-50 p-1.5">
              {photo ? (
                <img src={photo} alt={SLOT_LABELS[slotKey]} className="size-10 sm:size-12 rounded-md object-cover" />
              ) : slotItem?.isSuggestion ? (
                <div className="flex size-10 sm:size-12 items-center justify-center rounded-md bg-amber-100">
                  <ShoppingBag size={14} className="text-amber-600" />
                </div>
              ) : (
                <Shirt size={14} className="text-gray-300" />
              )}
              <span className="mt-0.5 text-[9px] text-gray-400">{SLOT_LABELS[slotKey]}</span>
              {slotItem ? (
                <span className="mt-0.5 line-clamp-1 text-center text-[9px] sm:text-[10px] text-gray-700">
                  {slotItem.description}
                </span>
              ) : (
                <span className="mt-0.5 text-[9px] text-gray-300">—</span>
              )}
              {slotItem?.isSuggestion && slotItem.budgetHint && (
                <span className="mt-0.5 line-clamp-1 text-center text-[9px] text-amber-600">
                  {slotItem.budgetHint}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-gray-600">{plan.reason}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-600">{plan.scene}</span>
        {plan.riskWarning && plan.riskWarning !== '无' && (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600">
            <AlertTriangle size={11} />
            {plan.riskWarning}
          </span>
        )}
      </div>
      {hasSuggestion && (
        <button
          type="button"
          onClick={onAddToList}
          disabled={addedToList || addingToList}
          className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-colors ${
            addedToList
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60'
          }`}
        >
          {addingToList ? (
            <Loader2 size={14} className="animate-spin" />
          ) : addedToList ? (
            <Check size={14} />
          ) : (
            <ShoppingBag size={14} />
          )}
          {addedToList ? '已加入购物清单' : '把建议单品加入购物清单'}
        </button>
      )}
    </div>
  );
}
