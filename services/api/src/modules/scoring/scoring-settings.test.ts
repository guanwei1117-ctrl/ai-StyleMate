import assert from 'node:assert/strict';
import test from 'node:test';
import { STYLE_PROFILE_TEMPERATURE } from './scoring-settings';

test('style profile AI temperature stays stable but not rigid', () => {
  assert.equal(STYLE_PROFILE_TEMPERATURE, 0.3);
});
