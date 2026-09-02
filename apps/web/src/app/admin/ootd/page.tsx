'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, type OotdPostItem } from '@/lib/admin-api';

const STATUS_TABS = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
];

export default function AdminOotdPage() {
  const [tab, setTab] = useState('pending');
  const [posts, setPosts] = useState<OotdPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.ootdPosts(tab, targetPage, 20);
      setPosts(targetPage === 1 ? data.items : (prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleReview = async (postId: string, action: 'approved' | 'rejected', reason?: string) => {
    setBusyId(postId);
    try {
      await adminApi.reviewOotdPost(postId, action, reason);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">帖子审核</h1>

      {/* Tab */}
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              tab === t.key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</p>
      )}

      {loading && posts.length === 0 ? (
        <p className="text-gray-400 text-sm py-10 text-center">加载中...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-400 text-sm py-10 text-center">暂无{tab === 'pending' ? '待审核' : tab === 'approved' ? '已通过' : '已拒绝'}的帖子</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              {/* 图片 */}
              <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageData} alt="" className="w-full h-full object-cover" />
              </div>
              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    post.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    post.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {post.status === 'pending' ? '待审核' : post.status === 'approved' ? '已通过' : '已拒绝'}
                  </span>
                  {post.styleTags && (
                    <span className="text-xs text-gray-500">{post.styleTags}</span>
                  )}
                  {post.scoreAvg != null && (
                    <span className="text-xs font-semibold text-gray-700">{post.scoreAvg} 分</span>
                  )}
                </div>
                {post.caption && (
                  <p className="text-sm text-gray-600 mb-1 line-clamp-2">{post.caption}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleString('zh-CN')}
                </p>
                {post.rejectReason && (
                  <p className="text-xs text-red-500 mt-1">拒绝原因：{post.rejectReason}</p>
                )}
                {/* 操作按钮 */}
                {post.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleReview(post.id, 'approved')}
                      disabled={busyId === post.id}
                      className="px-4 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => setRejectModal({ id: post.id })}
                      disabled={busyId === post.id}
                      className="px-4 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* 加载更多 */}
          {hasMore && (
            <button
              onClick={() => load(page + 1)}
              disabled={loading}
              className="w-full py-3 text-sm text-gray-500 border border-gray-200 rounded-lg hover:border-gray-400 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          )}
        </div>
      )}

      {/* 拒绝原因弹窗 */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">拒绝原因</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="选填：说明拒绝原因，用户会收到通知"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm h-24 resize-none outline-none focus:border-gray-400"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400"
              >
                取消
              </button>
              <button
                onClick={() => handleReview(rejectModal.id, 'rejected', rejectReason || undefined)}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}