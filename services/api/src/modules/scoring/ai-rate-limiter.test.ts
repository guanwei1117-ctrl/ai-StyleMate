import assert from 'node:assert/strict';
import test from 'node:test';
import { AiRateLimiter } from './ai-rate-limiter';

test('allows requests within the configured window limit', () => {
  const limiter = AiRateLimiter.forTesting(2, 1000);

  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.1', 1000));
  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.1', 1200));
});

test('rate limiter is disabled — no longer rejects requests', () => {
  const limiter = AiRateLimiter.forTesting(2, 1000);

  // 连续多次调用，限流已关闭，不应抛出异常
  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.1', 1000));
  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.1', 1200));
  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.1', 1400));
});

test('uses independent buckets per key', () => {
  const limiter = AiRateLimiter.forTesting(1, 1000);

  limiter.assertAllowed('ip:127.0.0.1', 1000);

  assert.doesNotThrow(() => limiter.assertAllowed('ip:127.0.0.2', 1000));
});
