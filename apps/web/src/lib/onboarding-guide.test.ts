import assert from 'node:assert/strict';
import test from 'node:test';
import { ONBOARDING_GUIDE_SECTIONS } from './onboarding-guide';

test('onboarding guide keeps the simplified flow to three short sections', () => {
  assert.equal(ONBOARDING_GUIDE_SECTIONS.length, 3);
  assert.deepEqual(ONBOARDING_GUIDE_SECTIONS.map((item) => item.title), ['基础', '喜好', '生成']);
});

test('onboarding guide copy stays concise', () => {
  for (const section of ONBOARDING_GUIDE_SECTIONS) {
    assert.ok(section.copy.length <= 32, `${section.title} copy is too long`);
    assert.ok(section.items.length <= 3, `${section.title} has too many items`);
  }
});
