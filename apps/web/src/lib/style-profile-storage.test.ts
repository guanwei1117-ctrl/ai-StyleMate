import assert from 'node:assert/strict';
import test from 'node:test';
import { clearStyleProfileFromStorage, STYLE_PROFILE_STORAGE_KEY } from './style-profile-storage-core';

test('clears style profile using the shared storage key', () => {
  const removedKeys: string[] = [];
  const storage = { removeItem: (key: string) => removedKeys.push(key) };

  clearStyleProfileFromStorage(storage);

  assert.deepEqual(removedKeys, [STYLE_PROFILE_STORAGE_KEY]);
});
