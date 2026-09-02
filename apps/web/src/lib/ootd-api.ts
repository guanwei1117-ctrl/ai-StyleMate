/**
 * OOTD 社区 — 前端 API
 */

import { getAuthToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface OotdPostView {
  id: string;
  userId: string;
  imageData: string;
  caption?: string;
  scoreAvg?: number;
  scoreJson?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface OotdFeedResult {
  items: OotdPostView[];
  total: number;
  hasMore: boolean;
}

export interface OotdComment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
}

async function toErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}

/** 信息流（浏览无需登录） */
export async function fetchOotdFeed(page = 1, pageSize = 20): Promise<OotdFeedResult> {
  const res = await fetch(
    `${API_BASE}/ootd?page=${page}&pageSize=${pageSize}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(await toErrorMessage(res, '加载社区失败'));
  return res.json();
}

/** 发布 OOTD（需登录） */
export async function publishOotd(params: {
  imageData: string;
  caption?: string;
  scoreAvg?: number;
  scoreJson?: string;
  styleTags?: string;
}): Promise<OotdPostView> {
  const res = await fetch(`${API_BASE}/ootd`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await toErrorMessage(res, '发布失败'));
  return res.json();
}

/** 点赞/取消点赞（需登录） */
export async function toggleOotdLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  const res = await fetch(`${API_BASE}/ootd/${postId}/like`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await toErrorMessage(res, '操作失败'));
  return res.json();
}

/** 删除自己的帖子（需登录） */
export async function deleteOotdPost(postId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/ootd/${postId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await toErrorMessage(res, '删除失败'));
}

/** 评论列表 */
export async function fetchOotdComments(postId: string): Promise<OotdComment[]> {
  const res = await fetch(`${API_BASE}/ootd/${postId}/comments`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await toErrorMessage(res, '加载评论失败'));
  return res.json();
}

/** 发表评论（需登录） */
export async function addOotdComment(postId: string, content: string): Promise<OotdComment> {
  const res = await fetch(`${API_BASE}/ootd/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await toErrorMessage(res, '评论失败'));
  return res.json();
}

/** Blob → data URL（发布分享卡用） */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(blob);
  });
}
