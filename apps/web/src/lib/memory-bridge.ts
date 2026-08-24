/**
 * 记忆接口适配层
 *
 * 将评分快照（ScoringSnapshot）处理为适合存储的格式。
 *
 * 评分每次运行都会产生一条 ScoringSnapshot，
 * 它包含了用户画像快照 + 各维度分数 + 时间戳，
 * 可以直接存入 localStorage / IndexedDB / 后端 API。
 *
 * 后续的记忆系统可以根据积累的快照学习用户的风格偏好变化。
 */

import type { ScoringSnapshot } from './scoring-types';
import { getAuthToken, getCurrentUserId } from './auth';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** 存储键 */
export const MEMORY_STORAGE_KEY = 'stylemate.memory.v1';

/** 最多保存的快照数量 */
export const MEMORY_SNAPSHOT_LIMIT = 20;

/**
 * 从 localStorage 加载历史评分快照
 */
export function loadSnapshotsFromStorage(): ScoringSnapshot[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, MEMORY_SNAPSHOT_LIMIT);
  } catch {
    return [];
  }
}

/**
 * 保存一条评分快照到 localStorage
 * 保留最近 MEMORY_SNAPSHOT_LIMIT 条
 */
export function saveSnapshotToStorage(snapshot: ScoringSnapshot): void {
  if (typeof window === 'undefined') return;

  const existing = loadSnapshotsFromStorage();
  const next = [snapshot, ...existing]
    .filter(
      (item, index, records) =>
        records.findIndex((r) => r.timestamp === item.timestamp) === index,
    )
    .slice(0, MEMORY_SNAPSHOT_LIMIT);

  window.localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(next));
}

/**
 * 清除所有历史快照
 */
export function clearSnapshots(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MEMORY_STORAGE_KEY);
}

/**
 * 从历史快照中提取用户的风格偏好趋势
 * （预留接口，供后续记忆系统使用）
 */
export function extractTrendFromSnapshots(
  _snapshots: ScoringSnapshot[],
): Record<string, unknown> {
  // TODO: 根据多条快照学习用户的风格偏好变化
  // 例如：某大类得分是否在上升、用户选择的风格是否在变化
  return {};
}

/**
 * 将评分快照异步同步到后端记忆服务
 *
 * 调用时机：buildScoringSnapshot() 完成后
 * 策略：fire-and-forget，不阻塞主流程，失败静默忽略
 */
export async function syncSnapshotToServer(
  snapshot: ScoringSnapshot,
  matchResults?: unknown[],
): Promise<void> {
  const token = getAuthToken();
  const userId = getCurrentUserId();
  if (!token || !userId) return;

  try {
    await fetch(`${API_BASE}/style-engine/snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        timestamp: snapshot.timestamp,
        userProfile: snapshot.userProfile,
        matchResults: matchResults ?? [],
      }),
    });
  } catch {
    // 网络错误静默忽略，不影响主流程
  }
}
