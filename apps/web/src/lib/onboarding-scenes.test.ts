import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DAILY_SCENE_LABELS,
  DAILY_SCENE_OPTIONS,
  createDefaultAnswers,
} from './onboarding-types';
import { buildStyleProfilePayload } from './style-profile-api';

test('daily scene library covers broader concrete situations', () => {
  const values = DAILY_SCENE_OPTIONS.map((item) => item.value);

  assert.ok(DAILY_SCENE_OPTIONS.length >= 14);
  assert.ok(values.includes('client_meeting'));
  assert.ok(values.includes('wedding_formal'));
  assert.ok(values.includes('music_festival'));
  assert.ok(values.includes('parenting'));
  assert.ok(values.includes('workout'));
});

test('daily scene labels are available for every scene option', () => {
  for (const option of DAILY_SCENE_OPTIONS) {
    assert.equal(typeof DAILY_SCENE_LABELS[option.value], 'string');
    assert.ok(DAILY_SCENE_LABELS[option.value].length > 0);
  }
});

test('style profile AI payload includes selected scenes, custom scene, and richer style library metadata', () => {
  const answers = createDefaultAnswers();
  answers.gender = 'female';
  answers.height = 165;
  answers.weight = 52;
  answers.ageGroup = '25_29';
  answers.dailyScenes = ['client_meeting', 'date', 'travel'];
  answers.customScene = '经常需要直播上镜和周末探店';

  const payload = buildStyleProfilePayload(answers, 'rectangle', [
    {
      styleId: 'office_boss',
      styleName: '职场大女主风',
      category: '职场精英',
      score: 82,
      matchReasons: ['适合见客户'],
      matchBreakdown: {
        bodyShape: 12,
        preference: 20,
        skinTone: 3,
        budget: 10,
        ageFit: 8,
        scene: 10,
        priority: 8,
        goal: 4,
        openness: 3,
      },
      pillars: { aesthetic: 35, realistic: 28, behavioral: 15 },
    },
  ]);

  assert.deepEqual(payload.profile.dailyScenes, ['client_meeting', 'date', 'travel']);
  assert.equal(payload.profile.customScene, '经常需要直播上镜和周末探店');
  assert.ok(payload.profile.sceneLabels.includes('见客户'));
  assert.ok(payload.profile.sceneLabels.includes('约会'));
  assert.equal(payload.candidates[0].styleId, 'office_boss');
  assert.ok(payload.candidates[0].dimension);
  assert.ok(payload.candidates[0].philosophy);
  assert.ok(Array.isArray(payload.candidates[0].silhouette));
  assert.ok(Array.isArray(payload.candidates[0].colorPalette));
  assert.deepEqual(payload.candidates[0].pillars, { aesthetic: 35, realistic: 28, behavioral: 15 });
});
