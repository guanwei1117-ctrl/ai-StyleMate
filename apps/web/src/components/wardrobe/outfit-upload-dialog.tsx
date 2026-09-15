'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnalyzeOutfitResponse, OutfitDetectedItem } from '@/lib/wardrobe-types';

interface Props {
  file: File;
  analysis: AnalyzeOutfitResponse;
  onConfirm: (items: { item: OutfitDetectedItem; dataUrl: string }[]) => void;
  onCancel: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  top: '上衣',
  outerwear: '外套',
  bottom: '下装',
  dress: '连衣裙',
  shoes: '鞋',
  bag: '包',
  hat: '帽子',
  accessory: '配饰',
};

/** 按归一化 bbox 从原图裁剪出单件衣物 */
function cropImage(file: File, bbox: [number, number, number, number]): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const [x0, y0, x1, y1] = bbox;
      const sx = Math.max(0, x0 * W);
      const sy = Math.max(0, y0 * H);
      const sw = Math.min(W - sx, (x1 - x0) * W);
      const sh = Math.min(H - sy, (y1 - y0) * H);
      if (sw <= 0 || sh <= 0) {
        reject(new Error('裁剪区域无效'));
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取 Canvas 上下文'));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

export default function OutfitUploadDialog({ file, analysis, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(analysis.items.map((_, i) => i)),
  );
  const [crops, setCrops] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results: (string | null)[] = [];
      for (const item of analysis.items) {
        if (!item.bbox) {
          results.push(null);
          continue;
        }
        try {
          results.push(await cropImage(file, item.bbox));
        } catch {
          results.push(null);
        }
      }
      if (!cancelled) {
        setCrops(results);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, analysis]);

  const selectedCount = useMemo(
    () => analysis.items.filter((_, i) => selected.has(i)).length,
    [selected, analysis],
  );

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleConfirm = () => {
    const items: { item: OutfitDetectedItem; dataUrl: string }[] = [];
    analysis.items.forEach((item, i) => {
      if (selected.has(i) && crops[i]) {
        items.push({ item, dataUrl: crops[i]! });
      }
    });
    onConfirm(items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-ink-900">
              识别到 {analysis.items.length} 件衣物
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              已按识别结果裁剪，勾选要加入衣橱的衣物（可取消勾选）。
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="关闭"
          >
            <XIcon size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-ink-500">
            <Loader2 size={20} className="animate-spin" />
            正在裁剪衣物…
          </div>
        ) : (
          <>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {analysis.items.map((item, i) => {
                const isSel = selected.has(i);
                return (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition-colors ${
                      isSel ? 'border-primary-400 bg-primary-50' : 'border-ink-100 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSel}
                      onChange={() => toggle(i)}
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        isSel ? 'border-primary-500 bg-primary-500 text-white' : 'border-ink-300'
                      }`}
                    >
                      {isSel && <Check size={14} />}
                    </span>
                    {crops[i] ? (
                      <img
                        src={crops[i]!}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-lg border border-ink-100 object-cover"
                      />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-ink-100 text-xs text-ink-400">
                        裁剪失败
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-900">{item.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
                        <span className="rounded bg-ink-100 px-1.5 py-0.5">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                        <span>{item.color}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button onClick={handleConfirm} disabled={selectedCount === 0}>
                加入衣橱（{selectedCount}）
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
