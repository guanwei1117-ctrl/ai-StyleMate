'use client';

import { useState } from 'react';
import { Loader2, X, Plus } from 'lucide-react';
import { addWardrobeItem } from '@/lib/wardrobe-api';
import {
  WardrobeCategory,
  CATEGORY_LABELS,
  SUBCATEGORIES,
} from '@/lib/wardrobe-types';

interface Props { open: boolean; onClose: () => void; onAdded: () => void; }

const CATEGORY_ORDER: WardrobeCategory[] = ['top', 'outerwear', 'bottom', 'dress', 'shoes', 'bag', 'hat', 'accessory'];

export default function ManualAddDialog({ open, onClose, onAdded }: Props) {
  const [category, setCategory] = useState<WardrobeCategory>('top');
  const [subCategory, setSubCategory] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [pattern, setPattern] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!subCategory) { setError('请选择二级子类'); return; }
    setSaving(true);
    setError(null);
    try {
      await addWardrobeItem({ category, subCategory, color: color || undefined, material: material || undefined, pattern: pattern || undefined });
      onAdded();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally { setSaving(false); }
  };

  const reset = () => {
    setCategory('top'); setSubCategory(''); setColor(''); setMaterial(''); setPattern('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2"><Plus size={18} />手动录入衣物</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          {/* 一级类目 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">一级类目</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_ORDER.map(c => (
                <button key={c} type="button"
                  onClick={() => { setCategory(c); setSubCategory(''); }}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${category === c ? 'bg-ink-900 text-creme-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* 二级子类 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">二级子类</label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {SUBCATEGORIES[category].map(s => (
                <button key={s} type="button"
                  onClick={() => setSubCategory(s)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${subCategory === s ? 'bg-ink-900 text-creme-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 可选属性 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">颜色（选填）</label>
              <input value={color} onChange={e => setColor(e.target.value)} placeholder="如：白色" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">材质（选填）</label>
              <input value={material} onChange={e => setMaterial(e.target.value)} placeholder="如：棉" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">图案（选填）</label>
            <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="如：条纹、印花、纯色" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400" />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400">取消</button>
            <button type="button" onClick={handleSubmit} disabled={saving}
              className="flex-1 rounded-full bg-ink-900 py-2.5 text-sm font-medium text-creme-100 hover:bg-ink-700 disabled:opacity-60 flex items-center justify-center gap-1.5">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? '添加中…' : '添加'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
