import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_IMAGE_UPLOAD_BYTES, validateImageDataUrl } from './image-data-url.validator';

function imageDataUrl(mime: string, bytes: number) {
  return `data:${mime};base64,${Buffer.alloc(bytes).toString('base64')}`;
}

test('accepts jpeg, png and webp data urls up to 8MB', () => {
  assert.doesNotThrow(() => validateImageDataUrl(imageDataUrl('image/jpeg', MAX_IMAGE_UPLOAD_BYTES), 'imageBase64'));
  assert.doesNotThrow(() => validateImageDataUrl(imageDataUrl('image/png', 1024), 'imageBase64'));
  assert.doesNotThrow(() => validateImageDataUrl(imageDataUrl('image/webp', 1024), 'imageBase64'));
});

test('rejects unsupported image data url mime types', () => {
  assert.throws(
    () => validateImageDataUrl(imageDataUrl('image/svg+xml', 1024), 'imageBase64'),
    /仅支持 JPG \/ PNG \/ WebP 图片/,
  );
});

test('rejects invalid image data urls', () => {
  assert.throws(
    () => validateImageDataUrl('not-a-data-url', 'imageBase64'),
    /图片格式无效/,
  );
});

test('rejects images larger than 8MB after base64 decoding', () => {
  assert.throws(
    () => validateImageDataUrl(imageDataUrl('image/png', MAX_IMAGE_UPLOAD_BYTES + 1), 'imageBase64'),
    /图片不能超过 8MB/,
  );
});
