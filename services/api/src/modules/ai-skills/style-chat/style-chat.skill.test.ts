import assert from 'node:assert/strict';
import test from 'node:test';
import { hardenFinalizeResult } from './style-chat.skill';
import type { StyleChatResult } from './style-chat.dto';

test('非强制结束：原样返回', () => {
  const result: StyleChatResult = { reply: '再问你一个问题', done: false };
  assert.deepEqual(hardenFinalizeResult(result, false), result);
});

test('强制结束：done 被硬性置为 true', () => {
  const result: StyleChatResult = { reply: '那你还喜欢什么颜色呢？', done: false };
  const hardened = hardenFinalizeResult(result, true);
  assert.equal(hardened.done, true);
});

test('强制结束且模型给了 statement：保留 statement', () => {
  const result: StyleChatResult = {
    reply: '好的，总结一下',
    done: true,
    statement: '我喜欢法式风格，预算中等。',
  };
  const hardened = hardenFinalizeResult(result, true);
  assert.equal(hardened.statement, '我喜欢法式风格，预算中等。');
});

test('强制结束但模型没给 statement：回退用 reply', () => {
  const result: StyleChatResult = { reply: '你的偏好是极简风格。', done: false };
  const hardened = hardenFinalizeResult(result, true);
  assert.equal(hardened.statement, '你的偏好是极简风格。');
});

test('强制结束且 reply 为空：给出兜底文案', () => {
  const result: StyleChatResult = { reply: '', done: false };
  const hardened = hardenFinalizeResult(result, true);
  assert.ok(hardened.statement && hardened.statement.length > 0);
  assert.equal(hardened.done, true);
});
