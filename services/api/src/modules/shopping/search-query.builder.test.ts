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

// ---------- 画像感知搜索词 ----------

test('画像风格融入：适合风格+喜好关键词（无单品风格时补足 3 个）', () => {
  const q = buildSearchQuery({
    category: 'shoes',
    subCategory: '平底鞋',
    color: '黑色',
    profile: {
      suitableStyles: ['法式', '极简'],
      likedKeywords: ['高级'],
      dislikedKeywords: ['网红'],
    },
  });
  assert.equal(q, '黑色 平底鞋 法式 极简 高级');
});

test('画像避雷：讨厌的关键词不进入搜索词', () => {
  const q = buildSearchQuery({
    category: 'top',
    subCategory: '衬衫',
    profile: {
      likedKeywords: ['网红', '清冷'],
      dislikedKeywords: ['网红'],
    },
  });
  assert.equal(q, '衬衫 清冷');
});

test('体型修饰：梨形身材买下装自动加"高腰"', () => {
  const q = buildSearchQuery({
    category: 'bottom',
    subCategory: '半身裙',
    color: '黑色',
    profile: { bodyShape: 'pear' },
  });
  assert.equal(q, '黑色 半身裙 高腰');
});

test('体型修饰不作用于鞋包配饰（避免"高腰平底鞋"）', () => {
  const q = buildSearchQuery({
    category: 'shoes',
    subCategory: '平底鞋',
    color: '黑色',
    profile: { bodyShape: 'pear' },
  });
  assert.equal(q, '黑色 平底鞋');
});

test('小个子：身高 155cm 买连衣裙附加"小个子"', () => {
  const q = buildSearchQuery({
    category: 'dress',
    subCategory: '连衣裙',
    profile: { heightCm: 155 },
  });
  assert.equal(q, '连衣裙 小个子');
});

test('身高 168cm 不附加小个子', () => {
  const q = buildSearchQuery({
    category: 'dress',
    subCategory: '连衣裙',
    profile: { heightCm: 168 },
  });
  assert.equal(q, '连衣裙');
});

test('穿搭目标：显瘦显高 → 显瘦', () => {
  const q = buildSearchQuery({
    category: 'bottom',
    subCategory: '牛仔裤',
    profile: { dressingGoals: ['显瘦显高'] },
  });
  assert.equal(q, '牛仔裤 显瘦');
});

test('画像预算兜底：单品无预算区间时按 budget 档位附加"平价"', () => {
  const q = buildSearchQuery({
    category: 'top',
    subCategory: 'T恤',
    profile: { budgetLevel: 'budget' },
  });
  assert.equal(q, 'T恤 平价');
});

test('搜索词总数上限 7 个，避免过长失焦', () => {
  const q = buildSearchQuery({
    category: 'dress',
    subCategory: '连衣裙',
    color: '白色',
    styleTags: ['法式', '度假'],
    occasion: 'travel',
    profile: {
      suitableStyles: ['极简', '浪漫'],
      likedKeywords: ['高级', '清冷', '松弛'],
      bodyShape: 'pear',
      heightCm: 155,
      dressingGoals: ['显瘦显高'],
      budgetLevel: 'mid',
    },
  });
  assert.ok(q.split(' ').length <= 7, `词数超限: ${q}`);
});
