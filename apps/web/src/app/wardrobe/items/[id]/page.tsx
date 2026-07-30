'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Check, Loader2 } from 'lucide-react';
import Navigation from '@/components/home/navigation';
import Footer from '@/components/home/footer';
import {
  fetchWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  recordWear,
} from '@/lib/wardrobe-api';
import {
  WardrobeItem,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  SEASON_LABELS,
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWardrobeItem(id);
      setItem(data);
      setEditColor(data.color);
      setEditMaterial(data.material);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await updateWardrobeItem(item.id, {
        color: editColor,
        material: editMaterial,
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

  const handleWear = async () => {
    if (!item) return;
    try {
      const updated = await recordWear(item.id);
      setItem(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : '记录失败');
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500">{error ?? '未找到该衣物'}</p>
          <Link href="/wardrobe" className="text-ink-600 hover:underline">
            返回衣橱
          </Link>
        </div>
      </>
    );
  }

  const emoji =
    CATEGORY_EMOJI[item.category as keyof typeof CATEGORY_EMOJI] ?? '👕';
  const label =
    CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ??
    item.category;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/wardrobe"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft size={16} /> 返回衣橱
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 图片区 */}
            <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-gray-100 text-8xl">
              {emoji}
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
                  <span className="text-gray-700">{item.pattern}</span>
                </Row>
                <Row label="季节">
                  <span className="text-gray-700">
                    {item.season
                      .map((s) => SEASON_LABELS[s] ?? s)
                      .join(' / ')}
                  </span>
                </Row>
                <Row label="正式程度">
                  <ScoreBar value={item.formalityScore} max={5} />
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
                <Row label="穿着次数">
                  <span className="text-gray-700">{item.wearCount} 次</span>
                </Row>
                {item.lastWornAt && (
                  <Row label="上次穿着">
                    <span className="text-gray-700">
                      {new Date(item.lastWornAt).toLocaleDateString('zh-CN')}
                    </span>
                  </Row>
                )}
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
                  onClick={handleWear}
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:border-gray-400"
                >
                  记录今天穿了
                </button>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-full bg-gray-100 px-5 py-2 text-sm text-gray-400"
                  title="Phase 2 上线"
                >
                  帮我搭这件（即将上线）
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
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
