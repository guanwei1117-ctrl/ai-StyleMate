'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnalyzeOutfitResponse, OutfitDetectedItem } from '@/lib/wardrobe-types';
import { recognizeAndAddItem } from '@/lib/wardrobe-api';

interface Props {
  file: File;
  analysis: AnalyzeOutfitResponse;
  onUploaded: () => void;
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

/** 将 dataURL 转成 File */
function dataUrlToFile(dataUrl: string, name: string): File {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

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
      if (sw <= 0 || sh <= 0) { reject(new Error('裁剪区域无效')); return; }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('无法获取 Canvas 上下文')); return; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')); };
    img.src = url;
  });
}

export default function OutfitUploadDialog({ file, analysis, onUploaded, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(analysis.items.map((_, i) => i)),
  );
  const [crops, setCrops] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(true);

  // 保存状态（新增）
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [savingErrors, setSavingErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results: (string | null)[] = [];
      for (const item of analysis.items) {
        if (!item.bbox) { results.push(null); continue; }
        try { results.push(await cropImage(file, item.bbox)); }
        catch { results.push(null); }
      }
      if (!cancelled) { setCrops(results); setLoading(false); }
    })();
    return () => { cancelled = true; };
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

  const handleConfirm = async () => {
    const items: { item: OutfitDetectedItem; dataUrl: string }[] = [];
    analysis.items.forEach((item, i) => {
      if (selected.has(i) && crops[i]) {
        items.push({ item, dataUrl: crops[i]! });
      }
    });

    if (items.length === 0) return;

    setSaving(true);
    setProgress({ current: 0, total: items.length });
    setSavingErrors([]);

    let succeeded = 0;
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const name = items[i].item.name || `衣物${i + 1}`;
        const f = dataUrlToFile(items[i].dataUrl, `${name}.png`);
        await recognizeAndAddItem(f);
        succeeded++;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : '识别失败');
      }
      setProgress({ current: i + 1, total: items.length });
    }

    setSaving(false);

    if (succeeded > 0) onUploaded();
    if (errors.length > 0) setSavingErrors(errors);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative">

        {/* 保存中遮罩 */}
        {saving && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm">
            <Loader2 size={32} className="animate-spin text-ink-400 mb-3" />
            <p className="text-sm font-medium text-ink-900">正在保存…</p>
            <p className="text-xs text-ink-400 mt-1">
              已保存 {progress.current} / {progress.total} 件
            </p>
            {/* 进度条 */}
            <div className="w-48 h-1.5 bg-ink-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-ink-900 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-ink-300 mt-2">AI 识别需要几秒，请耐心等待</p>
          </div>
        )}

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-ink-900">
              识别到 {analysis.items.length} 件衣物
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              已按识别结果裁剪，勾选要加入衣橱的衣物（可取消勾选）。
            </p>
          </div>
          {!saving && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              aria-label="关闭"
            >
              <XIcon size={20} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-ink-500">
            <Loader2 size={20} className="animate-spin" />
            正在裁剪衣物…
          </div>
        ) : (
          <>
            {savingErrors.length > 0 && (
              <div className="mb-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                部分衣物保存失败：{savingErrors.join('；')}
              </div>
            )}

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
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                取消
              </Button>
              <Button onClick={handleConfirm} disabled={selectedCount === 0 || saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                加入衣橱（{selectedCount}）
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
