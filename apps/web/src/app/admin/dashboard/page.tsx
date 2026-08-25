'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  adminApi,
  type OverviewData,
  type UsersTrendItem,
  type ProfileDistribution,
  type FeedbackStats,
  type LlmStats,
} from '@/lib/admin-api';

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trend, setTrend] = useState<UsersTrendItem[]>([]);
  const [profile, setProfile] = useState<ProfileDistribution | null>(null);
  const [feedback, setFeedback] = useState<FeedbackStats | null>(null);
  const [llm, setLlm] = useState<LlmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, tr, pd, fb, lm] = await Promise.all([
        adminApi.overview(),
        adminApi.usersTrend(30),
        adminApi.profileDistribution(),
        adminApi.feedbackStats(),
        adminApi.llmStats(7),
      ]);
      setOverview(ov);
      setTrend(tr);
      setProfile(pd);
      setFeedback(fb);
      setLlm(lm);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return <div className="py-20 text-center text-gray-400">加载中...</div>;
  }
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500">{error}</p>
        <button onClick={loadAll} className="mt-4 text-sm text-primary-600 underline">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="总用户数" value={overview?.totalUsers ?? 0} />
        <StatCard label="今日新增" value={overview?.newToday ?? 0} />
        <StatCard label="建档完成率" value={`${overview?.profileRate ?? 0}%`} />
        <StatCard label="待处理建议" value={overview?.newSuggestions ?? 0} highlight />
      </div>

      {/* 用户新增趋势 */}
      <Section title="用户新增趋势（近30天）">
        <TrendChart data={trend} />
      </Section>

      {/* 画像分布 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="体型分布">
          <DistributionBar data={profile?.bodyTypes ?? []} />
        </Section>
        <Section title="风格偏好 Top 10">
          <DistributionBar data={profile?.likedStyles ?? []} />
        </Section>
      </div>

      {/* 反馈与满意度 */}
      <Section title="反馈与满意度">
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="总反馈数" value={feedback?.total ?? 0} />
          <StatCard label="喜欢" value={feedback?.likes ?? 0} />
          <StatCard label="不喜欢" value={feedback?.dislikes ?? 0} />
          <StatCard label="平均评分" value={feedback?.avgRating ?? 0} />
        </div>
        {feedback && feedback.negative.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">负面反馈（最近20条）</h4>
            <div className="space-y-2">
              {feedback.negative.map((n) => (
                <div key={n.id} className="rounded-lg border border-red-100 bg-red-50 px-4 py-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="rounded bg-red-200 px-1.5 py-0.5 text-red-700">
                      {n.reaction === 'dislike' ? '不喜欢' : `评分${n.rating}`}
                    </span>
                    <span>{new Date(n.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  {n.comment && <p className="mt-1 text-sm text-gray-700">{n.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* AI 调用统计 */}
      <Section title="AI 调用统计（近7天）">
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="总调用" value={llm?.total ?? 0} />
          <StatCard label="成功" value={llm?.success ?? 0} />
          <StatCard label="失败率" value={`${llm?.failRate ?? 0}%`} highlight={!!(llm && llm.failRate > 10)} />
          <StatCard label="平均耗时" value={`${llm?.avgElapsed ?? 0}ms`} />
        </div>
        {llm && llm.providers.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Provider 分布</h4>
            <DistributionBar data={llm.providers.map((p) => ({ value: p.provider, count: p.count }))} />
          </div>
        )}
      </Section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function TrendChart({ data }: { data: UsersTrendItem[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">暂无数据</p>;
  }
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-40 items-end gap-px overflow-x-auto">
      {data.map((d) => (
        <div
          key={d.date}
          className="group relative flex-1 min-w-[8px] flex flex-col items-center justify-end"
          style={{ height: '100%' }}
        >
          <div
            className="w-full rounded-t bg-primary-500 transition-all group-hover:bg-primary-700"
            style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '2px' : '0' }}
          />
          <div className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
            {d.date}: {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}

function DistributionBar({ data }: { data: { value: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">暂无数据</p>;
  }
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.value} className="flex items-center gap-3">
          <span className="w-28 truncate text-sm text-gray-600">{d.value}</span>
          <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-5 rounded-full bg-primary-500"
              style={{ width: `${(d.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-sm font-medium text-gray-700">{d.count}</span>
        </div>
      ))}
    </div>
  );
}
