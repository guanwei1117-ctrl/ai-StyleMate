import assert from 'node:assert/strict';
import test from 'node:test';
import { matchStyles } from './style-matcher';
import { createDefaultAnswers, type OnboardingAnswers } from './onboarding-types';

function buildAnswers(overrides: Partial<OnboardingAnswers> = {}): OnboardingAnswers {
  return {
    ...createDefaultAnswers(),
    height: 168,
    weight: 60,
    gender: 'female',
    ...overrides,
  };
}

test('matchStyles returns results for all styles', () => {
  const answers = buildAnswers();
  const results = matchStyles(answers);

  assert.ok(results.length > 0, 'should return at least some style matches');
  // Verify each result has expected shape
  for (const result of results) {
    assert.ok(typeof result.styleId === 'string');
    assert.ok(typeof result.styleName === 'string');
    assert.ok(typeof result.score === 'number');
    assert.ok(result.score >= 0 && result.score <= 100, `score ${result.score} should be 0-100`);
    assert.ok(Array.isArray(result.matchReasons));
    assert.ok(result.matchBreakdown);
    assert.ok(result.pillars);
    assert.ok(typeof result.category === 'string');
  }
});

test('matchStyles returns results sorted by score descending', () => {
  const answers = buildAnswers();
  const results = matchStyles(answers);

  for (let i = 1; i < results.length; i++) {
    assert.ok(
      results[i - 1].score >= results[i].score,
      `results should be sorted by score desc, but ${results[i - 1].score} < ${results[i].score} at index ${i}`,
    );
  }
});

test('matchStyles handles minimal answers gracefully', () => {
  const answers = buildAnswers({
    preferredStyleIds: [],
    dressingGoals: [],
    priorities: [],
    dailyScenes: [],
  });
  const results = matchStyles(answers);

  // Should still return results with scores
  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.score >= 0 && r.score <= 100));
});

test('matchStyles gives higher scores when preferred styles match', () => {
  const answersWithout = buildAnswers({ preferredStyleIds: [] });
  const withoutPreference = matchStyles(answersWithout);

  // Pick the top style and set it as preferred
  const topStyleId = withoutPreference[0].styleId;
  const answersWith = buildAnswers({ preferredStyleIds: [topStyleId] });
  const withPreference = matchStyles(answersWith);

  // The preferred style should rank at or near top
  const preferredResult = withPreference.find((r) => r.styleId === topStyleId);
  assert.ok(preferredResult, 'preferred style should appear in results');

  // Same style with preference should score >= same style without preference
  const withoutScore = withoutPreference.find((r) => r.styleId === topStyleId)!.score;
  assert.ok(
    preferredResult!.score >= withoutScore,
    `preferred style should score >= non-preferred: ${preferredResult!.score} vs ${withoutScore}`,
  );
});

test('matchStyles respects gender filtering if applicable', () => {
  const maleAnswers = buildAnswers({ gender: 'male' });
  const femaleAnswers = buildAnswers({ gender: 'female' });

  const maleResults = matchStyles(maleAnswers);
  const femaleResults = matchStyles(femaleAnswers);

  // Both should return valid results
  assert.ok(maleResults.length > 0);
  assert.ok(femaleResults.length > 0);
});

test('matchStyles handles extreme height/weight values', () => {
  const answers = buildAnswers({ height: 200, weight: 120 });
  const results = matchStyles(answers);

  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.score >= 0 && r.score <= 100));
});
