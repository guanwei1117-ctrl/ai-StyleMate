import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveUserId, getAuthedUserId } from './resolve-user-id';

function createReq(user: { sub: string } | null): any {
  return { user };
}

test('已登录：返回 JWT sub，忽略客户端 userId 差异时拒绝', () => {
  const req = createReq({ sub: 'account-1' });
  assert.equal(resolveUserId(req, 'account-1'), 'account-1');
});

test('已登录但客户端 userId 不一致 → 拒绝越权', () => {
  const req = createReq({ sub: 'account-1' });
  assert.throws(
    () => resolveUserId(req, 'local-xxx'),
    /无权访问其他用户的数据/,
  );
});

test('已登录且客户端未提供 userId → 使用 JWT sub', () => {
  const req = createReq({ sub: 'account-1' });
  assert.equal(resolveUserId(req, null), 'account-1');
  assert.equal(resolveUserId(req, undefined), 'account-1');
});

test('未登录：使用客户端提供的本地 userId', () => {
  const req = createReq(null);
  assert.equal(resolveUserId(req, 'local-123'), 'local-123');
});

test('未登录且未提供 userId → 拒绝', () => {
  const req = createReq(null);
  assert.throws(() => resolveUserId(req, null), /缺少用户标识/);
});

test('getAuthedUserId：未登录返回 undefined', () => {
  assert.equal(getAuthedUserId(createReq(null)), undefined);
  assert.equal(getAuthedUserId(createReq({ sub: 'account-1' })), 'account-1');
});
