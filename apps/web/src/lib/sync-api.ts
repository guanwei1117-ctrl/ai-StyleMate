/**
 * 登录用户本地数据同步（周计划 / 风格档案）
 *
 * 规则：
 *  - 仅登录用户可用（未登录不请求）；
 *  - 登录后 pull 合并：服务端 updatedAt 新 → 覆盖本地；本地新 → 上传服务端；
 *  - 本地变更时防抖 push；
 *  - 登出后本地副本保留，登录其他账号时按同一规则合并。
 */

import { getAuthToken, isAuthenticated } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface SyncEntryConfig {
  /** 服务端 key */
  key: string;
  /** localStorage 数据键 */
  storageKey: string;
  /** localStorage 时间戳键 */
  metaKey: string;
}

export const SYNC_ENTRIES: Record<'weekPlan' | 'styleProfile', SyncEntryConfig> = {
  weekPlan: {
    key: 'weekPlan',
    storageKey: 'stylemate.plan',
    metaKey: 'stylemate.plan.updatedAt',
  },
  styleProfile: {
    key: 'styleProfile',
    storageKey: 'stylemate.styleProfile.v1',
    metaKey: 'stylemate.styleProfile.v1.updatedAt',
  },
};

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function readLocal(config: SyncEntryConfig): { value: unknown; updatedAt: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(config.storageKey);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    const updatedAt = window.localStorage.getItem(config.metaKey) ?? '';
    return { value, updatedAt };
  } catch {
    return null;
  }
}

function writeLocal(config: SyncEntryConfig, value: unknown, updatedAt: string): void {
  window.localStorage.setItem(config.storageKey, JSON.stringify(value));
  window.localStorage.setItem(config.metaKey, updatedAt);
}

async function pullEntry(config: SyncEntryConfig): Promise<{ value: unknown; updatedAt: string } | null> {
  const res = await fetch(`${API_BASE}/sync/${config.key}`, { headers: authHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data.value) return null;
  return { value: data.value, updatedAt: String(data.updatedAt ?? '') };
}

async function pushEntry(
  config: SyncEntryConfig,
  value: unknown,
  updatedAt: string,
): Promise<void> {
  await fetch(`${API_BASE}/sync/${config.key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ value, updatedAt }),
  });
}

/**
 * 登录后调用：拉取服务端数据并按"谁新用谁"与本地合并。
 * 任何一步失败都不影响登录主流程。
 */
export async function syncOnLogin(): Promise<void> {
  if (typeof window === 'undefined' || !isAuthenticated()) return;

  for (const config of Object.values(SYNC_ENTRIES)) {
    try {
      const local = readLocal(config);
      const remote = await pullEntry(config);

      if (!remote) {
        // 服务端无数据 → 本地上传
        if (local) await pushEntry(config, local.value, local.updatedAt || new Date().toISOString());
        continue;
      }

      if (!local) {
        // 本地无数据 → 采用服务端
        writeLocal(config, remote.value, remote.updatedAt);
        continue;
      }

      if (remote.updatedAt > (local.updatedAt || '')) {
        writeLocal(config, remote.value, remote.updatedAt);
      } else if (local.updatedAt && local.updatedAt > remote.updatedAt) {
        await pushEntry(config, local.value, local.updatedAt);
      }
    } catch {
      // 静默失败：同步是增强功能，不影响主流程
    }
  }
}

/** 防抖 push 计时器 */
const pushTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * 本地变更后调用：记录时间戳并防抖上传（仅登录用户）。
 * 未登录时只更新本地时间戳，登录后再由 syncOnLogin 统一上传。
 */
export function syncPushLocal(
  config: SyncEntryConfig,
  value: unknown,
): void {
  if (typeof window === 'undefined') return;
  const updatedAt = new Date().toISOString();
  writeLocal(config, value, updatedAt);

  if (!isAuthenticated()) return;

  const existing = pushTimers[config.key];
  if (existing) clearTimeout(existing);
  pushTimers[config.key] = setTimeout(() => {
    pushEntry(config, value, updatedAt).catch(() => {
      // 静默失败，下次 syncOnLogin 再补
    });
  }, 1500);
}
