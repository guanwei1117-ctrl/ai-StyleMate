import { describe, it } from 'node:test';
import assert from 'node:assert';
import { StylingRulesEngine, type WardrobeItemInput, type WeatherInput } from './styling-rules.engine';

function makeItem(overrides: Partial<WardrobeItemInput> = {}): WardrobeItemInput {
  return {
    id: 'item-001',
    category: 'top',
    subCategory: 'T恤',
    color: '白',
    material: '棉',
    season: ['spring', 'summer'],
    styleTags: [],
    occasionTags: [],
    formalityScore: 2,
    warmthScore: 1,
    matchabilityScore: 8,
    matchColors: ['黑', '蓝'],
    matchCategories: ['bottom'],
    ...overrides,
  };
}

const engine = new StylingRulesEngine();

describe('StylingRulesEngine', () => {
  const baseCtx = {
    items: [
      makeItem({ id: 't1', category: 'top', subCategory: '白色T恤', color: '白', styleTags: ['宽松'], formalityScore: 2, warmthScore: 1 }),
      makeItem({ id: 't2', category: 'top', subCategory: '黑色V领衬衫', color: '黑', styleTags: ['V领', '收腰'], formalityScore: 4, warmthScore: 2 }),
      makeItem({ id: 'b1', category: 'bottom', subCategory: '蓝色阔腿牛仔裤', color: '蓝', styleTags: ['阔腿', '高腰'], formalityScore: 2, warmthScore: 2 }),
      makeItem({ id: 'b2', category: 'bottom', subCategory: '黑色西装裤', color: '黑', styleTags: ['直筒'], formalityScore: 4, warmthScore: 2 }),
      makeItem({ id: 'o1', category: 'outerwear', subCategory: '卡其色风衣', color: '卡其', styleTags: ['H型'], formalityScore: 3, warmthScore: 3, season: ['spring', 'autumn'] }),
      makeItem({ id: 'o2', category: 'outerwear', subCategory: '羽绒服', color: '黑', warmthScore: 5, season: ['winter'] }),
      makeItem({ id: 's1', category: 'shoes', subCategory: '白色帆布鞋', color: '白', formalityScore: 1, warmthScore: 1, matchColors: ['白', '蓝'], matchCategories: ['bottom'] }),
      makeItem({ id: 's2', category: 'shoes', subCategory: '黑色皮鞋', color: '黑', formalityScore: 5, warmthScore: 2, matchColors: ['黑'], matchCategories: ['bottom'] }),
    ],
    weather: { temperature: 22, isRaining: false, windSpeed: 10 } as WeatherInput,
    occasion: 'commute',
    styleGoal: 'comfortable',
    bodyShape: 'rectangle',
  };

  it('scores all items and excludes weather-mismatched ones', () => {
    // 高温排除羽绒服
    const hotCtx = { ...baseCtx, weather: { temperature: 32, isRaining: false, windSpeed: 5 } };
    const result = engine.evaluate(hotCtx);
    assert.ok(result.itemScores.has('t1'));
    assert.ok(result.itemScores.has('o2'));
    const excludedIds = result.excludedItems.map(e => e.itemId);
    assert.ok(excludedIds.includes('o2'), '羽绒服应在高温时被排除');
  });

  it('cold weather favors high warmth items', () => {
    const coldCtx = { ...baseCtx, weather: { temperature: 5, isRaining: false, windSpeed: 15 } };
    const result = engine.evaluate(coldCtx);
    const o1Score = result.itemScores.get('o1')?.weatherScore ?? 0;
    const o2Score = result.itemScores.get('o2')?.weatherScore ?? 0;
    assert.ok(o2Score > o1Score, `羽绒服(${o2Score})应比风衣(${o1Score})在寒冷天气得分高`);
  });

  it('topByCategory groups items correctly', () => {
    const result = engine.evaluate(baseCtx);
    assert.ok(result.topByCategory.has('top'));
    assert.ok(result.topByCategory.has('bottom'));
    assert.ok(result.topByCategory.has('outerwear'));
    assert.ok(result.topByCategory.has('shoes'));
    // 各品类至少有一个
    const tops = result.topByCategory.get('top')!;
    assert.ok(tops.length >= 1);
  });

  it('occasion formality influences scores', () => {
    const normalCtx = { ...baseCtx, occasion: 'commute' };
    const normalResult = engine.evaluate(normalCtx);
    const s1Normal = normalResult.itemScores.get('s1')?.occasionScore ?? 0;

    const formalCtx = { ...baseCtx, occasion: 'client' };
    const formalResult = engine.evaluate(formalCtx);
    const s2Formal = formalResult.itemScores.get('s2')?.occasionScore ?? 0;

    // 正式场合：皮鞋(s2)正式度5>帆布鞋(s1)正式度1
    assert.ok(s2Formal > 70, `皮鞋在见客户场合应高分，实际${s2Formal}`);
  });

  it('body shape matching affects scores', () => {
    const pearCtx = { ...baseCtx, bodyShape: 'pear' };
    const result = engine.evaluate(pearCtx);
    const b1Score = result.itemScores.get('b1')?.bodyFitScore ?? 0;
    // 阔腿牛仔裤适合梨形
    assert.ok(b1Score >= 50, `阔腿裤对梨形应≥50，实际${b1Score}`);
  });

  it('rain affects shoe scoring', () => {
    const rainCtx = { ...baseCtx, weather: { temperature: 22, isRaining: true, windSpeed: 10 } };
    const result = engine.evaluate(rainCtx);
    const s1Rain = result.itemScores.get('s1')?.weatherScore ?? 0;
    // 帆布鞋在雨天应受惩罚
    assert.ok(s1Rain <= 70, `帆布鞋雨天应≤70，实际${s1Rain}`);
  });

  it('generates rules summary text', () => {
    const result = engine.evaluate(baseCtx);
    assert.ok(result.rulesSummary.includes('规则引擎'));
    assert.ok(result.rulesSummary.includes('commute'));
  });

  it('empty items list returns empty output gracefully', () => {
    const emptyCtx = { ...baseCtx, items: [] };
    const result = engine.evaluate(emptyCtx);
    assert.equal(result.itemScores.size, 0);
    assert.equal(result.excludedItems.length, 0);
    assert.ok(result.rulesSummary.length > 0);
  });
});
