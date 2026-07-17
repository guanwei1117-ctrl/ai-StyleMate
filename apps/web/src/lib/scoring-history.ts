import type { DimensionScore, EvaluateOutfitResponse } from './scoring-types';

export const SCORING_HISTORY_STORAGE_KEY = 'stylemate.scoringHistory.v1';
export const SCORING_HISTORY_LIMIT = 5;

export interface ScoringHistoryRecord {
  id: string;
  createdAt: string;
  bloggerId: string;
  bloggerName: string;
  overallComment: string;
  averageScore: number;
  dimensions: DimensionScore[];
  improvements: string[];
}

function isScoringHistoryRecord(value: unknown): value is ScoringHistoryRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<ScoringHistoryRecord>;
  return Boolean(
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.bloggerId === 'string' &&
    typeof record.bloggerName === 'string' &&
    typeof record.overallComment === 'string' &&
    typeof record.averageScore === 'number' &&
    Array.isArray(record.dimensions) &&
    Array.isArray(record.improvements),
  );
}

export function createScoringHistoryRecord(result: EvaluateOutfitResponse): ScoringHistoryRecord {
  const averageScore = result.dimensions.length > 0
    ? Math.round(result.dimensions.reduce((sum, item) => sum + item.score, 0) / result.dimensions.length)
    : 0;
  const createdAt = new Date().toISOString();

  return {
    id: `${createdAt}-${result.bloggerId}`,
    createdAt,
    bloggerId: result.bloggerId,
    bloggerName: result.bloggerName,
    overallComment: result.overallComment,
    averageScore,
    dimensions: result.dimensions,
    improvements: result.improvements.slice(0, 3),
  };
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

export function saveScoringHistoryRecord(result: EvaluateOutfitResponse): ScoringHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  return addScoringHistoryRecord(window.localStorage, createScoringHistoryRecord(result));
}

export function clearScoringHistory(): void {
  if (typeof window === 'undefined') return;
  clearScoringHistoryFromStorage(window.localStorage);
}
