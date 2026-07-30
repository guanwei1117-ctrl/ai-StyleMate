'use client';

import { useRef, useState } from 'react';
import {
  X,
  Loader2,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shirt,
  Palette,
  Repeat,
  AlertOctagon,
  Layers,
} from 'lucide-react';
import { evaluatePurchase } from '@/lib/wardrobe-api';
import {
  PurchaseEvaluationResult,
  DECISION_LABELS,
  RISK_LABELS,
} from '@/lib/wardrobe-types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PurchaseEvaluationDialog({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PurchaseEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!open) return null;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('图片不能超过 8MB');
      return;
    }

    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const data = await evaluatePurchase(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '判断失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setShowDetails(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const decisionIcon = (d: string) => {
    switch (d) {
      case 'buy':
        return <CheckCircle size={28} className="text-green-500" />;
      case 'consider':
        return <AlertTriangle size={28} className="text-amber-500" />;
      case 'skip':
        return <XCircle size={28} className="text-red-500" />;
      default:
        return null;
    }
  };

  const decisionBg = (d: string) => {
    switch (d) {
      case 'buy':
        return 'bg-green-50 border-green-200';
      case 'consider':
        return 'bg-amber-50 border-amber-200';
      case 'skip':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const riskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-10 pb-10">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Sparkles size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                这件值得买吗
              </h2>
              <p className="text-xs text-gray-500">
                AI 结合你的衣橱进行买前判断
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Upload Area */}
          {!preview && !loading && (
            <div
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 transition-colors hover:border-purple-300 hover:bg-purple-50/50"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <Upload size={36} className="mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                点击上传商品截图
              </p>
              <p className="mt-1 text-xs text-gray-400">
                支持淘宝图、小红书图、品牌商品图
              </p>
            </div>
          )}

          {/* Preview + Loading */}
          {preview && loading && (
            <div className="flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="商品预览"
                className="h-48 w-full rounded-xl object-contain bg-gray-50"
              />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={18} className="animate-spin text-purple-500" />
                AI 正在分析你的衣橱，结合商品进行判断…
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              <p className="font-medium">分析失败</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 rounded-full bg-red-100 px-4 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                重新上传
              </button>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-5">
              {/* Preview + Decision Badge */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview!}
                  alt="商品预览"
                  className="h-48 w-full rounded-xl object-contain bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur hover:bg-white"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Decision Card */}
              <div
                className={`rounded-xl border p-4 ${decisionBg(result.decision)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {decisionIcon(result.decision)}
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {DECISION_LABELS[result.decision]}
                      </p>
                      <p className="text-xs text-gray-500">综合评分</p>
                    </div>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <span
                      className={`text-xl font-bold ${
                        result.score >= 70
                          ? 'text-green-600'
                          : result.score >= 40
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {result.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  判断理由
                </h3>
                <ul className="space-y-1.5">
                  {result.reasons.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    >
                      <span className="mt-0.5 text-purple-500">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skip Reasons */}
              {result.skipReasons && result.skipReasons.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600">
                    <AlertOctagon size={15} />
                    不建议购买的原因
                  </h3>
                  <ul className="space-y-1.5">
                    {result.skipReasons.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                      >
                        <span className="mt-0.5">⚠️</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`rounded-lg px-3 py-2.5 text-sm ${riskColor(
                    result.duplicateRisk === 'high'
                      ? 'high'
                      : result.duplicateRisk === 'medium'
                        ? 'medium'
                        : 'low',
                  )}`}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <Repeat size={14} />
                    重复风险
                  </div>
                  <p className="mt-0.5 text-xs opacity-75">
                    {RISK_LABELS[result.duplicateRisk]}
                  </p>
                </div>
                <div
                  className={`rounded-lg px-3 py-2.5 text-sm ${riskColor(
                    result.idleRisk === 'high'
                      ? 'high'
                      : result.idleRisk === 'medium'
                        ? 'medium'
                        : 'low',
                  )}`}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertOctagon size={14} />
                    闲置风险
                  </div>
                  <p className="mt-0.5 text-xs opacity-75">
                    {RISK_LABELS[result.idleRisk]}
                  </p>
                </div>
              </div>

              {/* Better Colors */}
              {result.betterColors.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <Palette size={15} />
                    更推荐的颜色
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.betterColors.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Wardrobe Items */}
              {result.matchedWardrobeItems.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <Shirt size={15} />
                      可搭配衣橱单品 ({result.matchedWardrobeItems.length})
                    </span>
                    {showDetails ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {showDetails && (
                    <ul className="mt-2 space-y-1.5">
                      {result.matchedWardrobeItems.map((item, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-gray-100 px-3 py-2 text-sm"
                        >
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.reason}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Possible Outfits */}
              {result.possibleOutfits.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <Layers size={15} />
                    可搭穿搭
                  </h3>
                  <ul className="space-y-1.5">
                    {result.possibleOutfits.map((outfit, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm text-gray-700"
                      >
                        {outfit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Category */}
              {result.recommendedCategory && (
                <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm">
                  <p className="font-medium text-blue-800">
                    建议优先补充：{result.recommendedCategory}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    你的衣橱在这个品类上可能还比较欠缺
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
