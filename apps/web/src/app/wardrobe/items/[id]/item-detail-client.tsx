'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Check, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import {
  fetchWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
} from '@/lib/wardrobe-api';
import { fetchShoppingLinks, openShoppingLink } from '@/lib/shopping-api';
import ItemStylingDialog from '@/components/wardrobe/item-styling-dialog';
import {
  WardrobeItem,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  SEASON_LABELS,
  SUBCATEGORIES,
} from '@/lib/wardrobe-types';

export default function WardrobeItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editColor, setEditColor] = useState('');
  const [editMaterial, setEditMaterial] = useState('');
  const [editPattern, setEditPattern] = useState('');
  const [editSeason, setEditSeason] = useState<string[]>([]);
  const [editFormality, setEditFormality] = useState(3);
  const [editStyleTags, setEditStyleTags] = useState<string[]>([]);
  const [editOccasionTags, setEditOccasionTags] = useState<string[]>([]);
  const [editSubCategory, setEditSubCategory] = useState('');
  const [stylingOpen, setStylingOpen] = useState(false);
  const [searchingTaobao, setSearchingTaobao] = useState(false);

  // 淘宝找同款：用这件单品自身信息 + 个人画像生成搜索
  const handleSearchTaobao = async () => {
    if (!item) return;
    setSearchingTaobao(true);
    setError(null);
    try {
      const result = await fetchShoppingLinks({
        category: item.category,
        subCategory: item.subCategory || undefined,
        color: item.color || undefined,
        styleTags: item.styleTags?.length ? item.styleTags : undefined,
      });
      openShoppingLink(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成搜索链接失败');
    } finally {
      setSearchingTaobao(false);
    }
  };

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWardrobeItem(id, signal);
      setItem(data);
      setEditColor(data.color);
      setEditMaterial(data.material);
      setEditPattern(data.pattern || '');
      setEditSeason(data.season || []);
      setEditFormality(data.formalityScore ?? 3);
      setEditStyleTags(data.styleTags || []);
      setEditOccasionTags(data.occasionTags || []);
      setEditSubCategory(data.subCategory || '');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof TypeError && err.message === 'Failed to fetch'
        ? '无法连接后端服务，请确认 API 已启动'
        : err instanceof Error ? err.message : '加载失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await updateWardrobeItem(item.id, {
        color: editColor,
        material: editMaterial,
        pattern: editPattern,
        season: editSeason,
        formalityScore: editFormality,
        styleTags: editStyleTags,
        occasionTags: editOccasionTags,
        subCategory: editSubCategory,
      });
      setItem(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm('确定删除这件衣物？')) return;
    try {
      await deleteWardrobeItem(item.id);
      router.push('/wardrobe');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 pb-24">
        <p className="text-red-500">{error ?? '未找到该衣物'}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => load()}
            className="rounded-full bg-ink-900 px-5 py-2 text-sm text-creme-100 hover:bg-ink-800 transition-colors"
          >
            重试
          </button>
          <Link href="/wardrobe" className="text-ink-600 hover:underline text-sm">
            返回衣橱
          </Link>
        </div>
      </div>
    );
  }

  const emoji =
    CATEGORY_EMOJI[item.category as keyof typeof CATEGORY_EMOJI] ?? '👕';
  const label =
    CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ??
    item.category;

  return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/wardrobe"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft size={16} /> 返回衣橱
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 图片区 */}
            <div className="flex h-80 items-center justify-center rounded-2xl bg-white border border-gray-100 overflow-hidden">
              {item.imageUrls?.length > 0 ? (
                <img
                  src={item.imageUrls[0]}
                  alt={label}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <span className="text-8xl">{emoji}</span>
              )}
            </div>

            {/* 信息区 */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {label}
                    {item.subCategory && (
                      <span className="ml-2 text-base font-normal text-gray-400">
                        {item.subCategory}
                      </span>
                    )}
                  </h1>
                  {item.aiSummary && (
                    <p className="mt-1 text-gray-500">{item.aiSummary}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="删除"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* 标签 */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.styleTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-600"
                  >
                    {tag}
                  </span>
                ))}
                {item.occasionTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 属性表 */}
              <dl className="mt-6 space-y-3 text-sm">
                <Row label="子类">
                  {editing ? (
                    <select value={editSubCategory} onChange={(e) => setEditSubCategory(e.target.value)}
                      className="border border-gray-300 rounded px-1 py-0.5 outline-none focus:border-ink-500">
                      <option value="">— 选择 —</option>
                      {SUBCATEGORIES[item.category]?.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-700">{item.subCategory || '—'}</span>
                  )}
                </Row>
                <Row label="颜色">
                  {editing ? (
                    <input
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="border-b border-gray-300 px-1 outline-none focus:border-ink-500"
                    />
                  ) : (
                    <span className="text-gray-700">{item.color}</span>
                  )}
                </Row>
                <Row label="材质">
                  {editing ? (
                    <input
                      value={editMaterial}
                      onChange={(e) => setEditMaterial(e.target.value)}
                      className="border-b border-gray-300 px-1 outline-none focus:border-ink-500"
                    />
                  ) : (
                    <span className="text-gray-700">{item.material}</span>
                  )}
                </Row>
                <Row label="图案">
                  {editing ? (
                    <input value={editPattern} onChange={(e) => setEditPattern(e.target.value)} placeholder="如：条纹、印花、纯色"
                      className="border-b border-gray-300 px-1 outline-none focus:border-ink-500 w-40" />
                  ) : (
                    <span className="text-gray-700">{item.pattern || '—'}</span>
                  )}
                </Row>
                <Row label="季节">
                  {editing ? (
                    <div className="flex flex-wrap gap-1">
                      {(['spring','summer','autumn','winter'] as const).map(s => (
                        <button key={s} type="button" onClick={() => setEditSeason(p => p.includes(s)?p.filter(x=>x!==s):[...p,s])}
                          className={`rounded-full px-2 py-0.5 text-xs ${editSeason.includes(s)?'bg-ink-900 text-creme-100':'bg-gray-100 text-gray-600'}`}>
                          {SEASON_LABELS[s]}</button>))}
                    </div>
                  ) : (
                    <span className="text-gray-700">{item.season.map(s => SEASON_LABELS[s]??s).join(' / ') || '—'}</span>
                  )}
                </Row>
                <Row label="正式程度">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input type="range" min={1} max={5} value={editFormality} onChange={e => setEditFormality(Number(e.target.value))} className="w-24" />
                      <span className="text-xs text-ink-400">{editFormality}/5</span>
                    </div>
                  ) : (<ScoreBar value={item.formalityScore} max={5} />)}
                </Row>
                <Row label="厚薄程度">
                  <ScoreBar value={item.warmthScore} max={5} />
                </Row>
                <Row label="百搭程度">
                  <ScoreBar value={item.matchabilityScore} max={10} />
                </Row>
                {item.fitRisk && item.fitRisk !== '无' && (
                  <Row label="身材风险">
                    <span className="text-amber-600">{item.fitRisk}</span>
                  </Row>
                )}
                {item.matchColors.length > 0 && (
                  <Row label="可搭颜色">
                    <span className="text-gray-700">
                      {item.matchColors.join('、')}
                    </span>
                  </Row>
                )}
                {item.matchCategories.length > 0 && (
                  <Row label="可搭品类">
                    <span className="text-gray-700">
                      {item.matchCategories.join('、')}
                    </span>
                  </Row>
                )}
                <Row label="风格标签">
                  {editing ? (
                    <input value={editStyleTags.join('、')} onChange={(e) => setEditStyleTags(e.target.value.split(/[,，、]/).map(s=>s.trim()).filter(Boolean))}
                      placeholder="如：韩系、极简、通勤" className="border-b border-gray-300 px-1 outline-none focus:border-ink-500 w-56" />
                  ) : (
                    <span className="text-gray-700">{item.styleTags?.join('、') || '—'}</span>
                  )}
                </Row>
                <Row label="场合标签">
                  {editing ? (
                    <input value={editOccasionTags.join('、')} onChange={(e) => setEditOccasionTags(e.target.value.split(/[,，、]/).map(s=>s.trim()).filter(Boolean))}
                      placeholder="如：通勤、约会、运动" className="border-b border-gray-300 px-1 outline-none focus:border-ink-500 w-56" />
                  ) : (
                    <span className="text-gray-700">{item.occasionTags?.join('、') || '—'}</span>
                  )}
                </Row>
              </dl>

              {/* 操作 */}
              <div className="mt-6 flex gap-3">
                {editing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2 text-sm text-creme-100 disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    保存
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-full border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:border-gray-400"
                  >
                    编辑
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStylingOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2 text-sm text-creme-100 transition-colors hover:bg-ink-700"
                >
                  <Sparkles size={16} />
                  帮我搭这件
                </button>
                <button
                  type="button"
                  onClick={handleSearchTaobao}
                  disabled={searchingTaobao}
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 px-5 py-2 text-sm text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-60"
                  title="按这件单品的颜色、品类和你的风格画像去淘宝找同款"
                >
                  {searchingTaobao ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                  淘宝找同款
                </button>
              </div>
            </div>
          </div>
        </div>
        <ItemStylingDialog open={stylingOpen} item={item} onClose={() => setStylingOpen(false)} />
      </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-ink-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {value}/{max}
      </span>
    </div>
  );
}
