"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EvaluateOutfitResponse } from "@/lib/scoring-types";
import DimensionCard from "./dimension-card";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Clipboard, Lightbulb, RotateCcw, Shirt, Sparkles, Shuffle, Share2, Loader2, Users } from "lucide-react";
import { buildScoringSummaryText } from "@/lib/scoring-summary";
import { renderShareCardImage } from "@/lib/scoring-share-card";
import { fetchWardrobeItems } from "@/lib/wardrobe-api";
import { CATEGORY_LABELS, WardrobeItem } from "@/lib/wardrobe-types";
import { publishOotd, blobToDataUrl } from "@/lib/ootd-api";
import { isAuthenticated } from "@/lib/auth";
import type { StructuredOutfitResult } from "@stylemate/shared";

interface ScoreResultProps {
  result: EvaluateOutfitResponse;
  onReset: () => void;
  /** Look 缩略图（用于分享卡），可选 */
  thumbnail?: string;
}

export default function ScoreResult({ result, onReset, thumbnail }: ScoreResultProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleCopySummary = async () => {
    const summary = buildScoringSummaryText(result);
    try {
      await navigator.clipboard.writeText(summary);
      setCopyMessage("已复制诊断摘要");
    } catch {
      setCopyMessage("复制失败，请手动复制页面内容");
    }
  };

  const handleShare = async () => {
    setSharing(true);
    setShareMessage("");
    try {
      const blob = await renderShareCardImage(result, thumbnail);
      const file = new File([blob], 'stylemate-outfit-report.png', { type: 'image/png' });

      // 支持文件分享的系统（移动端）直接调起系统分享
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'StyleMate 今日穿搭诊断' });
        setShareMessage("已调起系统分享");
      } else {
        // 回退：下载图片
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stylemate-outfit-report.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setShareMessage("分享图已下载，可保存后分享");
      }
    } catch (err) {
      // 用户取消分享不算错误
      if (err instanceof DOMException && err.name === 'AbortError') {
        setShareMessage("");
      } else {
        setShareMessage("分享图生成失败，请重试");
      }
    } finally {
      setSharing(false);
    }
  };

  // 发布到 OOTD 社区：生成分享卡 → 上传 → 跳转社区
  const handlePublishOotd = async () => {
    if (!isAuthenticated()) {
      setShareMessage("请先登录后再发布到社区");
      router.push('/auth');
      return;
    }
    setPublishing(true);
    setShareMessage("");
    try {
      const blob = await renderShareCardImage(result, thumbnail);
      const imageData = await blobToDataUrl(blob);
      const scoreAvg = result.dimensions.length > 0
        ? Math.round(result.dimensions.reduce((sum, d) => sum + d.score, 0) / result.dimensions.length)
        : undefined;
      await publishOotd({
        imageData,
        caption: result.overallComment,
        scoreAvg,
        scoreJson: JSON.stringify(
          result.dimensions.map((d) => ({ label: d.label, score: d.score })),
        ),
      });
      router.push('/ootd');
    } catch (err) {
      setShareMessage(err instanceof Error ? err.message : '发布失败，请重试');
    } finally {
      setPublishing(false);
    }
  };

  const radarData = result.dimensions.map((d) => ({
    dimension: d.label,
    score: d.score,
  }));

  return (
    <div className="w-full space-y-8">
      <div className="border-b border-ink-900/10 pb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-[0.28em] text-ink-400">DIAGNOSIS REPORT</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center justify-center gap-2 border border-ink-900/10 px-4 py-2 text-xs text-ink-600 transition hover:border-ink-900 hover:text-ink-900"
            >
              <Clipboard size={14} />
              复制报告摘要
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-2 text-xs text-creme-100 transition hover:bg-ink-700 disabled:opacity-60"
            >
              {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
              {sharing ? '生成中…' : '生成分享图'}
            </button>
            <button
              type="button"
              onClick={handlePublishOotd}
              disabled={publishing}
              className="inline-flex items-center justify-center gap-2 border border-ink-900 px-4 py-2 text-xs text-ink-900 transition hover:bg-[#e8ece8] disabled:opacity-60"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
              {publishing ? '发布中…' : '发布到社区'}
            </button>
          </div>
        </div>
        {shareMessage && <p className="mb-3 text-xs text-ink-500">{shareMessage}</p>}
        <h1 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.9] text-ink-900">
          今日 Look
          <br />
          诊断完成
        </h1>
        {copyMessage && <p className="mt-4 text-sm text-ink-500">{copyMessage}</p>}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-ink-900/10 bg-[#e8ece8] p-5"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center bg-ink-900">
            <Sparkles className="w-5 h-5 text-creme-100" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900 mb-1">
              StyleMate 穿搭诊断结论
            </p>
            <p className="text-ink-600 leading-relaxed">{result.greeting}</p>
          </div>
        </div>
      </motion.div>

      {/* 雷达图 — 等待组件挂载后再渲染，避免 Recharts getBoundingClientRect 空值 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="border border-ink-900/10 bg-white/55 p-5"
        style={{ width: "100%", minHeight: 320 }}
      >
        <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-3">
          EIGHT DIMENSIONS
        </h3>
        {mounted && (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#d7d0c4" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: "#555555" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#8C8C8C" }}
              />
              <Radar
                name="评分"
                dataKey="score"
                stroke="#0A0A0A"
                fill="#6B7F5E"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* 整体评价 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="border-y border-ink-900/10 py-8 text-center"
      >
        <p className="text-ink-900 font-display text-2xl leading-relaxed">
          &ldquo;{result.overallComment}&rdquo;
        </p>
      </motion.div>

      {/* 8 维度卡片 */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 flex items-center gap-2">
          <Shirt className="w-4 h-4" />
          DIMENSION BREAKDOWN
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {result.dimensions.map((dim, idx) => (
            <DimensionCard key={dim.key} dimension={dim} index={idx} />
          ))}
        </div>
      </div>

      {/* 逐件分析 */}
      {result.itemComments && result.itemComments.length > 0 && (
        <div className="border border-ink-900/10 bg-white/45 p-5 space-y-2">
          <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-3">
            ITEM ANALYSIS
          </h3>
          {result.itemComments.map((comment, idx) => (
            <p key={idx} className="border-l border-ink-900/20 pl-4 text-sm leading-7 text-ink-600">
              {comment}
            </p>
          ))}
        </div>
      )}

      {/* 改良建议 */}
      {result.improvements && result.improvements.length > 0 && (
        <div className="border border-ink-900/10 bg-[#f4f1ea] p-5">
          <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-ink-600" />
            IMMEDIATE FIXES
          </h3>
          <div className="space-y-2">
            {result.improvements.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 font-display text-xl leading-none text-ink-900">0{idx + 1}</span>
                <span className="text-sm leading-7 text-ink-600">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 衣橱替换建议 — 诊断→改进闭环 */}
      {result.structured && <WardrobeSwaps structured={result.structured} />}

      {/* 重新评分 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onReset}
        className="inline-flex w-full items-center justify-center gap-2 border border-ink-900 px-6 py-3 text-sm font-medium text-ink-900 transition-all duration-200 hover:bg-ink-900 hover:text-creme-100"
      >
        <RotateCcw size={16} />
        重新评分
      </motion.button>
    </div>
  );
}

// ===================================================================
// 衣橱替换建议：把诊断中的"问题单品"映射到用户衣橱里的同品类单品，
// 让"哪里不好怎么改"真正落地为"换成衣橱里的哪一件"。
// ===================================================================
function WardrobeSwaps({ structured }: { structured: StructuredOutfitResult }) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchWardrobeItems()
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  if (!loaded) return null;
  if (failed) return null;

  // 衣橱为空 → 引导补充
  if (items.length === 0) {
    return (
      <div className="border border-ink-900/10 bg-white/45 p-5">
        <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-3 flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          WARDROBE SWAPS
        </h3>
        <p className="text-sm leading-7 text-ink-600">
          把衣橱里的衣服拍照录入后，这里会告诉你：这套 Look 里的每一件，可以换成你衣橱里的哪一件。
        </p>
        <Link
          href="/wardrobe"
          className="mt-3 inline-flex items-center gap-1.5 border border-ink-900 px-4 py-2 text-xs text-ink-900 transition hover:bg-ink-900 hover:text-creme-100"
        >
          <Shirt size={14} />
          去衣橱添加衣物
        </Link>
      </div>
    );
  }

  // 按品类分组
  const byCategory = new Map<string, WardrobeItem[]>();
  for (const it of items) {
    const list = byCategory.get(it.category) ?? [];
    list.push(it);
    byCategory.set(it.category, list);
  }

  // 为每个结构化单品找同品类候选（按百搭程度降序，取前 3）
  const rows = structured.items
    .map((piece) => {
      const candidates = (byCategory.get(piece.type) ?? [])
        .slice()
        .sort((a, b) => (b.matchabilityScore ?? 0) - (a.matchabilityScore ?? 0))
        .slice(0, 3);
      return { piece, candidates };
    })
    .filter((row) => row.candidates.length > 0);

  if (rows.length === 0) return null;

  return (
    <div className="border border-ink-900/10 bg-white/45 p-5">
      <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-4 flex items-center gap-2">
        <Shuffle className="w-4 h-4" />
        WARDROBE SWAPS
      </h3>
      <p className="mb-4 text-xs text-ink-400">诊断单品 → 你衣橱里可以直接替换的选择（按百搭程度排序）</p>
      <div className="space-y-5">
        {rows.map((row, idx) => (
          <div key={idx}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-ink-900 px-2.5 py-0.5 text-[11px] text-creme-100">
                {row.piece.name}
              </span>
              <span className="text-xs text-ink-400">{CATEGORY_LABELS[row.piece.type as keyof typeof CATEGORY_LABELS] ?? row.piece.type}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {row.candidates.map((cand) => (
                <Link
                  key={cand.id}
                  href={`/wardrobe/items/${cand.id}`}
                  className="flex items-center gap-2 rounded-lg border border-ink-900/10 bg-white px-2.5 py-2 transition hover:border-ink-900/40"
                >
                  {cand.imageUrls?.[0] ? (
                    <img src={cand.imageUrls[0]} alt={cand.subCategory || cand.category} className="size-9 rounded-md object-cover" />
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-md bg-ink-50 text-base">👕</span>
                  )}
                  <div>
                    <p className="text-xs font-medium text-ink-800">{cand.color} {cand.subCategory || cand.category}</p>
                    <p className="text-[10px] text-ink-400">百搭 {cand.matchabilityScore ?? 0}/10</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
