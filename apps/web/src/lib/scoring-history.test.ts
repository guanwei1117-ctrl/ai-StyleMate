import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SCORING_HISTORY_LIMIT,
  SCORING_HISTORY_STORAGE_KEY,
  addScoringHistoryRecord,
  clearScoringHistoryFromStorage,
  loadScoringHistoryFromStorage,
  type ScoringHistoryRecord,
} from './scoring-history';

function createMemoryStorage(initial?: string): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & { written: Record<string, string> } {
  const written: Record<string, string> = {};
  if (initial !== undefined) written[SCORING_HISTORY_STORAGE_KEY] = initial;
  return {
    written,
    getItem: (key: string) => written[key] ?? null,
    setItem: (key: string, value: string) => { written[key] = value; },
    removeItem: (key: string) => { delete written[key]; },
  };
}

function record(id: string): ScoringHistoryRecord {
  return {
    id,
    createdAt: `2026-07-17T00:00:0${id}.000Z`,
    overallComment: `整体评价 ${id}`,
    averageScore: 80 + Number(id),
    dimensions: [{ key: 'color', label: '色彩', score: 88, comment: '不错' }],
    improvements: [`建议 ${id}`],
  };
}

test('loads scoring history from storage', () => {
  const storage = createMemoryStorage(JSON.stringify([record('1')]));

  const history = loadScoringHistoryFromStorage(storage);

  assert.equal(history.length, 1);
  assert.equal(history[0].overallComment, '整体评价 1');
});

test('returns empty history when storage content is invalid', () => {
  const storage = createMemoryStorage('not-json');

  assert.deepEqual(loadScoringHistoryFromStorage(storage), []);
});

test('adds newest record first and keeps only recent records', () => {
  const initial = Array.from({ length: SCORING_HISTORY_LIMIT }, (_, index) => record(String(index + 1)));
  const storage = createMemoryStorage(JSON.stringify(initial));

  const next = addScoringHistoryRecord(storage, record('9'));

  assert.equal(next.length, SCORING_HISTORY_LIMIT);
  assert.equal(next[0].id, '9');
  assert.equal(next.at(-1)?.id, '4');
  assert.deepEqual(JSON.parse(storage.written[SCORING_HISTORY_STORAGE_KEY]).map((item: ScoringHistoryRecord) => item.id), next.map((item) => item.id));
});

test('clears scoring history from storage', () => {
  const storage = createMemoryStorage(JSON.stringify([record('1')]));
  storage.setItem(SCORING_HISTORY_STORAGE_KEY, JSON.stringify([record('1')]));

  clearScoringHistoryFromStorage(storage);

  assert.equal(storage.getItem(SCORING_HISTORY_STORAGE_KEY), null);
});
