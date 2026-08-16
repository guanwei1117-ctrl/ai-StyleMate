import type { DimensionScore, EvaluateOutfitResponse } from './scoring-types';

export const SCORING_HISTORY_STORAGE_KEY = 'stylemate.scoringHistory.v1';
export const SCORING_HISTORY_LIMIT = 5;

export interface ScoringHistoryRecord {
  id: string;
  createdAt: string;
  overallComment: string;
  averageScore: number;
  dimensions: DimensionScore[];
  improvements: string[];
  /** Look 缩略图（压缩后的小图 data URL，用于列表和分享卡） */
  thumbnail?: string;
  /** 完整诊断结果（用于恢复查看报告） */
  result?: EvaluateOutfitResponse;
}

function isScoringHistoryRecord(value: unknown): value is ScoringHistoryRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<ScoringHistoryRecord>;
  return Boolean(
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.overallComment === 'string' &&
    typeof record.averageScore === 'number' &&
    Array.isArray(record.dimensions) &&
    Array.isArray(record.improvements),
  );
}

export function createScoringHistoryRecord(
  result: EvaluateOutfitResponse,
  thumbnail?: string,
): ScoringHistoryRecord {
  const averageScore = result.dimensions.length > 0
    ? Math.round(result.dimensions.reduce((sum, item) => sum + item.score, 0) / result.dimensions.length)
    : 0;
  const createdAt = new Date().toISOString();

  return {
    id: `${createdAt}-${averageScore}`,
    createdAt,
    overallComment: result.overallComment,
    averageScore,
    dimensions: result.dimensions,
    improvements: result.improvements.slice(0, 3),
    thumbnail,
    result,
  };
}

/**
 * 把 Look 原图压缩成小尺寸缩略图（最长边 480px，JPEG 0.7），避免撑爆 localStorage。
 * 失败时返回 undefined（不阻塞主流程）。
 */
export function createScoringThumbnail(
  imageBase64: string,
  maxWidth = 480,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      resolve(undefined);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } catch {
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
    img.src = imageBase64;
  });
}

export function loadScoringHistoryFromStorage(storage: Pick<Storage, 'getItem'>): ScoringHistoryRecord[] {
  try {
    const raw = storage.getItem(SCORING_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isScoringHistoryRecord).slice(0, SCORING_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function addScoringHistoryRecord(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  record: ScoringHistoryRecord,
): ScoringHistoryRecord[] {
  const next = [record, ...loadScoringHistoryFromStorage(storage)]
    .filter((item, index, records) => records.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, SCORING_HISTORY_LIMIT);

  storage.setItem(SCORING_HISTORY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearScoringHistoryFromStorage(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(SCORING_HISTORY_STORAGE_KEY);
}

export function loadScoringHistory(): ScoringHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  return loadScoringHistoryFromStorage(window.localStorage);
}

export function saveScoringHistoryRecord(
  result: EvaluateOutfitResponse,
  thumbnail?: string,
): ScoringHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  return addScoringHistoryRecord(window.localStorage, createScoringHistoryRecord(result, thumbnail));
}

export function clearScoringHistory(): void {
  if (typeof window === 'undefined') return;
  clearScoringHistoryFromStorage(window.localStorage);
}
