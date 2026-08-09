import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScoringSummaryText } from './scoring-summary';
import type { EvaluateOutfitResponse } from './scoring-types';

const result: EvaluateOutfitResponse = {
  greeting: '整体还不错，但比例可以更利落。',
  overallComment: '这套 Look 色彩干净，鞋包可以再加强呼应。',
  dimensions: [
    { key: 'color', label: '色彩', score: 88, comment: '色彩协调' },
    { key: 'proportion', label: '比例', score: 76, comment: '腰线略低' },
  ],
  itemComments: ['上衣版型合适', '鞋子存在感偏弱'],
  improvements: ['提高腰线', '换一双更利落的鞋'],
};

test('builds a readable scoring summary with average score and top dimensions', () => {
  const summary = buildScoringSummaryText(result);

  assert.match(summary, /StyleMate 今日 Look 诊断/);
  assert.match(summary, /平均分：82/);
  assert.match(summary, /色彩 88/);
  assert.match(summary, /比例 76/);
  assert.match(summary, /提高腰线/);
  assert.match(summary, /换一双更利落的鞋/);
});

test('limits long lists in the summary', () => {
  const summary = buildScoringSummaryText({
    ...result,
    dimensions: [
      ...result.dimensions,
      { key: 'occasion', label: '场景', score: 70, comment: '场景一般' },
      { key: 'trend', label: '趋势', score: 66, comment: '趋势一般' },
    ],
    improvements: ['建议 1', '建议 2', '建议 3', '建议 4'],
  });

  assert.match(summary, /色彩 88、比例 76、场景 70/);
  assert.doesNotMatch(summary, /趋势 66/);
  assert.match(summary, /1\. 建议 1\n2\. 建议 2\n3\. 建议 3/);
  assert.doesNotMatch(summary, /建议 4/);
});
