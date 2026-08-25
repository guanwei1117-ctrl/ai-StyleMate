'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, type SuggestionItem } from '@/lib/admin-api';

const CATEGORY_LABELS: Record<string, string> = {
  bug: '问题反馈',
  feature: '功能建议',
  other: '其他',
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  new: { text: '待处理', color: 'bg-amber-100 text-amber-700' },
  viewed: { text: '已查看', color: 'bg-gray-100 text-gray-500' },
};

export default function SuggestionsPage() {
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filter, setFilter] = useState<'all' | 'new' | 'viewed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await adminApi.suggestions(page, pageSize, status);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkViewed(id: string) {
    try {
      await adminApi.markSuggestionViewed(id);
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'viewed' } : s)));
    } catch (err) {
      alert(err instanceof Error ? err.message : '标记失败');
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">用户建议</h1>
        <div className="flex gap-2">
          {(['all', 'new', 'viewed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'new' ? '待处理' : '已查看'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">加载中...</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500">{error}</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-gray-400">暂无建议</div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((s) => {
              const statusInfo = STATUS_LABELS[s.status] ?? { text: s.status, color: 'bg-gray-100' };
              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                      {CATEGORY_LABELS[s.category] ?? s.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleString('zh-CN')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {s.userId ? `用户: ${s.userId.slice(0, 8)}...` : '匿名用户'}
                    </span>
                    {s.pageUrl && (
                      <a
                        href={s.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-primary-600 hover:underline truncate max-w-[200px]"
                        title={s.pageUrl}
                      >
                        {s.pageUrl.replace(/^https?:\/\//, '').slice(0, 30)}...
                      </a>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{s.content}</p>
                  {s.status === 'new' && (
                    <button
                      onClick={() => handleMarkViewed(s.id)}
                      className="mt-3 text-xs text-primary-600 hover:underline"
                    >
                      标记为已查看
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
