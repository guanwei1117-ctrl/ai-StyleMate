"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EvaluateOutfitResponse } from "@/lib/scoring-types";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Clipboard,
  Lightbulb,
  RotateCcw,
  Shirt,
  Sparkles,
  Share2,
  Loader2,
  Users,
  CheckCircle,
  X,
  Shuffle,
  Check,
  AlertCircle,
} from "lucide-react";
import { buildScoringSummaryText } from "@/lib/scoring-summary";
import { renderShareCardImage } from "@/lib/scoring-share-card";
import { fetchWardrobeItems, recognizeAndAddItem } from "@/lib/wardrobe-api";
import { CATEGORY_LABELS, WardrobeItem } from "@/lib/wardrobe-types";
import { publishOotd, blobToDataUrl } from "@/lib/ootd-api";
import { adminApi, type StyleTag } from "@/lib/admin-api";
import { isAuthenticated } from "@/lib/auth";
import { getUserMemory } from "@/lib/memory-api";
import type { UserMemory } from "@/lib/memory-api";
import type { StructuredOutfitResult } from "@stylemate/shared";

type Mode = "diagnose" | "analyze";

interface ScoreResultProps {
  result: EvaluateOutfitResponse;
  onReset: () => void;
  /** 拍立搭模式：diagnose = 诊断穿搭（带偏好）/ analyze = 分析穿搭（不带偏好） */
  mode?: Mode;
  /** 原始图片 base64，用于「上传到衣橱」按钮 */
  imageBase64?: string;
  /** Look 缩略图（用于分享卡），可选 */
  thumbnail?: string;
}

/** base64 → File（用于调用 recognizeAndAddItem） */
function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

