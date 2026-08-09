import assert from 'node:assert/strict';
import test from 'node:test';
import { ResponseParserService } from './response-parser.service';

const parser = new ResponseParserService();

// ── parseEvaluateResponse ──

test('parses valid LLM JSON response for outfit evaluation', () => {
  const result = parser.parseEvaluateResponse(
    JSON.stringify({
      greeting: '嘿！这套有点意思～',
      overallComment: '整体配色和谐，但裤长可以再调整。',
      dimensions: [
        { key: 'proportion', label: '比例与廓形', score: 78, comment: '上下比例不错' },
        { key: 'color', label: '色彩协调', score: 85, comment: '色系统一' },
      ],
      itemComments: ['上衣选得好'],
      improvements: ['裤子建议九分', '鞋子换白色'],
    }),
  );

  assert.equal(result.greeting, '嘿！这套有点意思～');
  assert.equal(result.overallComment, '整体配色和谐，但裤长可以再调整。');
  assert.equal(result.dimensions.length, 2);
  assert.equal(result.itemComments[0], '上衣选得好');
  assert.equal(result.improvements.length, 2);
});

test('parses JSON wrapped in markdown code block', () => {
  const result = parser.parseEvaluateResponse(
    '```json\n{"greeting":"hi","overallComment":"ok","dimensions":[],"itemComments":[],"improvements":[]}\n```',
  );

  assert.equal(result.greeting, 'hi');
  assert.equal(result.overallComment, 'ok');
});

test('falls back to defaults when dimensions is not an array', () => {
  const result = parser.parseEvaluateResponse(
    JSON.stringify({ greeting: 'hi', overallComment: 'ok', dimensions: 'invalid' }),
  );

  assert.equal(result.dimensions.length, 8); // all 8 default dimensions
  assert.equal(result.dimensions[0].score, 70);
  assert.equal(result.dimensions[0].comment, 'AI 评分异常，请稍后重试');
});

test('uses default greeting and comment when missing', () => {
  const result = parser.parseEvaluateResponse('{}');

  assert.equal(result.greeting, '嘿！让我看看～');
  assert.ok(result.overallComment.includes('整体搭配不错'));
});

// ── parseStyleProfileResponse ──

test('parses valid style profile response', () => {
  const result = parser.parseStyleProfileResponse(JSON.stringify({
    summary: '你适合韩系简约风。',
    visualAnalysis: { face: '圆脸', body: '标准身材', confidence: 0.8 },
    intentAnalysis: {
      likedKeywords: ['简约', '干净'],
      dislikedKeywords: ['花哨'],
      desiredImpression: ['温柔'],
      scenes: ['通勤'],
      constraints: ['预算有限'],
      cleanedStatement: '我想要简约干净的通勤穿搭。',
    },
    recommendedStyles: [
      { styleId: 'korean_minimal', score: 90, reasons: ['适合'], notices: ['注意颜色'] },
    ],
    avoidanceAdvice: ['避免大印花'],
    nextActions: ['尝试基础款'],
    memoryMerge: {
      suitableStyles: ['korean_minimal'],
      likedStyles: ['韩系简约'],
      dislikedStyles: [],
      preferredColors: ['白', '黑'],
      dislikedColors: [],
      bodyConcerns: ['显胯宽'],
      dressGoals: ['显高'],
      commonOccasions: ['通勤'],
      avoidRules: [{ rule: '避免低腰裤', source: 'ai:style_analysis', weight: 5 }],
    },
  }));

  assert.equal(result.summary, '你适合韩系简约风。');
  assert.equal(result.visualAnalysis.confidence, 0.8);
  assert.equal(result.recommendedStyles.length, 1);
  assert.equal(result.recommendedStyles[0].styleId, 'korean_minimal');
  assert.equal(result.recommendedStyles[0].score, 90);
  assert.ok(result.memoryMerge);
  assert.equal(result.memoryMerge!.suitableStyles[0], 'korean_minimal');
  assert.equal(result.memoryMerge!.avoidRules[0].weight, 5);
});

test('clamps style profile scores to 0-100', () => {
  const result = parser.parseStyleProfileResponse(JSON.stringify({
    summary: 'test',
    recommendedStyles: [
      { styleId: 's1', score: 150 },
      { styleId: 's2', score: -10 },
    ],
  }));

  assert.equal(result.recommendedStyles[0].score, 100);
  assert.equal(result.recommendedStyles[1].score, 0);
});

test('handles missing visual analysis gracefully', () => {
  const result = parser.parseStyleProfileResponse('{}');

  assert.equal(result.visualAnalysis.face, '未提供正脸照，暂不做脸部视觉分析。');
  assert.equal(result.visualAnalysis.body, '未提供全身照，暂不做全身比例视觉分析。');
  assert.equal(result.visualAnalysis.confidence, 0.6);
});

// ── parseMemoryMerge ──

test('parseMemoryMerge returns null for non-object input', () => {
  assert.equal(parser.parseMemoryMerge(null), null);
  assert.equal(parser.parseMemoryMerge(undefined), null);
  assert.equal(parser.parseMemoryMerge('string'), null);
  assert.equal(parser.parseMemoryMerge(42), null);
});

test('parseMemoryMerge filters out invalid avoidRules', () => {
  const result = parser.parseMemoryMerge({
    avoidRules: [
      { rule: 'valid', source: 'ai:style_analysis', weight: 5 },
      { notRule: 'missing rule field' },
      null,
      'not an object',
    ],
  });

  assert.equal(result!.avoidRules.length, 1);
  assert.equal(result!.avoidRules[0].rule, 'valid');
});

// ── validateDimensions ──

test('validateDimensions fills all 8 required dimensions', () => {
  const result = parser.validateDimensions([
    { key: 'proportion', label: '比例', score: 80, comment: 'good' },
  ]);

  assert.equal(result.length, 8);
  assert.equal(result[0].score, 80);
  // Missing dimensions get default 70
  assert.equal(result[1].score, 70);
  assert.equal(result[1].comment, 'AI 未返回该维度评分');
});

test('validateDimensions clamps scores to 0-100', () => {
  const result = parser.validateDimensions([
    { key: 'proportion', label: '比例', score: 150, comment: 'hi' },
  ]);

  assert.equal(result[0].score, 100);
});
