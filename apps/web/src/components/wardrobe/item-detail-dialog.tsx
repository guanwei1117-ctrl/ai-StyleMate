'use client';

import { useState, useEffect } from 'react';
import { Loader2, X as XIcon, Pencil, Trash2, Check, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  WardrobeItem,
  WardrobeCategory,
  CATEGORY_LABELS,
  SUBCATEGORIES,
  SEASON_LABELS,
} from '@/lib/wardrobe-types';
import {
  updateWardrobeItem,
  deleteWardrobeItem,
} from '@/lib/wardrobe-api';

interface Props {
  item: WardrobeItem | null;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

const CATEGORY_ORDER: WardrobeCategory[] = ['top', 'outerwear', 'bottom', 'dress', 'shoes', 'bag', 'hat', 'accessory'];

export default function ItemDetailDialog({ item, onClose, onDeleted, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 编辑表单状态
  const [subCategory, setSubCategory] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [pattern, setPattern] = useState('');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState('');
  const [occasionTags, setOccasionTags] = useState('');

  // 每次打开弹窗（item 变化）时重置状态
  useEffect(() => {
    if (!item) return;
    setEditing(false);
    setConfirmDelete(false);
    setError(null);
    setSubCategory(item.subCategory || '');
    setColor(item.color || '');
    setMaterial(item.material || '');
    setPattern(item.pattern || '');
    setSeasons(item.season || []);
    setStyleTags(item.styleTags?.join('、') || '');
    setOccasionTags(item.occasionTags?.join('、') || '');
  }, [item]);

  if (!item) return null;

  const toggleSeason = (s: string) => {
    setSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateWardrobeItem(item.id, {
        subCategory: subCategory || item.subCategory,
        color: color || undefined,
        material: material || undefined,
        pattern: pattern || undefined,
        season: seasons,
        styleTags: styleTags ? styleTags.split(/[、,，]/).filter(Boolean) : undefined,
        occasionTags: occasionTags ? occasionTags.split(/[、,，]/).filter(Boolean) : undefined,
      });
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteWardrobeItem(item.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setError(null);
    // 恢复原始值
    setSubCategory(item.subCategory || '');
    setColor(item.color || '');
    setMaterial(item.material || '');
    setPattern(item.pattern || '');
    setSeasons(item.season || []);
    setStyleTags(item.styleTags?.join('、') || '');
    setOccasionTags(item.occasionTags?.join('、') || '');
  };

  const InfoRow = ({ label, value }: { label: string; value?: string | number }) =>
    value ? (
      <div className="flex items-start gap-3">
        <span className="text-xs text-ink-400 w-16 shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-ink-900">{value}</span>
      </div>
    ) : null;

  const EditField = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="mb-1 block text-xs text-ink-500">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* 头部 */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-ink-100">
          <div className="flex items-center gap-3">
            {/* 照片 */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-50 shrink-0">
              {item.imageUrls?.[0] ? (
                <img
                  src={item.imageUrls[0]}
                  alt={item.subCategory || item.category}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Shirt size={24} strokeWidth={1.5} className="text-ink-200" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink-900">
                {item.subCategory || CATEGORY_LABELS[item.category as WardrobeCategory] || item.category}
              </h3>
              <p className="text-xs text-ink-400 mt-0.5">
                {CATEGORY_LABELS[item.category as WardrobeCategory]}
              </p>
              {!editing && (
                <p className="text-xs text-ink-300 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString('zh-CN')} 入库
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
            aria-label="关闭"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}

          {!editing ? (
            /* 只读模式：展示详细信息 */
            <div className="space-y-2.5">
              <InfoRow label="颜色" value={item.color} />
              <InfoRow label="材质" value={item.material} />
              <InfoRow label="图案" value={item.pattern} />
              {item.season?.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-xs text-ink-400 w-16 shrink-0 pt-0.5">季节</span>
                  <div className="flex flex-wrap gap-1">
                    {item.season.map((s) => (
                      <span key={s} className="rounded bg-ink-100 px-2 py-0.5 text-xs text-ink-700">
                        {SEASON_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.styleTags?.length > 0 && (
                <InfoRow label="风格" value={item.styleTags.join('、')} />
              )}
              {item.occasionTags?.length > 0 && (
                <InfoRow label="场合" value={item.occasionTags.join('、')} />
              )}
              {item.brand && <InfoRow label="品牌" value={item.brand} />}
              {item.size && <InfoRow label="尺码" value={item.size} />}
              {item.aiSummary && (
                <div className="mt-3 rounded-lg bg-creme-100 p-3">
                  <p className="text-xs text-ink-500 mb-1">AI 分析</p>
                  <p className="text-xs text-ink-700 leading-relaxed">{item.aiSummary}</p>
                </div>
              )}
            </div>
          ) : (
            /* 编辑模式 */
            <div className="space-y-4">
              {/* 二级子类 */}
              <EditField label="二级类目">
                <div className="flex flex-wrap gap-1.5">
                  {SUBCATEGORIES[item.category as WardrobeCategory]?.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubCategory(s)}
                      className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                        subCategory === s
                          ? 'bg-ink-900 text-creme-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </EditField>

              {/* 颜色 + 材质 */}
              <div className="grid grid-cols-2 gap-3">
                <EditField label="颜色">
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="如：白色"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400"
                  />
                </EditField>
                <EditField label="材质">
                  <input
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="如：棉"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400"
                  />
                </EditField>
              </div>

              {/* 图案 */}
              <EditField label="图案">
                <input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="如：纯色、条纹、印花"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400"
                />
              </EditField>

              {/* 季节 */}
              <EditField label="季节">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SEASON_LABELS).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleSeason(k)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        seasons.includes(k)
                          ? 'bg-ink-900 text-creme-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </EditField>

              {/* 风格标签 */}
              <EditField label="风格标签（用顿号、或逗号分隔）">
                <input
                  value={styleTags}
                  onChange={(e) => setStyleTags(e.target.value)}
                  placeholder="如：休闲、通勤、极简"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400"
                />
              </EditField>

              {/* 场合标签 */}
              <EditField label="场合标签（用顿号、或逗号分隔）">
                <input
                  value={occasionTags}
                  onChange={(e) => setOccasionTags(e.target.value)}
                  placeholder="如：上班、约会、旅行"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ink-400"
                />
              </EditField>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-ink-100">
          {/* 删除 */}
          <div>
            {editing ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 disabled:opacity-60"
              >
                取消
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  confirmDelete
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'border border-red-200 text-red-500 hover:bg-red-50'
                }`}
              >
                {deleting ? <Loader2 size={14} className="animate-spin inline" /> : null}
                {confirmDelete ? '确认删除' : '删除'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/20 px-4 py-2 text-sm text-ink-700 hover:border-ink-900/50 transition-colors"
              >
                <Pencil size={14} />
                编辑信息
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-creme-100 hover:bg-ink-800 disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? '保存中…' : '保存'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
