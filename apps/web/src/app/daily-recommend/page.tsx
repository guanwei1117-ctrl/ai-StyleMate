'use client';

import { useState, useEffect } from 'react';
import { generateTodayOutfit } from '@/lib/today-outfit-api';
import { getUserMemory, type UserStyleProfile } from '@/lib/memory-api';
import { submitFeedback, type DetailedFeedbackType } from '@/lib/feedback-api';
import type { TodayOutfitResponse, OutfitPlan } from '@/lib/today-outfit-types';
import { useRequireAuth } from '@/lib/require-auth';
import { KnowledgeUsedPanel } from '@/components/knowledge-used-panel';
import { TeachingCardView, pickTeachingCard } from '@/components/teaching-card';

/**
 * 细粒度 dislike 原因 chips（多选，最多 3 个）
 * - 显示给用户的标签（label）
 * - 对应后端 RecordFeedbackDto.feedbackType（type）
 */
const DISLIKE_REASON_CHIPS: Array<{ label: string; emoji: string; type: DetailedFeedbackType }> = [
  { emoji: '🎨', label: '颜色不喜欢', type: 'color_dislike' },
  { emoji: '👔', label: '太正式', type: 'too_formal' },
  { emoji: '🎭', label: '太花哨/太普通', type: 'too_plain' },
  { emoji: '📏', label: '版型/舒适度', type: 'uncomfortable' },
  { emoji: '🎯', label: '场合不对', type: 'occasion_mismatch' },
];
// ============== M17：反馈"专业度"教学 — 2 层追问 ==============
// 选中 1 层 chip 后，自动展开 2 层"具体哪里"的追问 chips
// 设计：教用户学会用专业维度表达不喜欢（颜色/版型/风格/场合）
const REASON_DETAIL_CHIPS: Record<
  DetailedFeedbackType,
  Array<{ label: string; detail: string }>
> = {
  color_dislike: [
    { label: '太亮', detail: '颜色饱和度过高' },
    { label: '太暗', detail: '颜色饱和度过低' },
    { label: '跟肤色不搭', detail: '与冷暖肤色不匹配' },
    { label: '跟今天场合不搭', detail: '与场合正式度不符' },
  ],
  too_formal: [
    { label: '太老气', detail: '成熟度超出年龄' },
    { label: '太拘谨', detail: '不够放松自然' },
    { label: '颜色太深', detail: '深色显严肃' },
  ],
  too_plain: [
    { label: '太素', detail: '缺少亮点单品' },
    { label: '颜色太平', detail: '缺少色彩对比' },
    { label: '风格太普通', detail: '没有辨识度' },
  ],
  uncomfortable: [
    { label: '太贴身', detail: '暴露身材' },
    { label: '太宽松', detail: '显胖' },
    { label: '长短不对', detail: '衣长/裤长不合适' },
    { label: '肩线不对', detail: '肩宽不合适' },
    { label: '面料不舒服', detail: '材质过硬/刺痒' },
  ],
  occasion_mismatch: [
    { label: '太正式', detail: '不适合该场合' },
    { label: '太随便', detail: '显得不重视' },
    { label: '太花哨', detail: '与场合调性不符' },
    { label: '风格不对', detail: '风格与场合冲突' },
  ],
  // 兜底类型（不展示 2 层追问）
  like: [],
  dislike: [],
  too_fat: [],
};

const MAX_REASON_SELECT = 3;

// ============== M14-C：AI 反驳（基于 profile + 选择的 chip，模板化生成）==============
// 设计：用户点 👎 + 选 chip 时，前端根据 profile 给一句"专业反驳"
//      不调 LLM（零开销 + UI 立刻可见 + 不阻塞主流程）
//      风格：尊重用户偏好，但用客观维度（肤色/身材/场合）提醒"也许 X 更适合"
const SKIN_TONE_FALLBACK: Record<string, string> = {
  cool: '冷白皮',
  warm: '暖黄皮',
  neutral: '自然肤色',
};