export default function ScoreResult({
  result,
  onReset,
  mode = "diagnose",
  imageBase64,
  thumbnail,
}: ScoreResultProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishModal, setPublishModal] = useState(false);
  const [publishDone, setPublishDone] = useState(false);
  const [tags, setTags] = useState<StyleTag[]>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [tagLoading, setTagLoading] = useState(false);

  // 「上传到衣橱」状态
  const [addingToWardrobe, setAddingToWardrobe] = useState(false);
  const [wardrobeMessage, setWardrobeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 仅诊断模式加载偏好（用于在 greeting 里内联偏好呼应）
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mode !== "diagnose") return;
    getUserMemory()
      .then((m) => setUserMemory(m))
      .catch(() => {
        /* 拉取失败不阻塞主流程 */
      });
  }, [mode]);

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
      const file = new File([blob], "stylemate-outfit-report.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (typeof nav.canShare === "function" && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "StyleMate 穿搭诊断" });
        setShareMessage("已调起系统分享");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "stylemate-outfit-report.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setShareMessage("分享图已下载，可保存后分享");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setShareMessage("");
      } else {
        setShareMessage("分享图生成失败，请重试");
      }
    } finally {
      setSharing(false);
    }
  };

  const handlePublishOotd = async () => {
    if (!isAuthenticated()) {
      setShareMessage("请先登录后再发布到社区");
      router.push("/auth");
      return;
    }
    setTagLoading(true);
    try {
      const tagList = await adminApi.getTags();
      setTags(tagList);
    } catch {
      setTags([]);
    } finally {
      setTagLoading(false);
    }
    setSelectedTag("");
    setPublishDone(false);
    setPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    setPublishing(true);
    try {
      const blob = await renderShareCardImage(result, thumbnail);
      const imageData = await blobToDataUrl(blob);
      const scoreAvg =
        result.dimensions.length > 0
          ? Math.round(result.dimensions.reduce((sum, d) => sum + d.score, 0) / result.dimensions.length)
          : undefined;
      await publishOotd({
        imageData,
        caption: result.overallComment,
        scoreAvg,
        scoreJson: JSON.stringify(result.dimensions.map((d) => ({ label: d.label, score: d.score }))),
        styleTags: selectedTag || undefined,
      });
      setPublishDone(true);
    } catch (err) {
      setShareMessage(err instanceof Error ? err.message : "发布失败，请重试");
      setPublishModal(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddToWardrobe = async () => {
    setWardrobeMessage(null);
    if (!imageBase64) {
      setWardrobeMessage({ type: "error", text: "缺少原始图片，无法上传" });
      return;
    }
    if (!isAuthenticated()) {
      setWardrobeMessage({ type: "error", text: "上传衣橱需要先登录" });
      router.push("/auth");
      return;
    }
    setAddingToWardrobe(true);
    try {
      const file = base64ToFile(imageBase64, "outfit-look.jpg");
      const res = await recognizeAndAddItem(file);
      const sub = res.recognition?.subCategory ?? res.recognition?.category ?? "单品";
      setWardrobeMessage({
        type: "success",
        text: `已识别为「${sub}」并加入衣橱，可在「我的衣橱」查看`,
      });
    } catch (err) {
      setWardrobeMessage({
        type: "error",
        text: err instanceof Error ? err.message : "上传失败，请重试",
      });
    } finally {
      setAddingToWardrobe(false);
    }
  };

  const radarData = result.dimensions.map((d) => ({
    dimension: d.label,
    score: d.score,
  }));

  const modeLabel = mode === "analyze" ? "分析穿搭" : "诊断穿搭";
  const headline = mode === "analyze" ? "Look 风格分析完成" : "今日 Look 诊断完成";

  return (
    <div className="w-full space-y-6">
      {/* ============ 顶部操作栏（单行：复制 / 分享 / 发布） ============ */}
      <div className="flex flex-col gap-3 border-b border-ink-900/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.28em] text-ink-400">
            {modeLabel.toUpperCase()} · DIAGNOSIS REPORT
          </p>
          <h1 className="mt-1 font-display text-2xl leading-tight text-ink-900 sm:text-3xl">
            {headline}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 border border-ink-900/10 px-3.5 py-2 text-xs text-ink-600 transition hover:border-ink-900 hover:text-ink-900"
          >
            <Clipboard size={14} />
            复制报告
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex items-center gap-2 bg-ink-900 px-3.5 py-2 text-xs text-creme-100 transition hover:bg-ink-700 disabled:opacity-60"
          >
            {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            {sharing ? "生成中…" : "分享图"}
          </button>
          <button
            type="button"
            onClick={handlePublishOotd}
            disabled={publishing}
            className="inline-flex items-center gap-2 border border-ink-900 px-3.5 py-2 text-xs text-ink-900 transition hover:bg-[#e8ece8] disabled:opacity-60"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
            {publishing ? "发布中…" : "发布到社区"}
          </button>
        </div>
      </div>
      {(shareMessage || copyMessage) && (
        <p className="-mt-2 text-xs text-ink-500">
          {copyMessage || shareMessage}
        </p>
      )}

      {/* ============ AI 结论（合并偏好呼应到 inline） ============ */}
      <div className="flex items-start gap-3 border border-ink-900/10 bg-[#e8ece8] p-5">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center bg-ink-900">
          <Sparkles className="w-4 h-4 text-creme-100" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-900 mb-1">StyleMate 结论</p>
          <p className="text-sm text-ink-600 leading-relaxed">{result.greeting}</p>
          {/* 诊断模式下内联偏好呼应（已合并进结论框，去掉独立 M5 框） */}
          {mode === "diagnose" && userMemory?.styleProfile && (
            <MemoryEcho profile={userMemory.styleProfile} />
          )}
        </div>
      </div>

      {/* ============ 雷达图 ============ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="border border-ink-900/10 bg-white/55 p-5"
        style={{ width: "100%", minHeight: 320 }}
      >
        <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-3">
          8 DIMENSIONS · 雷达图
        </h3>
        {mounted && (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#d7d0c4" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#555555" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#8C8C8C" }} />
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

      {/* ============ 整体评价 ============ */}
      <div className="border-y border-ink-900/10 py-6 text-center">
        <p className="font-display text-xl leading-relaxed text-ink-900">
          &ldquo;{result.overallComment}&rdquo;
        </p>
      </div>

      {/* ============ 8 维度评论（仅文字，去掉与雷达图重复的进度条） ============ */}
      <section>
        <h3 className="mb-3 text-xs font-semibold tracking-[0.24em] text-ink-400 flex items-center gap-2">
          <Shirt className="w-4 h-4" />
          维度评论
        </h3>
        <ul className="space-y-2.5">
          {result.dimensions.map((dim) => (
            <li
              key={dim.key}
              className="flex gap-4 border-l-2 border-ink-900/15 pl-4 py-1.5"
            >
              <span className="w-24 shrink-0 text-sm font-semibold text-ink-900">
                {dim.label}
              </span>
              <span className="w-10 shrink-0 font-display text-base text-ink-700">
                {dim.score}
              </span>
              <p className="flex-1 text-sm leading-6 text-ink-600">{dim.comment}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ 单品分析 + 改良建议（合并为一段） ============ */}
      {((result.itemComments && result.itemComments.length > 0) ||
        (result.improvements && result.improvements.length > 0)) && (
        <section className="border border-ink-900/10 bg-[#f4f1ea] p-5">
          {result.itemComments && result.itemComments.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold tracking-[0.24em] text-ink-400">
                单品分析
              </h3>
              <div className="space-y-2">
                {result.itemComments.map((c, idx) => (
                  <p key={idx} className="text-sm leading-7 text-ink-700">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          )}
          {result.improvements && result.improvements.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold tracking-[0.24em] text-ink-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-ink-600" />
                改良建议
              </h3>
              <div className="space-y-2">
                {result.improvements.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 font-display text-lg leading-none text-ink-900">
                      0{idx + 1}
                    </span>
                    <span className="text-sm leading-7 text-ink-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ============ 衣橱替换建议 ============ */}
      {result.structured && <WardrobeSwaps structured={result.structured} />}

      {/* ============ 上传到衣橱 + 重新评分（操作区） ============ */}
      <div className="space-y-3 border-t border-ink-900/10 pt-5">
        {wardrobeMessage && (
          <div
            className={`flex items-center gap-2 border px-4 py-2.5 text-xs ${
              wardrobeMessage.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {wardrobeMessage.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{wardrobeMessage.text}</span>
            {wardrobeMessage.type === "success" && (
              <Link
                href="/wardrobe"
                className="ml-auto underline-offset-2 hover:underline"
              >
                查看衣橱 →
              </Link>
            )}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAddToWardrobe}
            disabled={addingToWardrobe || !imageBase64}
            className="inline-flex flex-1 items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-sm font-medium text-creme-100 transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addingToWardrobe ? <Loader2 size={15} className="animate-spin" /> : <Shuffle size={15} />}
            {addingToWardrobe ? "上传中…" : "📥 上传到衣橱"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 border border-ink-900 px-5 py-3 text-sm font-medium text-ink-900 transition hover:bg-ink-900 hover:text-creme-100"
          >
            <RotateCcw size={15} />
            重新评分
          </button>
        </div>
      </div>

      {/* ============ 发布到社区 弹窗 ============ */}
      {publishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            if (!publishing) setPublishModal(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {publishDone ? (
              <div className="text-center py-4">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                <h3 className="font-display text-lg text-ink-900 mb-2">已提交审核</h3>
                <p className="text-sm text-ink-500 mb-6">
                  审核通过后将在社区展示，请耐心等待
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setPublishModal(false);
                      router.push("/ootd");
                    }}
                    className="px-5 py-2.5 text-sm font-medium bg-ink-900 text-creme-100 rounded-full hover:bg-ink-800"
                  >
                    查看社区
                  </button>
                  <button
                    onClick={() => setPublishModal(false)}
                    className="px-5 py-2.5 text-sm font-medium border border-ink-900/15 text-ink-600 rounded-full hover:border-ink-900/40"
                  >
                    返回诊断
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base text-ink-900">发布到社区</h3>
                  <button
                    onClick={() => setPublishModal(false)}
                    className="text-ink-400 hover:text-ink-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-ink-500 mb-4">
                  选择这个穿搭的风格标签，方便其他用户发现
                </p>
                {tagLoading ? (
                  <div className="flex items-center justify-center py-8 text-ink-400">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="ml-2 text-sm">加载标签...</span>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1 mb-5">
                    {tags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => setSelectedTag(tag.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedTag === tag.name
                            ? "bg-ink-900 text-creme-100"
                            : "bg-creme-100 text-ink-600 hover:bg-creme-200"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmPublish}
                    disabled={publishing || !selectedTag}
                    className="flex-1 py-2.5 text-sm font-medium bg-ink-900 text-creme-100 rounded-full hover:bg-ink-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {publishing ? <Loader2 size={15} className="animate-spin" /> : null}
                    {publishing ? "发布中..." : "发布"}
                  </button>
                  <button
                    onClick={() => setPublishModal(false)}
                    className="px-5 py-2.5 text-sm font-medium border border-ink-900/15 text-ink-600 rounded-full hover:border-ink-900/40"
                  >
                    取消
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 偏好呼应 —— 仅诊断模式渲染，内联进结论框
// ============================================================
function MemoryEcho({ profile }: { profile: NonNullable<UserMemory["styleProfile"]> }) {
  const chips: string[] = [];
  (profile.likedStyles ?? []).slice(0, 3).forEach((s) => chips.push(`✓ 喜欢 ${s}`));
  (profile.dislikedColors ?? []).slice(0, 2).forEach((c) => chips.push(`✕ 避开 ${c}`));
  (profile.dressGoals ?? []).slice(0, 2).forEach((g) => chips.push(`🎯 ${g}`));
  if (chips.length === 0) return null;
  return (
    <div className="mt-3 border-t border-ink-900/10 pt-3">
      <p className="text-[11px] text-ink-500 mb-2">
        我结合你的偏好来打分：
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-ink-700"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 衣橱替换建议
// ============================================================
function WardrobeSwaps({ structured }: { structured: StructuredOutfitResult }) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchWardrobeItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) return null;
  if (failed) return null;

  if (items.length === 0) {
    return (
      <div className="border border-ink-900/10 bg-white/45 p-5">
        <h3 className="text-xs font-semibold tracking-[0.24em] text-ink-400 mb-2 flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          衣橱替换
        </h3>
        <p className="text-sm leading-6 text-ink-600">
          把衣橱里的衣服拍照录入后，这里会告诉你：每件可以换成你衣橱里的哪一件。
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

  const byCategory = new Map<string, WardrobeItem[]>();
  for (const it of items) {
    const list = byCategory.get(it.category) ?? [];
    list.push(it);
    byCategory.set(it.category, list);
  }

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
      <h3 className="mb-2 text-xs font-semibold tracking-[0.24em] text-ink-400 flex items-center gap-2">
        <Shuffle className="w-4 h-4" />
        衣橱替换
      </h3>
      <p className="mb-4 text-xs text-ink-400">
        诊断单品 → 你衣橱里可以直接替换的选择（按百搭程度排序）
      </p>
      <div className="space-y-4">
        {rows.map((row, idx) => (
          <div key={idx}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-ink-900 px-2.5 py-0.5 text-[11px] text-creme-100">
                {row.piece.name}
              </span>
              <span className="text-xs text-ink-400">
                {CATEGORY_LABELS[row.piece.type as keyof typeof CATEGORY_LABELS] ?? row.piece.type}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {row.candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="flex items-center gap-2 rounded-lg border border-ink-900/10 bg-white px-2.5 py-2 transition hover:border-ink-900/40"
                >
                  {cand.imageUrls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cand.imageUrls[0]}
                      alt={cand.subCategory || cand.category}
                      className="size-9 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-md bg-ink-50 text-base">
                      👕
                    </span>
                  )}
                  <div>
                    <p className="text-xs font-medium text-ink-800">
                      {cand.color} {cand.subCategory || cand.category}
                    </p>
                    <p className="text-[10px] text-ink-400">
                      百搭 {cand.matchabilityScore ?? 0}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}