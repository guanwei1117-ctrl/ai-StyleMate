import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApiErrorMessage } from './api-error';

test('uses server message when API returns a JSON message', async () => {
  const response = new Response(JSON.stringify({ message: '图片不能超过 8MB' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });

  const message = await buildApiErrorMessage(response, '评分请求失败');

  assert.equal(message, '图片不能超过 8MB');
});

test('returns friendly message for rate limited responses', async () => {
  const response = new Response('', { status: 429 });

  const message = await buildApiErrorMessage(response, '评分请求失败');

  assert.equal(message, 'AI 分析请求过于频繁，请稍后再试。');
});

test('returns friendly timeout message for gateway timeouts', async () => {
  const response = new Response('', { status: 504 });

  const message = await buildApiErrorMessage(response, 'AI 风格分析请求失败');

  assert.equal(message, 'AI 分析超时，请稍后重试。');
});
