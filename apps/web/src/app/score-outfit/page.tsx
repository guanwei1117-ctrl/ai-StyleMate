"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Loader2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import PhotoUpload from "@/components/score-outfit/photo-upload";
import BloggerSelector from "@/components/score-outfit/blogger-selector";
import ScoreResult from "@/components/score-outfit/score-result";
import { evaluateOutfit } from "@/lib/scoring-api";
import { EvaluateOutfitResponse, ScoringState } from "@/lib/scoring-types";
import { loadStyleProfile, type StoredStyleProfile } from "@/lib/style-profile-storage";

const STEPS = [
  { key: "upload" as const, label: "上传 Look" },
  { key: "select-blogger" as const, label: "诊断视角" },
  { key: "result" as const, label: "分析报告" },
];

export default function ScoreOutfitPage() {
  const [state, setState] = useState<ScoringState>("upload");
  const [imageBase64, setImageBase64] = useState("");
  const [bloggerId, setBloggerId] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluateOutfitResponse | null>(null);
  const [styleProfile, setStyleProfile] = useState<StoredStyleProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStepIndex = STEPS.findIndex((item) => item.key === state);

  useEffect(() => {
    setStyleProfile(loadStyleProfile());
  }, []);

  const handlePhotoReady = useCallback((base64: string) => {
    setImageBase64(base64);
    setError(null);
  }, []);

  const handleStartScoring = useCallback(async () => {
    if (!imageBase64 || !bloggerId) return;
    setLoading(true);
    setError(null);
    setState("result");

    try {
      const res = await evaluateOutfit({
        imageBase64,
        bloggerId,
        userContext: styleProfile
          ? {
              bodyShape: styleProfile.bodyShape,
              gender: styleProfile.answersSummary.gender ?? undefined,
              height: styleProfile.answersSummary.height ?? undefined,
              weight: styleProfile.answersSummary.weight ?? undefined,
              occasion: [
                styleProfile.answersSummary.occupation,
                styleProfile.answersSummary.city,
                ...styleProfile.extractedIntent.scenes,
              ].filter(Boolean).join(" / "),
            }
          : undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "诊断失败，请稍后重试");
      setState("select-blogger");
    } finally {
      setLoading(false);
    }
  }, [imageBase64, bloggerId, styleProfile]);

  const handleReset = useCallback(() => {
    setState("upload");
    setImageBase64("");
    setBloggerId(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-ink-900">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-ink-900/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <span className="font-display text-lg tracking-wide">STYLEMATE</span>
          <span className="hidden text-xs tracking-[0.25em] text-ink-400 sm:block">OUTFIT DIAGNOSIS</span>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-28 lg:px-10">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-5 text-xs tracking-[0.3em] text-ink-400">AI OUTFIT DIAGNOSIS</p>
            <h1 className="font-display text-[clamp(3.2rem,7vw,7.5rem)] leading-[0.88]">
              诊断今日
              <br />
              穿搭状态
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-7 text-ink-500 lg:justify-self-end">
            上传一张完整 Look，选择诊断视角。StyleMate 会从比例、色彩、场景、完整度和实穿性拆解问题，并给出可马上执行的修改建议。
          </p>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.key}
              className={`border px-4 py-3 text-sm transition ${
                index <= currentStepIndex
                  ? "border-ink-900 bg-ink-900 text-creme-100"
                  : "border-ink-900/10 bg-white/45 text-ink-400"
              }`}
            >
              <span className="mr-3 font-display">0{index + 1}</span>
              {step.label}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 border border-ink-900/10 bg-[#fbfaf6] p-5 sm:p-6">
          {styleProfile ? (
            <div className="grid gap-5 md:grid-cols-[0.85fr_1.15fr] md:items-center">
              <div>
                <p className="mb-2 text-xs tracking-[0.22em] text-ink-400">LINKED STYLE PROFILE</p>
                <h2 className="font-display text-3xl leading-none">已连接你的风格档案</h2>
                <p className="mt-3 text-sm leading-6 text-ink-500">
                  这次诊断会参考你的身高体重、核心风格和自述意图。
                  {styleProfile.aiEnabled
                    ? ` 该档案已由 AI 深度分析生成，模型会继续按这个方向理解你的 Look。`
                    : ` 该档案来自本地规则，建议重新生成一次 AI 深度档案。`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {styleProfile.results.slice(0, 3).map((item) => (
                  <span key={item.styleId} className="bg-[#e8ece8] px-3 py-2 text-xs text-ink-600">
                    {item.styleName}
                  </span>
                ))}
                {[
                  ...styleProfile.extractedIntent.likedKeywords,
                  ...styleProfile.extractedIntent.desiredImpression,
                  ...styleProfile.extractedIntent.scenes,
                ].slice(0, 8).map((item) => (
                  <span key={item} className="border border-ink-900/10 bg-white/55 px-3 py-2 text-xs text-ink-500">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-xs tracking-[0.22em] text-ink-400">STYLE PROFILE</p>
                <h2 className="font-display text-3xl leading-none">还没有个人风格档案</h2>
                <p className="mt-3 text-sm leading-6 text-ink-500">
                  可以先上传 Look 做通用诊断；生成档案后，诊断会更贴近你的目标和偏好。
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center bg-ink-900 px-5 py-3 text-sm text-creme-100 transition hover:bg-ink-800"
              >
                先生成风格档案
              </Link>
            </div>
          )}
        </section>

        <AnimatePresence mode="wait">
          {state !== "result" ? (
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="grid gap-6 lg:grid-cols-[1fr_0.82fr]"
            >
              <section className="border border-ink-900/10 bg-[#fbfaf6] p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <Camera size={18} />
                  <div>
                    <h2 className="font-display text-3xl">上传穿搭照片</h2>
                    <p className="mt-1 text-sm text-ink-500">建议全身照，保留鞋子和外套层次。</p>
                  </div>
                </div>
                <PhotoUpload onPhotoReady={handlePhotoReady} />
              </section>

              <section className="border border-ink-900/10 bg-[#fbfaf6] p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                  <SlidersHorizontal size={18} />
                  <div>
                    <h2 className="font-display text-3xl">选择诊断视角</h2>
                    <p className="mt-1 text-sm text-ink-500">不同视角会影响关注重点和建议方式。</p>
                  </div>
                </div>
                <BloggerSelector onSelect={setBloggerId} selectedId={bloggerId} />
                <button
                  onClick={handleStartScoring}
                  disabled={!imageBase64 || !bloggerId || loading}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-ink-900 px-6 py-3 text-sm text-creme-100 transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-200"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  开始诊断
                </button>
              </section>
            </motion.div>
          ) : (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-5xl border border-ink-900/10 bg-[#fbfaf6] p-5 sm:p-8"
            >
              {loading && !result ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-ink-900" />
                  <p className="text-sm text-ink-500">正在拆解比例、色彩和场景适配度...</p>
                </div>
              ) : result ? (
                <ScoreResult result={result} onReset={handleReset} />
              ) : null}
            </motion.section>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