const BODY_TYPE_FALLBACK: Record<string, string> = {
  pear: '梨形',
  apple: '苹果形',
  hourglass: '沙漏形',
  rectangle: 'H 形',
  inverted_triangle: '倒三角',
};

/**
 * 给一个 chip + profile，生成一句 AI 反驳文案（≤ 60 字）
 * 找不到合适的反驳就返回 null（不显示反驳，避免打扰）
 */
function buildAiOverride(
  chipType: DetailedFeedbackType,
  profile: UserStyleProfile | null,
): string | null {
  if (!profile) return null;

  switch (chipType) {
    case 'color_dislike': {
      const tone = SKIN_TONE_FALLBACK[profile.skinTone ?? ''] ?? null;
      const prefs = profile.preferredColors ?? [];
      const dislikes = profile.dislikedColors ?? [];
      if (tone && prefs.length > 0) {
        return `根据你的${tone}，${prefs.slice(0, 2).join('、')}会更衬肤色，要不要试试？`;
      }
      if (dislikes.length >= 3) {
        return `你之前不喜欢${dislikes.slice(0, 2).join('、')}，我会避开这些，这次再换风格试试？`;
      }
      return null;
    }
    case 'too_formal': {
      const dressGoals = profile.dressGoals ?? [];
      if (dressGoals.some((g) => g.includes('舒适') || g.includes('休闲'))) {
        return '你说想穿得舒适，今天确实推得太正式了，下一次我会更偏轻松。';
      }
      const occasions = profile.commonOccasions ?? [];
      if (occasions.some((o) => o.includes('休闲') || o.includes('逛街'))) {
        return `你说常去${occasions.find((o) => o.includes('休闲') || o.includes('逛街'))}，下次我会推更休闲的搭配。`;
      }
      return null;
    }
    case 'too_plain': {
      return '想穿得有亮点吗？告诉我"想更亮眼一点"，下次我会推 vibe 风格方案给你。';
    }
    case 'uncomfortable': {
      const concerns = profile.bodyConcerns ?? [];
      if (concerns.length > 0) {
        return `你说担心${concerns[0]}，下次我会更注重版型舒适度——例如高腰+宽松腰部+不紧绷面料。`;
      }
      return '版型不舒服的话，告诉我具体哪里（腰/肩/袖长？），下次推得更准。';
    }
    case 'occasion_mismatch': {
      const occasions = profile.commonOccasions ?? [];
      if (occasions.length > 0) {
        return `你说常去${occasions.slice(0, 2).join('、')}，我会更针对这些场合推。`;
      }
      return null;
    }
    default:
      return null;
  }
}

