'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2,
  X,
  Sparkles,
  Cloud,
  Check,
  AlertTriangle,
  Shirt,
  Lock,
  Calendar,
} from 'lucide-react';
import {
  generateTodayOutfit,
  saveOutfit,
} from '@/lib/today-outfit-api';
import { recordWear, fetchWardrobeItems } from '@/lib/wardrobe-api';
import type { WardrobeItem } from '@/lib/wardrobe-types';
import {
  TodayOutfitResponse,
  OutfitPlan,
  OCCASION_OPTIONS,
  STYLE_GOAL_OPTIONS,
  PLAN_TYPE_LABELS,
  PLAN_TYPE_EMOJI,
} from '@/lib/today-outfit-types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CONSTRAINT_PRESETS = [
  '不想穿裙子', '不想穿高跟鞋', '今天要走很多路',
  '不想太暴露', '不想穿深色', '需要方便穿脱',
];

/** 生成 YYYY-MM-DD 格式日期 */
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 快捷日期 */
function todayStr() { return fmtDate(new Date()); }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate() + 1); return fmtDate(d); }
function dayAfterStr() { const d = new Date(); d.setDate(d.getDate() + 2); return fmtDate(d); }

export default function TodayOutfitDialog({ open, onClose }: Props) {
  const [city, setCity] = useState('');
  const [occasion, setOccasion] = useState('commute');
  const [styleGoal, setStyleGoal] = useState('comfortable');
  const [constraints, setConstraints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TodayOutfitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 衣橱物品 id→photo 映射
  const [itemPhotoMap, setItemPhotoMap] = useState<Map<string, string>>(new Map());
  // 保存相关
  const [savingPlan, setSavingPlan] = useState<OutfitPlan | null>(null);
  const [saveDate, setSaveDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set());

  // 弹窗打开时预加载衣橱物品照片
  useEffect(() => {
    if (open) {
      fetchWardrobeItems().then((items: WardrobeItem[]) => {
        const map = new Map<string, string>();
        for (const item of items) {
          if (item.imageUrls?.[0]) map.set(item.id, item.imageUrls[0]);
        }
        setItemPhotoMap(map);
      }).catch(() => { /* 静默 */ });
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!city.trim()) { setError('请输入城市名'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await generateTodayOutfit({ city: city.trim(), occasion, styleGoal, constraints });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally { setLoading(false); }
  };

  /** 点击保存 → 打开日期选择器 */
  const startSave = (plan: OutfitPlan) => {
    setSavingPlan(plan);
    setSaveDate(todayStr());
  };

  /** 确认保存：存后端 + 写入计划 */
  const confirmSave = async () => {
    if (!result || !savingPlan) return;
    setSaving(true);
    try {
      const saved = await saveOutfit({ plan: savingPlan, weather: result.weather, occasion, styleGoal });

      // 更新每个单品的穿着次数
      const slots = [savingPlan.top, savingPlan.bottom, savingPlan.outerwear, savingPlan.shoes, savingPlan.accessory];
      for (const slot of slots) {
        if (slot?.itemId) { try { await recordWear(slot.itemId); } catch { /* 静默 */ } }
      }

      // 写入 localStorage 计划
      try {
        const raw = localStorage.getItem('stylemate.plan');
        const plans = raw ? JSON.parse(raw) : {};
        if (plans && typeof plans === 'object' && !Array.isArray(plans)) {
          plans[saveDate] = {
            outfitId: saved.id,
            outfitName: savingPlan.title,
            worn: false,
          };
          localStorage.setItem('stylemate.plan', JSON.stringify(plans));
        } else {
          localStorage.setItem('stylemate.plan', JSON.stringify({
            [saveDate]: { outfitId: saved.id, outfitName: savingPlan.title, worn: false },
          }));
        }
      } catch { /* 静默 */ }

      setSavedPlans(prev => new Set(prev).add(savingPlan.type));
      setSavingPlan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally { setSaving(false); }
  };

  const toggleConstraint = (c: string) => {
    setConstraints(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleClose = () => {
    setResult(null); setError(null); setSavedPlans(new Set()); setSavingPlan(null); onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Sparkles size={20} className="text-ink-600" /> 今天穿什么
          </h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 py-5">
          {/* 输入表单 */}
          {!result && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">城市</label>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="如：北京、上海、深圳"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-ink-400" />
                <p className="mt-1 text-xs text-gray-400">根据城市自动获取实时天气和温度</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">今天场合</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_OPTIONS.map(o => (
                    <button key={o.value} type="button" onClick={() => setOccasion(o.value)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${occasion === o.value ? 'bg-ink-900 text-creme-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">风格目标</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_GOAL_OPTIONS.map(o => (
                    <button key={o.value} type="button" onClick={() => setStyleGoal(o.value)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${styleGoal === o.value ? 'bg-ink-900 text-creme-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">限制条件（可选）</label>
                <div className="flex flex-wrap gap-2">
                  {CONSTRAINT_PRESETS.map(c => (
                    <button key={c} type="button" onClick={() => toggleConstraint(c)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${constraints.includes(c) ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {constraints.includes(c) ? '✓ ' : ''}{c}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
              <button type="button" onClick={handleGenerate} disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:opacity-60">
                {loading ? <><Loader2 size={18} className="animate-spin" />AI 正在搭配中…</> : <><Sparkles size={18} />生成今日穿搭</>}
              </button>
            </div>
          )}

          {/* 结果展示 */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">
                <Cloud size={20} className="text-blue-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">{result.weather.city}</span>
                  <span className="ml-2 text-sm text-gray-600">{result.weather.condition} {result.weather.temperature}°C（体感 {result.weather.apparentTemperature}°C）</span>
                </div>
                {result.weather.isRaining && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">🌧️ 今天有雨</span>}
              </div>
              {result.plans.map(plan => (
                <PlanCard key={plan.type} plan={plan} photoMap={itemPhotoMap}
                  onSave={() => startSave(plan)} saved={savedPlans.has(plan.type)} />
              ))}
              <button type="button" onClick={() => setResult(null)}
                className="w-full rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400">
                重新选择条件
              </button>
              {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* 日期选择器 Modal */}
      {savingPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-semibold text-ink-900 mb-4">选择穿搭日期</h3>
            <p className="text-sm text-ink-500 mb-4">将「{savingPlan.title}」安排到哪一天？</p>
            {/* 快捷日期 */}
            <div className="flex gap-2 mb-4">
              {[
                { label: '今天', val: todayStr() },
                { label: '明天', val: tomorrowStr() },
                { label: '后天', val: dayAfterStr() },
              ].map(d => (
                <button key={d.val} type="button" onClick={() => setSaveDate(d.val)}
                  className={`flex-1 rounded-full py-2 text-xs font-medium transition-colors ${saveDate === d.val ? 'bg-ink-900 text-creme-100' : 'border border-ink-900/10 text-ink-600 hover:border-ink-900/30'}`}>
                  {d.label}<br /><span className="opacity-60 text-[10px]">{d.val}</span>
                </button>
              ))}
            </div>
            {/* 自定义日期 */}
            <div className="mb-5">
              <label className="block text-xs text-ink-400 mb-1">自定义日期</label>
              <input type="date" value={saveDate} onChange={e => setSaveDate(e.target.value)}
                className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-ink-900/30" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setSavingPlan(null)}
                className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400">取消</button>
              <button type="button" onClick={confirmSave} disabled={saving}
                className="flex-1 rounded-full bg-ink-900 py-2.5 text-sm font-medium text-creme-100 hover:bg-ink-700 disabled:opacity-60 flex items-center justify-center gap-1.5">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? '保存中…' : '确认保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 单个穿搭方案卡片 */
function PlanCard({
  plan, photoMap, onSave, saved,
}: {
  plan: OutfitPlan; photoMap: Map<string, string>; onSave: () => void; saved: boolean;
}) {
  const slots: { label: string; item: OutfitPlan['top'] }[] = [
    { label: '上衣', item: plan.top },
    { label: '下装', item: plan.bottom },
    { label: '外套', item: plan.outerwear },
    { label: '鞋子', item: plan.shoes },
    { label: '配饰', item: plan.accessory },
  ];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{PLAN_TYPE_EMOJI[plan.type]}</span>
          <div>
            <p className="text-xs text-gray-400">{PLAN_TYPE_LABELS[plan.type]}</p>
            <h3 className="text-sm font-bold text-gray-900">{plan.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
          <span className="text-xs font-semibold text-ink-600">{plan.score}</span>
          <span className="text-xs text-ink-400">分</span>
        </div>
      </div>

      {/* 单品列表 — 优先显示真实照片 */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {slots.map(slot => {
          const photoUrl = slot.item?.itemId ? photoMap.get(slot.item.itemId) : undefined;
          return (
            <div key={slot.label} className="flex flex-col items-center rounded-lg bg-gray-50 p-2">
              {photoUrl ? (
                <img src={photoUrl} alt={slot.label}
                  className="size-12 sm:size-14 object-cover rounded-md" />
              ) : (
                <Shirt size={16} className="text-gray-300" />
              )}
              <span className="mt-1 text-[10px] text-gray-400">{slot.label}</span>
              {slot.item ? (
                <span className="mt-0.5 line-clamp-2 text-center text-[10px] sm:text-xs text-gray-700">
                  {slot.item.description}
                </span>
              ) : (
                <span className="mt-0.5 text-[10px] text-gray-300">—</span>
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
            <AlertTriangle size={11} />{plan.riskWarning}
          </span>
        )}
      </div>
      <button type="button" onClick={onSave} disabled={saved}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2 text-xs font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60">
        {saved ? <><Check size={14} />已保存</> : <><Calendar size={14} />选择日期并保存</>}
      </button>
    </div>
  );
}
