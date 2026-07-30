'use client';

import { useState } from 'react';
import {
  Loader2,
  X,
  Sparkles,
  Cloud,
  Check,
  AlertTriangle,
  Shirt,
  Lock,
} from 'lucide-react';
import {
  generateTodayOutfit,
  saveOutfit,
} from '@/lib/today-outfit-api';
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
  '不想穿裙子',
  '不想穿高跟鞋',
  '今天要走很多路',
  '不想太暴露',
  '不想穿深色',
  '需要方便穿脱',
];

export default function TodayOutfitDialog({ open, onClose }: Props) {
  const [city, setCity] = useState('');
  const [occasion, setOccasion] = useState('commute');
  const [styleGoal, setStyleGoal] = useState('comfortable');
  const [constraints, setConstraints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TodayOutfitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!city.trim()) {
      setError('请输入城市名');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateTodayOutfit({
        city: city.trim(),
        occasion,
        styleGoal,
        constraints,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (plan: OutfitPlan) => {
    if (!result) return;
    setSavingId(plan.type);
    try {
      await saveOutfit({
        plan,
        weather: result.weather,
        occasion,
        styleGoal,
      });
      setSavedPlans((prev) => new Set(prev).add(plan.type));
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSavingId(null);
    }
  };

  const toggleConstraint = (c: string) => {
    setConstraints((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setSavedPlans(new Set());
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Sparkles size={20} className="text-ink-600" />
            今天穿什么
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* 输入表单 */}
          {!result && (
            <div className="space-y-5">
              {/* 城市 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  城市
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="如：北京、上海、深圳"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-ink-400"
                />
                <p className="mt-1 text-xs text-gray-400">
                  根据城市自动获取实时天气和温度
                </p>
              </div>

              {/* 场合 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  今天场合
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setOccasion(o.value)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        occasion === o.value
                          ? 'bg-ink-900 text-creme-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 风格目标 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  风格目标
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_GOAL_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setStyleGoal(o.value)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        styleGoal === o.value
                          ? 'bg-ink-900 text-creme-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 限制条件 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  限制条件（可选）
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONSTRAINT_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConstraint(c)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        constraints.includes(c)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {constraints.includes(c) ? '✓ ' : ''}
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    AI 正在搭配中…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    生成今日穿搭
                  </>
                )}
              </button>
            </div>
          )}

          {/* 结果展示 */}
          {result && (
            <div className="space-y-4">
              {/* 天气信息 */}
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">
                <Cloud size={20} className="text-blue-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    {result.weather.city}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {result.weather.condition} {result.weather.temperature}°C
                    （体感 {result.weather.apparentTemperature}°C）
                  </span>
                </div>
                {result.weather.isRaining && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                    🌧️ 今天有雨
                  </span>
                )}
              </div>

              {/* 穿搭方案 */}
              {result.plans.map((plan) => (
                <PlanCard
                  key={plan.type}
                  plan={plan}
                  onSave={() => handleSave(plan)}
                  saving={savingId === plan.type}
                  saved={savedPlans.has(plan.type)}
                />
              ))}

              {/* 重新生成 */}
              <button
                type="button"
                onClick={() => setResult(null)}
                className="w-full rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400"
              >
                重新选择条件
              </button>

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onSave,
  saving,
  saved,
}: {
  plan: OutfitPlan;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
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
      {/* 方案标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{PLAN_TYPE_EMOJI[plan.type]}</span>
          <div>
            <p className="text-xs text-gray-400">
              {PLAN_TYPE_LABELS[plan.type]}
            </p>
            <h3 className="text-sm font-bold text-gray-900">{plan.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1">
          <span className="text-xs font-semibold text-ink-600">
            {plan.score}
          </span>
          <span className="text-xs text-ink-400">分</span>
        </div>
      </div>

      {/* 单品列表 */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {slots.map((slot) => (
          <div
            key={slot.label}
            className="flex flex-col items-center rounded-lg bg-gray-50 p-2"
          >
            <Shirt size={16} className="text-gray-300" />
            <span className="mt-1 text-xs text-gray-400">{slot.label}</span>
            {slot.item ? (
              <span className="mt-0.5 line-clamp-2 text-center text-xs text-gray-700">
                {slot.item.description}
              </span>
            ) : (
              <span className="mt-0.5 text-xs text-gray-300">—</span>
            )}
          </div>
        ))}
      </div>

      {/* 理由 */}
      <p className="mt-3 text-sm text-gray-600">{plan.reason}</p>

      {/* 场景 + 风险 */}
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-600">
          {plan.scene}
        </span>
        {plan.riskWarning && plan.riskWarning !== '无' && (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600">
            <AlertTriangle size={11} />
            {plan.riskWarning}
          </span>
        )}
      </div>

      {/* 保存按钮 */}
      <button
        type="button"
        onClick={onSave}
        disabled={saving || saved}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2 text-xs font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={14} /> 已保存
          </>
        ) : (
          <>
            <Lock size={14} /> 一键保存穿搭
          </>
        )}
      </button>
    </div>
  );
}
