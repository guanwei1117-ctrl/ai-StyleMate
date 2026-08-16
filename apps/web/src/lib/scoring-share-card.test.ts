import assert from 'node:assert/strict';
import test from 'node:test';
import { wrapText, SHARE_CARD_WIDTH } from './scoring-share-card';

/** 模拟 canvas 2d 上下文：每个字符（含中文）宽度按固定值计 */
function createMockCtx(charWidth: number): CanvasRenderingContext2D {
  return {
    measureText: (text: string) => ({ width: Array.from(text).length * charWidth }),
  } as unknown as CanvasRenderingContext2D;
}

test('wrapText 在不超过最大宽度时返回单行', () => {
  const ctx = createMockCtx(10);
  const lines = wrapText('短文本', 200, ctx);
  assert.deepEqual(lines, ['短文本']);
});

test('wrapText 按最大宽度折行', () => {
  const ctx = createMockCtx(10);
  const lines = wrapText('一二三四五六七八九十', 50, ctx);
  assert.deepEqual(lines, ['一二三四五', '六七八九十']);
});

test('wrapText 不拆散单个字符（中文安全）', () => {
  const ctx = createMockCtx(10);
  const lines = wrapText('一二三', 15, ctx);
  assert.deepEqual(lines, ['一', '二', '三']);
});

test('wrapText 处理空字符串', () => {
  const ctx = createMockCtx(10);
  assert.deepEqual(wrapText('', 50, ctx), []);
});

test('分享卡尺寸为竖版 3:4 比例', () => {
  assert.ok(SHARE_CARD_WIDTH > 0);
  assert.equal(Math.round((SHARE_CARD_WIDTH * 4) / 3), 1440);
});