export default function DailyRecommendPage() {
  const { requireAuth } = useRequireAuth();
  const [city, setCity] = useState('上海');
  const [occasion, setOccasion] = useState('commute');
  const [styleGoal, setStyleGoal] = useState('comfortable');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TodayOutfitResponse | null>(null);
  const [error, setError] = useState('');

  // 各方案的反馈状态
  const [reactions, setReactions] = useState<Record<number, 'like' | 'dislike' | ''>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  // AI 对每个反馈的回应（让"AI 记住我"在产品上立刻可见）
  const [feedbackNotes, setFeedbackNotes] = useState<Record<number, string>>({});
  // 每个方案 dislike 时用户选的细粒度原因（多选）→ 后端 reasonTypes
  const [reasonTypes, setReasonTypes] = useState<Record<number, DetailedFeedbackType[]>>({});
  // M13：撤销反馈 — 5 秒内可点"↶ 撤销"清掉刚才的反馈（前端状态 + 重新生成推荐）
  // 注：后端没有 DELETE feedback 接口，所以撤销只清本地状态 + 不再基于这次反馈
  const [undoable, setUndoable] = useState<Record<number, boolean>>({});
  // M2-B：拉取最近 1-2 条反馈作为"记忆回溯"展示（"💭 我记得你上次说..."）
  const [lastFeedbacks, setLastFeedbacks] = useState<
    Array<{ id: string; feedbackType: string; reason?: string; createdAt: string }>
  >([]);
  // M14-C：拉取用户 profile 用于"AI 反驳"（基于肤色/偏好生成专业反驳）
  const [profile, setProfile] = useState<UserStyleProfile | null>(null);

  /** 切换单个原因 chip（多选 1-3 个） */
  function toggleReasonType(index: number, type: DetailedFeedbackType) {
    setReasonTypes((prev) => {
      const cur = prev[index] ?? [];
      if (cur.includes(type)) {
        return { ...prev, [index]: cur.filter((t) => t !== type) };
      }
      if (cur.length >= MAX_REASON_SELECT) return prev; // 上限
      return { ...prev, [index]: [...cur, type] };
    });
  }

  // 每次生成推荐后拉取最近反馈 + profile（用于"记忆回溯"banner 和 M14-C 反驳）
  useEffect(() => {
    if (!result) return;
    getUserMemory()
      .then((mem) => {
        const recent = (mem.recentFeedbacks ?? []).slice(0, 2);
        setLastFeedbacks(recent);
        setProfile(mem.styleProfile ?? null);
      })
      .catch(() => {
        /* 拉取失败不阻塞主流程 */
      });
  }, [result]);

  async function handleGenerate() {
    if (!requireAuth('请先登录后再使用每日推荐')) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await generateTodayOutfit({ city, occasion, styleGoal, constraints: [] });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(index: number, plan: OutfitPlan) {
    setSubmitting((s) => ({ ...s, [index]: true }));
    try {
      const reaction = reactions[index] || 'like';
      // dislike 时如有勾选原因 chips，传给后端做细粒度记忆写入
      const selectedReasons = reasonTypes[index] ?? [];
      const res = await submitFeedback({
        reaction,
        rating: ratings[index] ?? 0,
        comment: comments[index] || '',
        planTitle: plan.title,
        plan: plan,
        reasonTypes: reaction === 'dislike' && selectedReasons.length > 0 ? selectedReasons : undefined,
      });
      // 显示 AI 对这条反馈的回应（核心：让用户立刻看到"AI 记住了"）
      if (res?.aiMemoryNote) {
        setFeedbackNotes((n) => ({ ...n, [index]: res.aiMemoryNote }));
      }
      // M13：标记为可撤销（5 秒后自动失效）
      setUndoable((u) => ({ ...u, [index]: true }));
      setTimeout(() => {
        setUndoable((u) => {
          const next = { ...u };
          delete next[index];
          return next;
        });
      }, 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting((s) => ({ ...s, [index]: false }));
    }
  }

  /** M13：撤销最近一次反馈（清本地状态 — 后端无 DELETE 接口，记忆已写入则保留） */
  function handleUndo(index: number) {
    setFeedbackNotes((n) => {
      const next = { ...n };
      delete next[index];
      return next;
    });
    setUndoable((u) => {
      const next = { ...u };
      delete next[index];
      return next;
    });
    setReactions((r) => {
      const next = { ...r };
      next[index] = '' as any;
      return next;
    });
    setReasonTypes((rt) => {
      const next = { ...rt };
      delete next[index];
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-creme text-ink">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <p className="text-sm font-medium text-ink/60">首页 · 今日穿搭</p>
          <h1 className="mt-2 text-3xl font-bold">今天穿什么</h1>
          <p className="mt-2 text-ink/70">
            AI 基于你的长期画像（身材、风格偏好、衣橱单品）自动生成今日推荐，
            你只需一键采纳或微调。
          </p>
        </header>

        <section className="rounded-2xl border border-ink/10 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">城市</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-ink/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">场合</span>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="rounded-lg border border-ink/20 px-3 py-2"
              >
                <option value="commute">通勤</option>
                <option value="work">上班</option>
                <option value="date">约会</option>
                <option value="client">见客户</option>
                <option value="shopping">逛街</option>
                <option value="travel">出游</option>
                <option value="party">派对</option>
                <option value="casual">日常休闲</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">风格目标</span>
                <select
                  value={styleGoal}
                  onChange={(e) => setStyleGoal(e.target.value)}
                  className="rounded-lg border border-ink/20 px-3 py-2"
                >
                <option value="comfortable">舒适自在</option>
                <option value="slimming">显瘦</option>
                <option value="taller">显高</option>
                <option value="polished">精致得体</option>
                <option value="lowkey">低调简约</option>
                <option value="photogenic">上镜出片</option>
              </select>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-ink py-3 text-lg font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? '生成中…' : '生成今日穿搭'}
          </button>

          {/* M11：AI 思考进度感 —— 让 10-15s 等待不"白屏" */}
          {loading && <ThinkingProgress />}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </section>

        {result && (
          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">为你推荐的方案</h2>
            {/* "AI 注意到你"（用户感知层的核心：让长期记忆"被看见"） */}
            {result.memoryEcho && result.memoryEcho.length > 0 && (
              <div className="rounded-xl border border-olive-pale bg-olive-pale/30 px-4 py-3 text-sm text-olive-dark">
                <p className="mb-1 font-medium">💭 我注意到你</p>
                <ul className="space-y-1 text-ink/80">
                  {result.memoryEcho.map((line, i) => (
                    <li key={i}>· {line}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* M2-B："💭 我记得你上次说..." — 让人格化信号更具体（不是"我注意到"，而是"我记得"） */}
            {lastFeedbacks.length > 0 && (
              <div className="rounded-xl border border-creme-200 bg-creme-50 px-4 py-3 text-sm">
                <p className="mb-1 font-medium text-ink/80">💭 我记得你上次说</p>
                <ul className="space-y-1 text-ink/70">
                  {lastFeedbacks.map((fb) => (
                    <li key={fb.id} className="italic">
                      "{(fb as any).reason ||
                        ((fb as any).feedbackType === 'like' ? '喜欢这种风格' : '不喜欢这种风格')}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* M14-B：穿搭小课堂 — 根据 coach mode 自动挑选最相关的教学卡（默认折叠，不打扰） */}
            {(() => {
              const mode = (profile?.confusionTypes?.length ?? 0) > 1 || (profile?.styleProficiency === null || profile?.styleProficiency === undefined || profile.styleProficiency < 7)
                ? (profile?.confusionTypes?.[0] === 'buy' ? 'shopping' :
                   profile?.confusionTypes?.[0] === 'wear' ? 'occasion' :
                   profile?.confusionTypes?.[0] === 'match' ? 'combination' : 'mixed')
                : 'mixed';
              const card = pickTeachingCard(mode);
              return card ? <TeachingCardView card={card} /> : null;
            })()}
            {/* AI 引用依据（RAG 可解释性，knowledgeUsed 为空时自动隐藏） */}
            <KnowledgeUsedPanel titles={result.knowledgeUsed ?? []} />
            {result.plans.map((plan, i) => (
              <article
                key={i}
                className="rounded-2xl border border-ink/10 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {plan.type === 'safe' ? '🛡️' : plan.type === 'flattering' ? '✨' : '🎨'}
                      </span>
                      <h3 className="text-lg font-semibold">{plan.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-ink/70">{plan.reason}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      场景：{plan.scene} · 评分 {plan.score}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink/5 px-3 py-1 text-sm font-medium">
                    {plan.type === 'safe'
                      ? '稳妥不出错'
                      : plan.type === 'flattering'
                      ? '显瘦显高'
                      : '更有氛围感'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {[
                    ['上装', plan.top],
                    ['下装', plan.bottom],
                    ['外套', plan.outerwear],
                    ['鞋子', plan.shoes],
                    ['配饰', plan.accessory],
                  ].map(([label, item]) => (
                    <div key={String(label)} className="rounded-lg bg-ink/5 px-3 py-2">
                      <p className="text-xs text-ink/50">{String(label)}</p>
                      <p className="font-medium">
                        {item && typeof item === 'object' && 'description' in item
                          ? item.description
                          : '—'}
                      </p>
                    </div>
                  ))}
                </div>

                {plan.riskWarning && (
                  <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    ⚠️ {plan.riskWarning}
                  </p>
                )}

                <div className="mt-4 border-t border-ink/10 pt-4">
                  <p className="mb-2 text-sm font-medium">你的反馈（记入长期记忆）</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setReactions((r) => ({ ...r, [i]: 'like' }));
                          // 切换到 like 时清空该方案的 reasonTypes（避免下次切回 dislike 时残留旧选择）
                          setReasonTypes((rt) => {
                            if (!rt[i]) return rt;
                            const { [i]: _omit, ...rest } = rt;
                            return rest;
                          });
                        }}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          reactions[i] === 'like'
                            ? 'bg-green-600 text-white'
                            : 'bg-ink/5'
                        }`}
                      >
                        👍 喜欢
                      </button>
                      <button
                        onClick={() => {
                          setReactions((r) => ({ ...r, [i]: 'dislike' }));
                          // 注意：切换到 dislike 不主动清空 reasonTypes（用户可能已经选过 chips 又重新思考）
                        }}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          reactions[i] === 'dislike'
                            ? 'bg-red-600 text-white'
                            : 'bg-ink/5'
                        }`}
                      >
                        👎 不喜欢
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <span>评分</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={ratings[i] ?? ''}
                        onChange={(e) =>
                          setRatings((r) => ({
                            ...r,
                            [i]: Number(e.target.value),
                          }))
                        }
                        className="w-16 rounded-lg border border-ink/20 px-2 py-2"
                      />
                    </label>
                    <input
                      value={comments[i] ?? ''}
                      onChange={(e) =>
                        setComments((r) => ({ ...r, [i]: e.target.value }))
                      }
                      placeholder="写点评语…"
                      className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleFeedback(i, plan)}
                      disabled={submitting[i]}
                      className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90 disabled:opacity-50"
                    >
                      {submitting[i] ? '提交中…' : '提交反馈'}
                    </button>
                  </div>
                  {/* 细粒度 dislike 原因 chips（dislike 时显示，最多选 3 个） */}
                  {reactions[i] === 'dislike' && (
                    <div className="mt-3 rounded-lg bg-creme-50 px-3 py-2 text-sm">
                      <p className="mb-2 text-xs text-ink/60">
                        💡 选具体原因，让 AI 记得更准（可多选，最多 3 个）：
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {DISLIKE_REASON_CHIPS.map((chip) => {
                          const selected = (reasonTypes[i] ?? []).includes(chip.type);
                          const atLimit =
                            !selected && (reasonTypes[i] ?? []).length >= MAX_REASON_SELECT;
                          return (
                            <button
                              key={chip.type}
                              type="button"
                              onClick={() => toggleReasonType(i, chip.type)}
                              disabled={atLimit}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                selected
                                  ? 'bg-ink text-white'
                                  : atLimit
                                  ? 'bg-ink/5 text-ink/30 cursor-not-allowed'
                                  : 'bg-white border border-ink/15 text-ink/70 hover:border-ink/40'
                              }`}
                            >
                              {chip.emoji} {chip.label}
                            </button>
                          );
                        })}
                      </div>
                      {/* M14-C：AI 反驳 — 选中 chip 时显示基于 profile 的专业反驳（≤ 60 字） */}
                      {(reasonTypes[i] ?? []).length > 0 && (
                        <div className="mt-3 space-y-1.5 border-t border-creme-200 pt-2">
                          {(reasonTypes[i] ?? []).map((rt) => {
                            const override = buildAiOverride(rt, profile);
                            if (!override) return null;
                            return (
                              <p key={rt} className="flex items-start gap-1.5 text-xs text-ink/70">
                                <span className="shrink-0">💡</span>
                                <span className="leading-relaxed">{override}</span>
                              </p>
                            );
                          })}
                        </div>
                      )}
                      {/* M17：2 层追问 — 选中 chip 后弹出"具体哪里不喜欢"（教用户用专业维度表达） */}
                      {(reasonTypes[i] ?? []).length > 0 && (
                        <div className="mt-3 border-t border-creme-200 pt-2">
                          <p className="mb-2 text-xs font-medium text-ink/70">
                            📚 学会精准表达（选填）：
                          </p>
                          {(reasonTypes[i] ?? []).map((rt) => {
                            const details = REASON_DETAIL_CHIPS[rt] ?? [];
                            if (details.length === 0) return null;
                            return (
                              <div key={rt} className="mb-2">
                                <p className="mb-1 text-[11px] text-ink/50">
                                  · <span className="font-medium text-ink/70">
                                    {DISLIKE_REASON_CHIPS.find((c) => c.type === rt)?.label}
                                  </span>
                                  具体哪里？
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {details.map((d) => (
                                    <button
                                      key={d.label}
                                      type="button"
                                      onClick={() => {
                                        // M17：2 层选项加入 comments，自动拼接到评语里
                                        setComments((c) => {
                                          const cur = c[i] ?? '';
                                          const tag = `${d.label}`;
                                          if (cur.includes(tag)) return c;
                                          return { ...c, [i]: cur ? `${cur}; ${tag}` : tag };
                                        });
                                      }}
                                      className="rounded-full border border-ink/15 bg-white px-2.5 py-0.5 text-[11px] text-ink/70 transition hover:border-ink/40 hover:bg-creme-50"
                                      title={d.detail}
                                    >
                                      {d.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {/* AI 对这条反馈的回应（用户感知层核心：让"AI 记住了"立刻可见） */}
                  {feedbackNotes[i] && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-olive-pale/40 px-3 py-2 text-sm text-olive-dark">
                      <span className="flex-1">{feedbackNotes[i]}</span>
                      {/* M13：5 秒内可撤销（让用户不焦虑"误操作"） */}
                      {undoable[i] && (
                        <button
                          type="button"
                          onClick={() => handleUndo(i)}
                          className="shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-olive-dark transition hover:bg-white"
                          title="撤销这条反馈（记忆已写入则保留）"
                        >
                          ↶ 撤销
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}


/** 
 * M11：AI 思考进度感 — 让 10-15s 等待不"白屏"
 * 轮播 3 步：
 *   1. 了解天气和你的衣橱
 *   2. 匹配场景和你的偏好
 *   3. 生成 3 套方案
 */
function ThinkingProgress() {
  const steps = [
    { emoji: '🌤️' , text: '了解天气和你的衣橱' },
    { emoji: '🎯' , text: '匹配场景和你的偏好' },
    { emoji: '✨' , text: '生成 3 套方案' },
  ];
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStepIdx((i) => (i + 1) % steps.length), 2200);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="mt-4 rounded-xl border border-olive-pale bg-olive-pale/20 p-4 text-sm">
      <p className="mb-2 font-medium text-olive-dark">🧠 AI 在思考...</p>
      <ul className="space-y-1.5">
        {steps.map((s, i) => (
          <li key={i} className={"flex items-center gap-2 transition-opacity "}>
            <span>{i < stepIdx ? '✓' : i === stepIdx ? '⟳' : '○'}</span>
            <span>{s.emoji} {s.text}</span>
            {i === stepIdx && <span className="text-xs text-ink/50 animate-pulse ml-1">正在处理...</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
