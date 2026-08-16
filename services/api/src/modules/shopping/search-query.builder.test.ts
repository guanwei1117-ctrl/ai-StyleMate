import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSearchQuery } from './search-query.builder';

test('完整信息：颜色+子类+风格+预算+场景', () => {
  const q = buildSearchQuery({
    category: 'bottom',
    subCategory: '阔腿裤',
    color: '白色',
    styleTags: ['通勤', '韩系', '百搭'],
    budgetRange: '¥100-200',
    occasion: 'commute',
  });
  assert.equal(q, '白色 阔腿裤 通勤 韩系 平价');
});

test('泛风格词（百搭/基础/日常）被过滤', () => {
  const q = buildSearchQuery({
    category: 'top',
    subCategory: 'T恤',
    color: '黑色',
    styleTags: ['百搭', '基础款', '日常'],
  });
  assert.equal(q, '黑色 T恤');
});

test('预算区间映射：≤200 → 平价，≥600 → 轻奢，中间不附加', () => {
  assert.equal(
    buildSearchQuery({ category: 'dress', budgetRange: '¥150-200' }),
    '连体装 平价',
  );
  assert.equal(
    buildSearchQuery({ category: 'dress', budgetRange: '¥600-900' }),
    '连体装 轻奢',
  );
  assert.equal(
    buildSearchQuery({ category: 'dress', budgetRange: '¥300-500' }),
    '连体装',
  );
});

test('无子类时回退品类中文名', () => {
  const q = buildSearchQuery({ category: 'outerwear', color: '驼色' });
  assert.equal(q, '驼色 外套');
});

test('场景词映射：commute → 通勤', () => {
  const q = buildSearchQuery({ category: 'shoes', occasion: 'commute' });
  assert.equal(q, '鞋类 通勤');
});

test('重复词去重', () => {
  const q = buildSearchQuery({
    category: 'top',
    subCategory: '衬衫',
    color: '白色',
    styleTags: ['白色', '通勤'],
  });
  assert.equal(q, '白色 衬衫 通勤');
});
