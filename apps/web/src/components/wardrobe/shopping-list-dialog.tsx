'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, X, ShoppingBag, Check, Trash2, Plus, Wallet,
} from 'lucide-react';
import {
  fetchShoppingList,
  updateShoppingItem,
  deleteShoppingItem,
} from '@/lib/wardrobe-api';
import {
  ShoppingListItem,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from '@/lib/wardrobe-types';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** 解析预算区间 "¥400-800" → [min, max] */
function parseBudgetRange(range?: string): [number, number] | null {
  if (!range) return null;
  const nums = range.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  const min = Number(nums[0]);
  const max = nums.length > 1 ? Number(nums[1]) : min;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return [Math.min(min, max), Math.max(min, max)];
}

export default function ShoppingListDialog({ open, onClose }: Props) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showPurchased, setShowPurchased] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchShoppingList());
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const togglePurchased = async (item: ShoppingListItem) => {
    setBusyId(item.id);
    try {
      await updateShoppingItem(item.id, { purchased: !item.purchased });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item: ShoppingListItem) => {
    setBusyId(item.id);
    try {
      await deleteShoppingItem(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setBusyId(null);
    }
  };

  if (!open) return null;

  const pending = items.filter((i) => !i.purchased);
  const purchased = items.filter((i) => i.purchased);

  // 未购买项预算合计
  let totalMin = 0;
  let totalMax = 0;
  let totalCount = 0;
  for (const it of pending) {
    const range = parseBudgetRange(it.budgetRange);
    if (range) {
      totalMin += range[0];
      totalMax += range[1];
      totalCount++;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <ShoppingBag size={20} className="text-ink-600" />
            我的购物清单
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-3 rounded-full bg-ink-900 px-5 py-2 text-sm text-creme-100"
              >
                重试
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-5xl">🛍️</div>
              <h3 className="mt-3 font-semibold text-ink-900">清单还是空的</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-ink-500">
                去做一次「衣橱缺口分析」，把建议补的单品一键加进来；空衣橱起步方案的购买建议也可以直接加入。
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 预算合计 */}
              {totalCount > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-creme-100 px-4 py-3">
                  <Wallet size={18} className="text-ink-600" />
                  <div>
                    <p className="text-xs text-ink-400">待购 {pending.length} 件 · 预估总预算</p>
                    <p className="text-sm font-semibold text-ink-900">
                      {totalMin === totalMax ? `¥${totalMin}` : `¥${totalMin} - ¥${totalMax}`}
                    </p>
                  </div>
                </div>
              )}

              {/* 待购列表（按优先级） */}
              {pending.length > 0 && (
                <div className="space-y-2">
                  {pending.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      busy={busyId === item.id}
                      onToggle={() => togglePurchased(item)}
                      onRemove={() => remove(item)}
                    />
                  ))}
                </div>
              )}

              {/* 已购 */}
              {purchased.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPurchased((s) => !s)}
                    className="mb-2 text-xs font-medium text-ink-400 hover:text-ink-600"
                  >
                    {showPurchased ? '收起' : '展开'}已购 ({purchased.length})
                  </button>
                  {showPurchased && (
                    <div className="space-y-2 opacity-60">
                      {purchased.map((item) => (
                        <ShoppingItemRow
                          key={item.id}
                          item={item}
                          busy={busyId === item.id}
                          onToggle={() => togglePurchased(item)}
                          onRemove={() => remove(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {pending.length === 0 && purchased.length > 0 && (
                <p className="text-center text-sm text-ink-400">清单已全部买齐 🎉</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShoppingItemRow({
  item,
  busy,
  onToggle,
  onRemove,
}: {
  item: ShoppingListItem;
  busy: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const label =
    item.description ||
    [item.color, item.subCategory || CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]]
      .filter(Boolean)
      .join(' ') ||
    item.category;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        item.purchased ? 'border-gray-100 bg-gray-50' : 'border-ink-900/10 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        aria-label={item.purchased ? '标记为未买' : '标记为已买'}
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
          item.purchased
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 text-transparent hover:border-green-400'
        }`}
      >
        <Check size={14} />
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm ${item.purchased ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {label}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {!item.purchased && item.priority !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                item.priority === 1
                  ? 'bg-red-50 text-red-600'
                  : item.priority === 2
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {PRIORITY_LABELS[item.priority] ?? '其次'}
            </span>
          )}
          {item.budgetRange && (
            <span className="text-[10px] text-ink-400">{item.budgetRange}</span>
          )}
          {item.reason && !item.purchased && (
            <span className="truncate text-[10px] text-ink-400">{item.reason}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        aria-label="删除"
        className="shrink-0 text-gray-300 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
