import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  validateImageFile,
} from './image-upload-rules';

test('accepts image files up to the upload size limit', () => {
  const result = validateImageFile({ type: 'image/png', size: MAX_IMAGE_UPLOAD_BYTES });

  assert.equal(result.ok, true);
});

test('rejects unsupported file types', () => {
  const pdfResult = validateImageFile({ type: 'application/pdf', size: 1024 });
  const gifResult = validateImageFile({ type: 'image/gif', size: 1024 });

  assert.equal(pdfResult.ok, false);
  assert.equal(pdfResult.message, '请上传 JPG / PNG / WebP 图片文件。');
  assert.equal(gifResult.ok, false);
  assert.equal(gifResult.message, '请上传 JPG / PNG / WebP 图片文件。');
});

test('rejects images larger than the upload size limit', () => {
  const result = validateImageFile({ type: 'image/jpeg', size: MAX_IMAGE_UPLOAD_BYTES + 1 });

  assert.equal(result.ok, false);
  assert.equal(result.message, '图片不能超过 8MB，请压缩后重新上传。');
});


