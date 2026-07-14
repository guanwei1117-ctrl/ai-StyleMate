import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BODY_SHAPE_LABELS,
  AGE_GROUP_LABELS,
  OCCUPATION_LABELS,
  CLIMATE_LABELS,
  DRESSING_GOAL_LABELS,
  PRIORITY_LABELS,
} from '@/lib/onboarding-types';
import { CATEGORY_LABELS } from '@/data/styles';
import type { StyleMatchResult } from '@/lib/onboarding-types';
import type { OnboardingAnswers } from '@/lib/onboarding-types';
import type { BodyShape } from '@/lib/onboarding-types';
import { generateExplanation } from '@/lib/style-explain';
import { extractStyleIntent } from '@/lib/style-profile-storage';
import type { AiStyleProfileAnalysis } from '@/lib/style-profile-api';
import { BodyExplainCard } from './explain-sections';
import { AvoidanceZone } from './explain-sections';
import { MultiDimensionPanel } from './explain-sections';

interface ResultViewProps {
  results: StyleMatchResult[];
  answers: OnboardingAnswers;
  bodyShape: BodyShape;
  aiAnalysis: AiStyleProfileAnalysis | null;
  analysisError: string | null;
  onRestart: () => void;
}

export default function ResultView({ results, answers, bodyShape, aiAnalysis, analysisError, onRestart }: ResultViewProps) {
  const top1 = results[0];
  const explanation = generateExplanation(results, answers, bodyShape);
  const extractedIntent = extractStyleIntent(answers.userStatement);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      <div className="grid gap-6 border-b border-ink-900/10 pb-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="mb-4 text-xs tracking-[0.28em] text-ink-400">STYLE PROFILE REPORT</p>
          <h1 className="font-display text-[clamp(2.7rem,6vw,6rem)] leading-[0.9] text-ink-900">
            你的风格
            <br />
            档案已生成
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-ink-500">
            先看核心结论，再看为什么适合、怎么穿、哪些地方需要调整。
          </p>
        </div>
        {top1 && (
          <Link
            href={`/styles/${top1.styleId}`}
            className="block border border-ink-900/10 bg-[#e8ece8] p-6 transition-all hover:bg-[#dde2dd] group"
          >
            <p className="text-xs tracking-[0.24em] text-ink-500">CORE STYLE</p>
            <div className="mt-6 flex items-end justify-between gap-6">
              <div>
                <h2 className="font-display text-4xl leading-none group-hover:text-ink-700 transition-colors">
                  {top1.styleName}
                </h2>
                <p className="mt-3 text-sm text-ink-500">
                  {CATEGORY_LABELS[top1.category as keyof typeof CATEGORY_LABELS] || top1.category}
                </p>
              </div>
              <ScoreBadge score={top1.score} size="lg" />
            </div>
            <p className="mt-3 text-xs text-ink-400 group-hover:text-ink-600 transition-colors">
              查看风格详情 →
            </p>
          </Link>
        )}
      </div>

      <div className="grid gap-4 border border-ink-900/10 bg-[#e8ece8] p-5 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-2 text-xs tracking-[0.22em] text-ink-500">AI STATUS</p>
          <h3 className="font-display text-3xl leading-none text-ink-900">
            {aiAnalysis ? 'AI 深度分析报告' : '本地规则回落报告'}
          </h3>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            {aiAnalysis
              ? `已调用 ${aiAnalysis.providerModel}，结合照片、自述和风格库候选完成综合判断。`
              : '当前未完成 AI 深度视觉/语言分析，结果来自基础画像、自述关键词和风格库规则的混合匹配。'}
          </p>
          {analysisError && (
            <p className="mt-3 border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
              AI 调用未成功：{analysisError}
            </p>
          )}
        </div>
        {aiAnalysis ? (
          <div className="space-y-3 border border-ink-900/10 bg-[#fbfaf6]/75 p-4">
            <p className="text-xs tracking-[0.18em] text-ink-400">AI 核心结论</p>
            <p className="text-sm leading-7 text-ink-700">{aiAnalysis.summary}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <AiMiniBlock title="正脸视觉" copy={aiAnalysis.visualAnalysis.face} />
              <AiMiniBlock title="全身比例" copy={aiAnalysis.visualAnalysis.body} />
            </div>
          </div>
        ) : answers.userStatement.trim() && (
          <div className="border border-ink-900/10 bg-[#fbfaf6]/75 p-4">
            <p className="mb-2 text-xs tracking-[0.18em] text-ink-400">你的自述摘要</p>
            <p className="line-clamp-5 text-sm leading-7 text-ink-600">{answers.userStatement}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                ...extractedIntent.likedKeywords,
                ...extractedIntent.desiredImpression,
                ...extractedIntent.scenes,
                ...extractedIntent.constraints,
              ].slice(0, 10).map((item) => (
                <span key={item} className="bg-white/75 px-2.5 py-1 text-xs text-ink-500">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {aiAnalysis && (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="border border-ink-900/10 bg-white/45 p-5">
            <p className="mb-3 text-xs tracking-[0.22em] text-ink-400">AI INTENT</p>
            <p className="text-sm leading-7 text-ink-600">{aiAnalysis.intentAnalysis.cleanedStatement}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                ...aiAnalysis.intentAnalysis.likedKeywords,
                ...aiAnalysis.intentAnalysis.desiredImpression,
                ...aiAnalysis.intentAnalysis.scenes,
                ...aiAnalysis.intentAnalysis.constraints,
              ].slice(0, 12).map((item) => (
                <span key={item} className="bg-[#e8ece8] px-2.5 py-1 text-xs text-ink-500">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="border border-ink-900/10 bg-white/45 p-5">
            <p className="mb-3 text-xs tracking-[0.22em] text-ink-400">AI NEXT ACTIONS</p>
            <ul className="space-y-2">
              {[...aiAnalysis.avoidanceAdvice, ...aiAnalysis.nextActions].slice(0, 6).map((item) => (
                <li key={item} className="text-sm leading-6 text-ink-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ============ 用户画像卡片（三支柱）============ */}
      <div className="border border-ink-900/10 bg-white/45 p-6">
        <h3 className="text-xs tracking-[0.24em] text-ink-400 mb-5">PROFILE INPUT</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 审美适配 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-500 border-b border-creme-300 pb-1">
              审美适配
            </p>
            {answers.gender && (
              <ProfileItem
                label="性别"
                value={answers.gender === 'female' ? '女性' : answers.gender === 'male' ? '男性' : '其他'}
              />
            )}
            <ProfileItem label="身高/体重" value={`${answers.height ?? '-'}cm / ${answers.weight ?? '-'}kg`} />
            <ProfileItem label="体型" value={BODY_SHAPE_LABELS[bodyShape]} />
            {answers.preferredStyleIds.length > 0 && (
              <ProfileItem label="偏好风格" value={`${answers.preferredStyleIds.length} 种`} />
            )}
          </div>

          {/* 现实约束 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-500 border-b border-creme-300 pb-1">
              现实约束
            </p>
            {answers.ageGroup && (
              <ProfileItem label="年龄段" value={AGE_GROUP_LABELS[answers.ageGroup]} />
            )}
            {answers.occupation && (
              <ProfileItem label="职业" value={OCCUPATION_LABELS[answers.occupation]} />
            )}
            {(answers.city || answers.climate) && (
              <ProfileItem
                label="城市/气候"
                value={[answers.city, answers.climate ? CLIMATE_LABELS[answers.climate] : ''].filter(Boolean).join(' · ') || '-'}
              />
            )}
            {answers.budget && (
              <ProfileItem
                label="单件预算"
                value={
                  answers.budget === 'budget' ? '平价实惠' :
                  answers.budget === 'mid' ? '中等价位' : '轻奢品质'
                }
              />
            )}
            {answers.monthlyBudgetMax && (
              <ProfileItem
                label="月度预算"
                value={`¥${answers.monthlyBudgetMin ?? 0}-${answers.monthlyBudgetMax}`}
              />
            )}
          </div>

          {/* 行为偏好 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-500 border-b border-creme-300 pb-1">
              行为偏好
            </p>
            {answers.dressingGoals.length > 0 && (
              <ProfileItem
                label="穿衣目标"
                value={answers.dressingGoals.map((g) => DRESSING_GOAL_LABELS[g]).join('、')}
              />
            )}
            {answers.priorities.length > 0 && (
              <ProfileItem
                label="优先级"
                value={answers.priorities.map((p) => PRIORITY_LABELS[p]).join('＞')}
              />
            )}
            {answers.styleOpenness && (
              <ProfileItem label="风格接受度" value={`${answers.styleOpenness}/5`} />
            )}
            {answers.openToNewStyles !== null && answers.openToNewStyles !== undefined && (
              <ProfileItem
                label="尝试新风格"
                value={answers.openToNewStyles ? '愿意' : '暂不考虑'}
              />
            )}
            {answers.interests.length > 0 && (
              <ProfileItem label="兴趣" value={`${answers.interests.length} 项`} />
            )}
          </div>
        </div>
      </div>

      {/* ============ 体型解读（NEW）============ */}
      <BodyExplainCard explain={explanation.bodyExplain} tone="nice" />

      {/* ============ 多维评分（NEW）============ */}
      <MultiDimensionPanel score={explanation.multiDimension} tone="nice" />

      {/* ============ 避雷专区（NEW）============ */}
      <AvoidanceZone advice={explanation.avoidanceAdvice} tone="nice" />

      {/* ============ 最佳匹配 ============ */}
      <div>
        <h2 className="text-xs tracking-[0.24em] text-ink-400 mb-4">BEST MATCH</h2>

        {top1 && (
          <Link
            href={`/styles/${top1.styleId}`}
            className="block bg-ink-900 p-6 text-creme-100 transition-all hover:bg-ink-800 sm:p-8 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2.5 py-1 bg-creme-100/15 text-creme-200 text-xs rounded-full mb-2">
                  {CATEGORY_LABELS[top1.category as keyof typeof CATEGORY_LABELS] || top1.category}
                </span>
                <h3 className="text-2xl font-display">{top1.styleName}</h3>
              </div>
              <div className="text-right">
                <ScoreBadge score={top1.score} size="lg" />
              </div>
            </div>

            {/* 三支柱汇总 */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <PillarBar label="审美适配" value={top1.pillars.aesthetic} max={50} />
              <PillarBar label="现实约束" value={top1.pillars.realistic} max={30} />
              <PillarBar label="行为偏好" value={top1.pillars.behavioral} max={20} />
            </div>

            {/* 得分拆解 — 三组 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* 审美适配 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-creme-400 mb-1">审美适配</p>
                <MiniBar label="体型" value={top1.matchBreakdown.bodyShape} max={20} />
                <MiniBar label="偏好" value={top1.matchBreakdown.preference} max={25} />
                <MiniBar label="肤色" value={top1.matchBreakdown.skinTone} max={5} />
              </div>
              {/* 现实约束 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-creme-400 mb-1">现实约束</p>
                <MiniBar label="预算" value={top1.matchBreakdown.budget} max={12} />
                <MiniBar label="年龄" value={top1.matchBreakdown.ageFit} max={8} />
                <MiniBar label="场景" value={top1.matchBreakdown.scene} max={10} />
              </div>
              {/* 行为偏好 */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-creme-400 mb-1">行为偏好</p>
                <MiniBar label="优先级" value={top1.matchBreakdown.priority} max={10} />
                <MiniBar label="目标" value={top1.matchBreakdown.goal} max={5} />
                <MiniBar label="接受度" value={top1.matchBreakdown.openness} max={5} />
              </div>
            </div>

            {/* 推荐理由 */}
            <ul className="space-y-1">
              {top1.matchReasons.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-creme-300 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-creme-300 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-creme-400 group-hover:text-creme-300 transition-colors">
              查看完整风格档案 →
            </p>
          </Link>
        )}
      </div>

      {/* ============ 更多推荐 ============ */}
      {results.length > 1 && (
        <div>
          <h2 className="text-xs tracking-[0.24em] text-ink-400 mb-4">SECONDARY STYLES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.slice(1).map((r) => (
              <Link
                key={r.styleId}
                href={`/styles/${r.styleId}`}
                className="block border border-ink-900/10 bg-white/55 p-5 transition-all hover:border-ink-900/35 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-creme-200 text-ink-500 text-[10px] rounded-full mb-1.5">
                      {CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] || r.category}
                    </span>
                    <h4 className="font-semibold text-ink-800 group-hover:text-ink-900 transition-colors">
                      {r.styleName}
                    </h4>
                  </div>
                  <ScoreBadge score={r.score} size="sm" />
                </div>
                {/* 小型三支柱条 */}
                <div className="flex gap-1.5 mb-2">
                  <PillarDot label="审美" value={r.pillars.aesthetic} max={50} />
                  <PillarDot label="现实" value={r.pillars.realistic} max={30} />
                  <PillarDot label="偏好" value={r.pillars.behavioral} max={20} />
                </div>
                <p className="text-xs text-ink-500 line-clamp-2">
                  {r.matchReasons.join('；')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ============ 操作区 ============ */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t border-ink-900/10">
        <Link href="/wardrobe">
          <Button variant="default" size="lg">
            去衣柜搭一套看看 →
          </Button>
        </Link>
        <Link href="/styles">
          <Button variant="outline" size="lg">
            浏览全部风格百科
          </Button>
        </Link>
        <Button variant="ghost" size="lg" onClick={onRestart}>
          重新测试
        </Button>
      </div>
    </div>
  );
}

/* ============ 子组件 ============ */

function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-lg h-14 w-14' : size === 'sm' ? 'text-xs h-10 w-10' : 'text-sm h-12 w-12';
  return (
    <div className={cn(
      'inline-flex flex-col items-center justify-center rounded-full font-semibold shrink-0',
      'bg-creme-100 text-ink-900',
      sizeClass,
    )}>
      <span>{score}</span>
      {size === 'lg' && <span className="text-[8px] leading-none text-ink-400">分</span>}
    </div>
  );
}

function AiMiniBlock({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="bg-white/60 p-3">
      <p className="mb-1 text-xs text-ink-400">{title}</p>
      <p className="text-xs leading-5 text-ink-600">{copy}</p>
    </div>
  );
}

/** 三支柱大条 — 用于最佳匹配 */
function PillarBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="text-center">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-creme-300">{label}</span>
        <span className="text-creme-200">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-creme-100/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-creme-200 to-creme-100 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** 三支柱小点 — 用于更多推荐卡片 */
function PillarDot({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const tone = pct >= 75 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-ink-300';
  return (
    <div className="flex-1">
      <div className="flex justify-between text-[9px] text-ink-400 mb-0.5">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-creme-200 overflow-hidden">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-creme-300">{label}</span>
        <span className="text-creme-200">{value}/{max}</span>
      </div>
      <div className="h-1 rounded-full bg-creme-100/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-creme-200 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="text-ink-800 font-medium text-sm">{value}</p>
    </div>
  );
}
