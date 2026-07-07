"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import PhotoUpload from "@/components/score-outfit/photo-upload";
import BloggerSelector from "@/components/score-outfit/blogger-selector";
import ScoreResult from "@/components/score-outfit/score-result";
import { evaluateOutfit } from "@/lib/scoring-api";
import { ScoringState, EvaluateOutfitResponse } from "@/lib/scoring-types";

const STEPS = [
  { key: "upload" as const, label: "上传照片", icon: Camera },
  { key: "select-blogger" as const, label: "选择博主", icon: Users },
  { key: "result" as const, label: "查看评分", icon: BarChart3 },
];

export default function ScoreOutfitPage() {
  const [state, setState] = useState<ScoringState>("upload");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [bloggerId, setBloggerId] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluateOutfitResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.key === state);

  const handlePhotoReady = useCallback((base64: string) => {
    setImageBase64(base64);
  }, []);

  const handleBloggerSelect = useCallback((id: string) => {
    setBloggerId(id);
  }, []);

  const handleStartScoring = useCallback(async () => {
    if (!imageBase64 || !bloggerId) return;
    setLoading(true);
    setState("result");

    const res = await evaluateOutfit({
      imageBase64,
      bloggerId,
    });
    setResult(res);
    setLoading(false);
  }, [imageBase64, bloggerId]);

  const handleReset = useCallback(() => {
    setState("upload");
    setImageBase64("");
    setBloggerId(null);
    setResult(null);
  }, []);

  const canProceedToBlogger = state === "upload" && !!imageBase64;
  const canProceedToResult =
    state === "select-blogger" && !!bloggerId && !!imageBase64;

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e5dfd7]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#5c5c5c] hover:text-[#1a1a2e] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <span className="text-sm font-display font-semibold text-[#1a1a2e]">
            AI 穿搭评分
          </span>
          <div className="w-16" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-14 pb-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* 头部标题 */}
          {state !== "result" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-display font-bold text-[#1a1a2e] tracking-tight">
                {state === "upload" ? "你的穿搭，AI 来评分" : "选择你的搭配顾问"}
              </h1>
              <p className="text-[#8a8a8a] mt-2 text-sm">
                {state === "upload"
                  ? "上传一张穿搭照片，让博主帮你分析"
                  : "选择一位你喜欢的博主来评价你的穿搭"}
              </p>
            </motion.div>
          )}

          {/* 进度指示器 */}
          {state !== "result" && (
            <div className="flex items-center justify-center gap-0 mb-8">
              {STEPS.map((step, idx) => (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      idx <= currentStepIndex
                        ? "bg-[#1a1a2e] text-white"
                        : "bg-[#f0ebe3] text-[#8a8a8a]"
                    }`}
                  >
                    <step.icon className="w-3.5 h-3.5" />
                    {step.label}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${
                        idx < currentStepIndex ? "bg-[#1a1a2e]" : "bg-[#e5dfd7]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 核心区域 */}
          <AnimatePresence mode="wait">
            {state === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <PhotoUpload onPhotoReady={handlePhotoReady} />
                <button
                  onClick={() => setState("select-blogger")}
                  disabled={!canProceedToBlogger}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    canProceedToBlogger
                      ? "bg-[#1a1a2e] text-white hover:bg-[#2d4a5c] shadow-md hover:shadow-lg"
                      : "bg-[#e5dfd7] text-[#8a8a8a] cursor-not-allowed"
                  }`}
                >
                  下一步：选择博主
                </button>
              </motion.div>
            )}

            {state === "select-blogger" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <BloggerSelector
                  onSelect={handleBloggerSelect}
                  selectedId={bloggerId}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setState("upload")}
                    className="flex-1 py-3 rounded-xl border-2 border-[#e5dfd7] text-[#5c5c5c] font-semibold text-sm hover:border-[#8a8a8a] transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handleStartScoring}
                    disabled={!canProceedToResult || loading}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      canProceedToResult && !loading
                        ? "bg-[#1a1a2e] text-white hover:bg-[#2d4a5c] shadow-md"
                        : "bg-[#e5dfd7] text-[#8a8a8a] cursor-not-allowed"
                    }`}
                  >
                    开始评分
                  </button>
                </div>
              </motion.div>
            )}

            {state === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-0"
              >
                {loading && !result ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-3 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#8a8a8a] text-sm">AI 正在分析你的穿搭...</p>
                  </div>
                ) : result ? (
                  <ScoreResult result={result} onReset={handleReset} />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
