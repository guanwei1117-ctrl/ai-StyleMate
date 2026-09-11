import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyWardrobePreFilter } from './wardrobe-pre-filter';
import type { WardrobeItemInput } from './styling-rules.engine';

/** 构造测试用单品 */
function makeItem(overrides: Partial<WardrobeItemInput> & { id: string }): WardrobeItemInput {
  return {
    id: overrides.id,
    category: overrides.category ?? 'top',
    subCategory: overrides.subCategory ?? 'T 恤',
    color: overrides.color ?? '白',
    material: overrides.material ?? '棉',
    season: overrides.season ?? ['spring', 'summer'],
    styleTags: overrides.styleTags ?? [],
    occasionTags: overrides.occasionTags ?? [],
    formalityScore: overrides.formalityScore ?? 3,
    warmthScore: overrides.warmthScore ?? 2,
    matchabilityScore: overrides.matchabilityScore ?? 50,
    matchColors: overrides.matchColors ?? [],
    matchCategories: overrides.matchCategories ?? [],
  };
}

describe('wardrobe-pre-filter', () => {
  // ===== 基础功能 =====
  it('500 件衣橱过滤到 ≤ 20 件', () => {
    const items = Array.from({ length: 500 }, (_, i) =>
      makeItem({ id: `item-${i}`, category: 'top' }),
    );
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items.length, 20, 'should return 20 items');
    assert.equal(result.totalBefore, 500);
    assert.equal(result.totalAfter, 20);
    assert.equal(result.reasons.overMaxItems, 480, '480 dropped by topK');
  });

  it('少件衣橱（如 10 件）保持原样', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: `item-${i}` }),
    );
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items.length, 10);
    assert.equal(result.reasons.overMaxItems, 0);
  });

  // ===== 规则引擎排除的必须被剔除 =====
  it('规则引擎排除的 id 必须被剔除', () => {
    const items = [
      makeItem({ id: 'a' }),
      makeItem({ id: 'b' }),
      makeItem({ id: 'c' }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(['b']),
      maxItems: 20,
    });
    assert.equal(result.items.length, 2);
    assert.equal(result.items.find((i) => i.id === 'b'), undefined, 'b must be excluded');
    assert.equal(result.reasons.excludedByRules, 1);
  });

  // ===== 季节过滤 =====
  it('冬季温度剔除只有 summer 季节的单品', () => {
    const items = [
      makeItem({ id: 'winter-jacket', season: ['winter'] }),
      makeItem({ id: 'summer-tee', season: ['summer'] }),
      makeItem({ id: 'all-season', season: ['spring', 'summer', 'winter'] }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 5, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    const ids = result.items.map((i) => i.id);
    assert.ok(ids.includes('winter-jacket'));
    assert.ok(ids.includes('all-season'));
    assert.ok(!ids.includes('summer-tee'), 'summer tee should be excluded');
    assert.equal(result.reasons.seasonMismatch, 1);
  });

  it('夏季温度剔除只有 winter 季节的单品', () => {
    const items = [
      makeItem({ id: 'winter-coat', season: ['winter'] }),
      makeItem({ id: 'summer-tee', season: ['summer'] }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 30, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    const ids = result.items.map((i) => i.id);
    assert.ok(!ids.includes('winter-coat'));
    assert.ok(ids.includes('summer-tee'));
  });

  it('无 season 字段的单品保留（缺数据不轻易抛弃）', () => {
    const items = [
      makeItem({ id: 'no-season', season: [] }),
      makeItem({ id: 'summer', season: ['summer'] }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 30, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items.length, 2, 'no-season should be kept');
  });

  // ===== 排序：偏好优先 =====
  it('likedStyles 优先于其他单品', () => {
    const items = [
      makeItem({ id: 'plain', styleTags: ['basic'], matchabilityScore: 80 }),
      makeItem({ id: 'liked', styleTags: ['minimal', 'commute'], matchabilityScore: 50 }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      memorySnapshot: { likedStyles: ['minimal'] },
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items[0].id, 'liked', 'liked style item should rank first');
  });

  it('preferredColors 加分', () => {
    const items = [
      makeItem({ id: 'white', color: '白', matchabilityScore: 50 }),
      makeItem({ id: 'red', color: '红', matchabilityScore: 50 }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      memorySnapshot: { preferredColors: ['白'] },
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items[0].id, 'white');
  });

  it('dislikedColors 减分', () => {
    const items = [
      makeItem({ id: 'liked-color', color: '白', matchabilityScore: 50 }),
      makeItem({ id: 'hated-color', color: '荧光绿', matchabilityScore: 50 }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      memorySnapshot: { dislikedColors: ['荧光绿'] },
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items[0].id, 'liked-color');
  });

  // ===== 场合正式度匹配 =====
  it('正式场合下高正式度单品优先', () => {
    const items = [
      makeItem({ id: 'casual', formalityScore: 1, matchabilityScore: 50 }),
      makeItem({ id: 'formal', formalityScore: 5, matchabilityScore: 50 }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'formal',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items[0].id, 'formal');
  });

  it('休闲场合下低正式度单品优先', () => {
    const items = [
      makeItem({ id: 'casual', formalityScore: 1, matchabilityScore: 50 }),
      makeItem({ id: 'formal', formalityScore: 5, matchabilityScore: 50 }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'casual',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items[0].id, 'casual');
  });

  // ===== 保暖匹配 =====
  it('极冷天保暖单品加分', () => {
    const items = [
      makeItem({ id: 'cold-warm', warmthScore: 8, matchabilityScore: 50, season: ['winter', 'spring'] }),
      makeItem({ id: 'cold-thin', warmthScore: 2, matchabilityScore: 50, season: ['spring', 'summer'] }),
    ];
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 0, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.equal(result.items[0].id, 'cold-warm');
  });

  // ===== 综合场景：模拟真实用户 =====
  it('综合场景：450 件衣橱 + 偏好 + 规则排除', () => {
    // 模拟用户衣橱：
    // - 100 件 T 恤
    // - 50 件外套
    // - 100 件下装
    // - 50 件连衣裙
    // - 100 件鞋
    // - 50 件配饰
    // 共 450 件
    const items: WardrobeItemInput[] = [];
    const cats = ['top', 'outerwear', 'bottom', 'dress', 'shoes', 'accessory'];
    let idx = 0;
    for (const cat of cats) {
      const count = cat === 'top' ? 100 : cat === 'bottom' || cat === 'shoes' ? 100 : 50;
      for (let i = 0; i < count; i++) {
        items.push(makeItem({
          id: `item-${idx}`,
          category: cat,
          styleTags: i % 3 === 0 ? ['minimal'] : ['basic'],
          color: i % 5 === 0 ? '白' : '黑',
        }));
        idx++;
      }
    }
    // 规则排除前 10 件（id-0 到 id-9）
    const excludedIds = new Set(items.slice(0, 10).map((i) => i.id));

    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      memorySnapshot: {
        likedStyles: ['minimal'],
        preferredColors: ['白'],
      },
      excludedItemIds: excludedIds,
      maxItems: 20,
    });

    assert.equal(result.items.length, 20);
    assert.equal(result.totalBefore, 450);
    assert.equal(result.reasons.excludedByRules, 10);
    // 验证前 20 件都是 liked style 或 preferred color
    const topIds = result.items.map((i) => i.id);
    const hasExcluded = topIds.some((id) => excludedIds.has(id));
    assert.equal(hasExcluded, false, 'top 20 should not contain excluded items');
  });

  // ===== 摘要可读 =====
  it('summary 含过滤前/后数量', () => {
    const items = Array.from({ length: 100 }, (_, i) => makeItem({ id: `i${i}` }));
    const result = applyWardrobePreFilter(items, {
      weather: { temperature: 22, isRaining: false },
      occasion: 'commute',
      styleGoal: 'comfortable',
      excludedItemIds: new Set(),
      maxItems: 20,
    });
    assert.ok(result.summary.includes('100'), 'should include 100');
    assert.ok(result.summary.includes('20'), 'should include 20');
  });
});