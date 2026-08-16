import assert from 'node:assert/strict';
import test from 'node:test';
import { signTaobaoParams, taobaoTimestamp } from './taobao-sign';

const BASE_PARAMS: Record<string, string> = {
  method: 'taobao.tbk.dg.material.optional',
  app_key: 'test',
  q: '白色阔腿裤',
  timestamp: '2026-01-01 00:00:00',
  format: 'json',
  v: '2.0',
  sign_method: 'md5',
  adzone_id: '12345',
  page_size: '8',
  page_no: '1',
};

test('淘宝 MD5 签名与官方规则一致（固定向量）', () => {
  // 手工按官方规则计算：secret + sorted(keyvalue) + secret，MD5 大写
  const sign = signTaobaoParams(BASE_PARAMS, 'secret123');
  assert.equal(sign, '7F4C74F60AF1420EE6A7AD4051EE34E2');
});

test('签名与参数顺序无关（先排序再拼接）', () => {
  const reversed: Record<string, string> = {};
  for (const key of Object.keys(BASE_PARAMS).reverse()) {
    reversed[key] = BASE_PARAMS[key];
  }
  assert.equal(signTaobaoParams(reversed, 'secret123'), signTaobaoParams(BASE_PARAMS, 'secret123'));
});

test('任一参数变化 → 签名变化', () => {
  const changed = { ...BASE_PARAMS, q: '黑色阔腿裤' };
  assert.notEqual(signTaobaoParams(changed, 'secret123'), signTaobaoParams(BASE_PARAMS, 'secret123'));
});

test('secret 变化 → 签名变化', () => {
  assert.notEqual(signTaobaoParams(BASE_PARAMS, 'secret456'), signTaobaoParams(BASE_PARAMS, 'secret123'));
});

test('签名为 32 位大写十六进制', () => {
  const sign = signTaobaoParams(BASE_PARAMS, 'secret123');
  assert.match(sign, /^[0-9A-F]{32}$/);
});

test('时间戳为东八区 yyyy-MM-dd HH:mm:ss', () => {
  // 2026-01-02T03:04:05Z → 东八区 2026-01-02 11:04:05
  const ts = taobaoTimestamp(new Date('2026-01-02T03:04:05Z'));
  assert.equal(ts, '2026-01-02 11:04:05');
});
