import assert from 'node:assert/strict';
import test from 'node:test';

// Note: compressImage uses browser Canvas API and is tested for SSR behavior here.
// Full browser integration tests would require jsdom or a browser environment.
// We test the pure utility functions that are exported or can be tested in isolation.

test('compressImage returns original file in non-browser (SSR) environment', async () => {
  // Dynamic import to avoid hoisting issues with the browser check
  const { compressImage } = await import('./image-compress');

  const largeFile = new File(
    [new Uint8Array(600 * 1024).buffer], // 600KB dummy data
    'test.jpg',
    { type: 'image/jpeg' },
  );

  // In Node.js (no window.HTMLCanvasElement), should return the original file
  const result = await compressImage(largeFile);

  // Should be the same file since we're in SSR
  assert.equal(result, largeFile);
});

test('compressImage returns original for small files even in SSR', async () => {
  const { compressImage } = await import('./image-compress');

  const smallFile = new File(
    [new Uint8Array(100 * 1024).buffer], // 100KB
    'small.jpg',
    { type: 'image/jpeg' },
  );

  const result = await compressImage(smallFile);
  assert.equal(result, smallFile);
});
