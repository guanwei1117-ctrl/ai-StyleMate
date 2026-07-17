import assert from 'node:assert/strict';
import test from 'node:test';
import { AiRateLimiter } from './ai-rate-limiter';

test('allows requests within the configured window limit', () => {
  const limiter = new AiRateLimiter(2, 1000);

  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.1', 1000));
  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.1', 1200));
});

test('rejects requests over the configured window limit', () => {
  const limiter = new AiRateLimiter(2, 1000);

  limiter.assertAllowed('ip:127.0.0.1', 1000);
  limiter.assertAllowed('ip:127.0.0.1', 1200);

  assert.throws(
    () => limiter.assertAllowed('ip:127.0.0.1', 1400),
    /AI 分析请求过于频繁/,
  );
});

test('uses independent buckets per key', () => {
  const limiter = new AiRateLimiter(1, 1000);

  limiter.assertAllowed('ip:127.0.0.1', 1000);

  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.2', 1000));
});
