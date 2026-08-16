'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Heart, MessageCircle, Loader2, Trash2, Send, Sparkles, LogIn,
} from 'lucide-react';
import {
  fetchOotdFeed,
  toggleOotdLike,
  deleteOotdPost,
  fetchOotdComments,
  addOotdComment,
  type OotdPostView,
  type OotdComment,
} from '@/lib/ootd-api';
import { getCurrentUserId, isAuthenticated } from '@/lib/auth';

const PAGE_SIZE = 10;

export default function OotdPage() {
  const [posts, setPosts] = useState<OotdPostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, OotdComment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [myId] = useState<string>(() => getCurrentUserId());
  const [authed] = useState<boolean>(() => isAuthenticated());

  const load = useCallback(async (targetPage: number) => {
    if (targetPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const data = await fetchOotdFeed(targetPage, PAGE_SIZE);
      setPosts((prev) => (targetPage === 1 ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleLike = async (post: OotdPostView) => {
    if (!authed) return;
    setBusyPostId(post.id);
    try {
      const result = await toggleOotdLike(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: result.liked, likeCount: result.likeCount }
            : p,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '点赞失败');
    } finally {
      setBusyPostId(null);
    }
  };

  const handleDelete = async (post: OotdPostView) => {
    if (!confirm('确定删除这条 OOTD？')) return;
    setBusyPostId(post.id);
    try {
      await deleteOotdPost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setBusyPostId(null);
    }
  };

  const toggleComments = async (post: OotdPostView) => {
    if (expandedComments === post.id) {
      setExpandedComments(null);
      return;
    }
    setExpandedComments(post.id);
    if (!comments[post.id]) {
      try {
        const list = await fetchOotdComments(post.id);
        setComments((prev) => ({ ...prev, [post.id]: list }));
      } catch {
        // 评论加载失败不阻塞
      }
    }
  };

  const handleComment = async (post: OotdPostView) => {
    const content = (commentInput[post.id] ?? '').trim();
    if (!content) return;
    setBusyPostId(post.id);
    try {
      const comment = await addOotdComment(post.id, content);
      setComments((prev) => ({
        ...prev,
        [post.id]: [...(prev[post.id] ?? []), comment],
      }));
      setCommentInput((prev) => ({ ...prev, [post.id]: '' }));
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, commentCount: p.commentCount + 1 } : p)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '评论失败');
    } finally {
      setBusyPostId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] pb-24">
      <div className="sticky top-0 z-30 border-b border-ink-900/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <p className="font-display text-lg tracking-wide">STYLEMATE</p>
          <Link href="/score-outfit" className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900">
            <Sparkles size={14} />
            去诊断发 OOTD
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink-900">穿搭社区</h1>
          <p className="mt-3 text-sm text-ink-500">
            看看大家的今日 Look 和 AI 诊断，从穿搭诊断页一键发布你的 OOTD。
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 text-ink-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : error && posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => load(1)}
              className="mt-4 rounded-full bg-ink-900 px-6 py-2 text-sm text-creme-100"
            >
              重试
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl">👗</div>
            <h3 className="mt-4 font-semibold text-ink-900">还没有人发布 OOTD</h3>
            <p className="mt-2 text-sm text-ink-500">
              去「今日穿搭诊断」上传一张 Look，生成报告后一键发布到社区吧。
            </p>
            <Link
              href="/score-outfit"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-6 py-2.5 text-sm text-creme-100 hover:bg-ink-800"
            >
              <Sparkles size={15} />
              开始第一次诊断
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            {posts.map((post) => (
              <OotdCard
                key={post.id}
                post={post}
                authed={authed}
                isMine={authed && post.userId === myId}
                busy={busyPostId === post.id}
                commentsOpen={expandedComments === post.id}
                comments={comments[post.id] ?? []}
                commentInput={commentInput[post.id] ?? ''}
                onLike={() => handleLike(post)}
                onDelete={() => handleDelete(post)}
                onToggleComments={() => toggleComments(post)}
                onCommentInput={(value) => setCommentInput((prev) => ({ ...prev, [post.id]: value }))}
                onCommentSubmit={() => handleComment(post)}
              />
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={() => load(page + 1)}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-900/15 py-3 text-sm text-ink-600 hover:border-ink-900/40 disabled:opacity-50"
              >
                {loadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                {loadingMore ? '加载中…' : '加载更多'}
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function OotdCard({
  post,
  authed,
  isMine,
  busy,
  commentsOpen,
  comments,
  commentInput,
  onLike,
  onDelete,
  onToggleComments,
  onCommentInput,
  onCommentSubmit,
}: {
  post: OotdPostView;
  authed: boolean;
  isMine: boolean;
  busy: boolean;
  commentsOpen: boolean;
  comments: OotdComment[];
  commentInput: string;
  onLike: () => void;
  onDelete: () => void;
  onToggleComments: () => void;
  onCommentInput: (value: string) => void;
  onCommentSubmit: () => void;
}) {
  let scoreJson: Array<{ label: string; score: number }> = [];
  try {
    scoreJson = post.scoreJson ? JSON.parse(post.scoreJson) : [];
  } catch {
    scoreJson = [];
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-ink-900/10 bg-white">
      {/* 分享卡图片 */}
      <div className="bg-ink-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.imageData} alt="OOTD 分享卡" className="mx-auto max-h-[520px] w-auto object-contain" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400">
            {new Date(post.createdAt).toLocaleString('zh-CN', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <div className="flex items-center gap-2">
            {typeof post.scoreAvg === 'number' && (
              <span className="rounded-full bg-ink-900 px-2.5 py-0.5 text-xs font-semibold text-creme-100">
                {post.scoreAvg} 分
              </span>
            )}
            {isMine && (
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                aria-label="删除"
                className="text-ink-300 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {post.caption && <p className="mt-3 text-sm leading-7 text-ink-700">{post.caption}</p>}

        {scoreJson.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scoreJson.slice(0, 4).map((dim) => (
              <span key={dim.label} className="rounded-full bg-[#e8ece8] px-2 py-0.5 text-[11px] text-ink-600">
                {dim.label} {dim.score}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-ink-900/5 pt-3">
          <button
            type="button"
            onClick={onLike}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50"
          >
            <Heart
              size={17}
              className={post.likedByMe ? 'fill-red-500 text-red-500' : 'text-ink-400'}
            />
            <span className={post.likedByMe ? 'text-red-500' : 'text-ink-500'}>{post.likeCount}</span>
          </button>
          <button
            type="button"
            onClick={onToggleComments}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500"
          >
            <MessageCircle size={17} className="text-ink-400" />
            {post.commentCount}
          </button>
        </div>

        {!authed && (
          <p className="mt-3 rounded-lg bg-creme-100 px-3 py-2 text-xs text-ink-500">
            <Link href="/auth" className="inline-flex items-center gap-1 font-medium text-ink-700 underline">
              <LogIn size={12} />
              登录
            </Link>
            后可以点赞和评论
          </p>
        )}

        {commentsOpen && (
          <div className="mt-4 space-y-2 border-t border-ink-900/5 pt-3">
            {comments.length === 0 ? (
              <p className="text-xs text-ink-400">还没有评论，来抢沙发～</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-creme-50 px-3 py-2">
                  <p className="text-xs text-ink-700">{comment.content}</p>
                  <p className="mt-1 text-[10px] text-ink-300">
                    {new Date(comment.createdAt).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            )}
            {authed && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  value={commentInput}
                  onChange={(e) => onCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onCommentSubmit();
                    }
                  }}
                  placeholder="说点什么…"
                  className="flex-1 rounded-full border border-ink-900/15 bg-white px-4 py-2 text-sm outline-none focus:border-ink-900/40"
                />
                <button
                  type="button"
                  onClick={onCommentSubmit}
                  disabled={busy || !commentInput.trim()}
                  className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-creme-100 disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
