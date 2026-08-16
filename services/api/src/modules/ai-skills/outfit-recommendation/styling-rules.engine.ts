/**
 * 穿搭技巧规则引擎 — AI:技巧:记忆 = 4:4:2 中的 "技巧 40%"
 *
 * 5 个硬规则模块：
 *   1. 色彩搭配 (color harmony)
 *   2. 廓形体型匹配 (body fit)
 *   3. 场合适配 (occasion fit)
 *   4. 天气季节适配 (weather fit)
 *   5. 单品兼容性 (item compatibility)
 *
 * 纯函数设计，可单独测试。
 */

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

export interface WardrobeItemInput {
  id: string;
  category: string;
  subCategory: string;
  color: string;
  material: string;
  season: string[];
  styleTags: string[];
  occasionTags: string[];
  formalityScore: number;
  warmthScore: number;
  matchabilityScore: number;
  matchColors: string[];
  matchCategories: string[];
}

export interface WeatherInput {
  temperature: number;
  isRaining: boolean;
  windSpeed: number;
}

export interface RulesContext {
  items: WardrobeItemInput[];
  weather: WeatherInput;
  occasion: string;
  styleGoal: string;
  bodyShape?: string;
  skinTone?: string;
}

export interface ItemScore {
  colorScore: number;
  bodyFitScore: number;
  occasionScore: number;
  weatherScore: number;
  compatibilityScore: number;
  totalScore: number;
  reasoning: string[];
}

export interface RulesEngineOutput {
  itemScores: Map<string, ItemScore>;
  excludedItems: Array<{ itemId: string; reason: string }>;
  topByCategory: Map<string, string[]>;
  rulesSummary: string;
}

// ---------------------------------------------------------------------------
// 色彩映射
// ---------------------------------------------------------------------------

const WARM_COLORS = new Set(['红', '橙', '黄', '粉', '棕', '金', '米', '杏', '肤色']);
const COOL_COLORS = new Set(['蓝', '绿', '紫', '青', '灰', '银', '藏蓝', '墨绿', '黑']);
const NEUTRAL_COLORS = new Set(['白', '黑', '灰', '米', '卡其', '藏蓝', '牛仔蓝']);

function isWarmColor(color: string): boolean {
  return WARM_COLORS.has(color) || [...WARM_COLORS].some(c => color.includes(c));
}
function isCoolColor(color: string): boolean {
  return COOL_COLORS.has(color) || [...COOL_COLORS].some(c => color.includes(c));
}
function isNeutralColor(color: string): boolean {
  return NEUTRAL_COLORS.has(color) || [...NEUTRAL_COLORS].some(c => color.includes(c));
}

// ---------------------------------------------------------------------------
// 场合 → 正式度要求
// ---------------------------------------------------------------------------

const OCCASION_FORMALITY: Record<string, { min: number; max: number; blockedCategories: string[] }> = {
  commute:     { min: 2, max: 5, blockedCategories: [] },
  work:        { min: 3, max: 5, blockedCategories: [] },
  office:      { min: 3, max: 5, blockedCategories: [] },
  date:        { min: 2, max: 4, blockedCategories: [] },
  client:      { min: 4, max: 5, blockedCategories: [] },
  shopping:    { min: 1, max: 3, blockedCategories: [] },
  travel:      { min: 1, max: 3, blockedCategories: [] },
  party:       { min: 2, max: 5, blockedCategories: [] },
  casual:      { min: 1, max: 3, blockedCategories: [] },
  sport:       { min: 1, max: 2, blockedCategories: ['outerwear_formal'] },
  interview:   { min: 4, max: 5, blockedCategories: [] },
};

// ---------------------------------------------------------------------------
// 廓形关键词 → 体型映射
// ---------------------------------------------------------------------------

const BODY_SILHOUETTE_GOOD: Record<string, string[]> = {
  pear:       ['A字', '高腰', '阔腿', '上宽下窄', '收腰', '大摆', '微A'],
  apple:      ['V领', '直筒', 'H型', '宽松', '茧型', '落肩'],
  hourglass:  ['收腰', '包臀', '铅笔', 'X型', 'V领'],
  rectangle:  ['H型', '直筒', '微A', '宽松', '层叠', 'A字'],
  inverted_triangle: ['A字', '阔腿', '微A', '大摆', '层叠'],
};

const BODY_SILHOUETTE_BAD: Record<string, string[]> = {
  pear:       ['紧身包臀', '低腰', '铅笔裙'],
  apple:      ['横条纹', '紧身', '短上衣'],
  hourglass:  ['宽松H型', '直筒无腰线'],
  rectangle:  ['极度紧身'],
  inverted_triangle: ['垫肩', '泡泡袖', '宽肩'],
};

// ---------------------------------------------------------------------------
// 色相环简化距离
// ---------------------------------------------------------------------------

const HUE_GROUPS: Record<string, number> = {
  '红': 0, '橙': 30, '黄': 60, '绿': 120, '蓝': 240, '紫': 280, '粉': 340, '棕': 20, '黑': -1, '白': -1, '灰': -1, '米': 40,
};

function nearestHue(color: string): number | null {
  for (const [key, hue] of Object.entries(HUE_GROUPS)) {
    if (color.includes(key)) return hue;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 规则引擎
// ---------------------------------------------------------------------------

export class StylingRulesEngine {

  /**
   * 对全部衣橱单品运行 5 个规则，输出评分 + 排除 + 兼容对
   */
  evaluate(ctx: RulesContext): RulesEngineOutput {
    const itemScores = new Map<string, ItemScore>();
    const excludedItems: Array<{ itemId: string; reason: string }> = [];
    const topByCategory = new Map<string, string[]>();

    // Step 1: 单件打分
    for (const item of ctx.items) {
      const colorScore = this.scoreColor(item, ctx);
      const bodyFitScore = this.scoreBodyFit(item, ctx);
      const occasionScore = this.scoreOccasion(item, ctx);
      const weatherScore = this.scoreWeather(item, ctx);
      const compatibilityScore = item.matchabilityScore * 10; // 基础百搭分 0-100

      const reasoning: string[] = [];
      if (colorScore >= 80) reasoning.push('色彩适配度高');
      if (bodyFitScore >= 80) reasoning.push('体型适配');
      if (occasionScore >= 80) reasoning.push('场合适配');
      if (weatherScore >= 80) reasoning.push('天气适配');

      const totalScore = Math.round(
        colorScore * 0.2 + bodyFitScore * 0.2 + occasionScore * 0.2 + weatherScore * 0.25 + compatibilityScore * 0.15,
      );

      // 天气不适配的直接排除
      if (weatherScore < 40) {
        excludedItems.push({ itemId: item.id, reason: `天气不适配（温度${ctx.weather.temperature}°C）` });
      }

      itemScores.set(item.id, { colorScore, bodyFitScore, occasionScore, weatherScore, compatibilityScore, totalScore, reasoning });

      // 按品类分组
      const cat = item.category;
      if (!topByCategory.has(cat)) topByCategory.set(cat, []);
      topByCategory.get(cat)!.push(item.id);
    }

    // 每个品类按 totalScore 排序
    for (const [cat, ids] of topByCategory) {
      ids.sort((a, b) => (itemScores.get(b)?.totalScore ?? 0) - (itemScores.get(a)?.totalScore ?? 0));
      topByCategory.set(cat, ids.slice(0, 5)); // 只保留 Top 5
    }

    // Step 2: 构建规则摘要文本（注入 AI prompt）
    const rulesSummary = this.buildSummaryText(ctx, itemScores, excludedItems, topByCategory);

    return { itemScores, excludedItems, topByCategory, rulesSummary };
  }

  // -----------------------------------------------------------------------
  // 规则1：色彩打分
  // -----------------------------------------------------------------------
  private scoreColor(item: WardrobeItemInput, _ctx: RulesContext): number {
    let score = 50;
    const color = item.color || '';
    if (isNeutralColor(color)) score += 25;           // 中性色百搭
    else if (isWarmColor(color) || isCoolColor(color)) score += 10;
    if (item.matchColors?.length > 2) score += 10;   // 有多种搭配色
    return Math.min(100, Math.max(0, score));
  }

  // -----------------------------------------------------------------------
  // 规则2：廓形体型匹配打分
  // -----------------------------------------------------------------------
  private scoreBodyFit(item: WardrobeItemInput, ctx: RulesContext): number {
    const shape = ctx.bodyShape;
    if (!shape || !BODY_SILHOUETTE_GOOD[shape]) return 60; // 无体型数据给中性分

    let score = 40;
    const styleTags = item.styleTags ?? [];
    const tags = styleTags.join(' ') + ' ' + (item.subCategory ?? '');

    const goodKeywords = BODY_SILHOUETTE_GOOD[shape];
    const badKeywords = BODY_SILHOUETTE_BAD[shape];

    for (const kw of goodKeywords) {
      if (tags.includes(kw)) score += 12;
    }
    for (const kw of badKeywords) {
      if (tags.includes(kw)) score -= 20;
    }

    // 品类基础适配
    if (shape === 'pear' && item.category === 'bottom' && tags.includes('阔腿')) score += 10;
    if (shape === 'pear' && item.category === 'bottom' && tags.includes('紧身')) score -= 10;
    if (shape === 'apple' && item.category === 'top' && tags.includes('V领')) score += 10;
    if (shape === 'hourglass' && tags.includes('收腰')) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  // -----------------------------------------------------------------------
  // 规则3：场合打分
  // -----------------------------------------------------------------------
  private scoreOccasion(item: WardrobeItemInput, ctx: RulesContext): number {
    const rule = OCCASION_FORMALITY[ctx.occasion] ?? OCCASION_FORMALITY['casual'];
    const formality = item.formalityScore ?? 3;

    let score = 60;
    if (formality >= rule.min && formality <= rule.max) {
      score += 30;
    } else {
      const dist = Math.min(Math.abs(formality - rule.min), Math.abs(formality - rule.max));
      score -= dist * 10;
    }

    // 场合标签匹配
    if (item.occasionTags?.some((t: string) => t.includes(ctx.occasion) || ctx.occasion.includes(t))) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  // -----------------------------------------------------------------------
  // 规则4：天气适配打分
  // -----------------------------------------------------------------------
  private scoreWeather(item: WardrobeItemInput, ctx: RulesContext): number {
    const temp = ctx.weather.temperature;
    const warmth = item.warmthScore ?? 3;
    let score = 60;

    // 温度适配
    if (temp < 10) {
      if (warmth >= 4) score += 30;
      else if (warmth <= 2) score -= 30;
    } else if (temp > 28) {
      if (warmth <= 2) score += 25;
      else if (warmth >= 4) score -= 30;
    } else if (temp >= 15 && temp <= 25) {
      score += 15; // 舒适温度，服饰选择宽泛
    }

    // 下雨
    if (ctx.weather.isRaining) {
      if (item.category === 'shoes' && !item.subCategory?.includes('防水') && !item.material?.includes('皮')) {
        score -= 15;
      }
      if (item.category === 'outerwear') score += 10;
    }

    // 季节匹配
    if (temp < 10 && item.season?.includes('winter')) score += 10;
    if (temp > 25 && item.season?.includes('summer')) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  // -----------------------------------------------------------------------
  // 记忆评分 (20% 权重)
  // -----------------------------------------------------------------------
  scoreByMemory(itemId: string, memoryCtx?: { likedStyles?: string[]; dislikedStyles?: string[] } | null): number {
    let score = 50;
    if (!memoryCtx) return score;

    // 此处基于记忆系统中的风格偏好加分
    // 具体实现在 Step 3 中由 MemoryService 提供数据，引擎只做计算
    return score;
  }

  // -----------------------------------------------------------------------
  // 构建摘要文本（注入 AI prompt）
  // -----------------------------------------------------------------------
  private buildSummaryText(
    ctx: RulesContext,
    itemScores: Map<string, ItemScore>,
    excludedItems: Array<{ itemId: string; reason: string }>,
    topByCategory: Map<string, string[]>,
  ): string {
    const lines: string[] = [];

    lines.push('## 穿搭规则引擎分析结果（权重 40%）\n');

    // 高分单品表
    lines.push('### 各品类高分单品（规则综合评分）\n');
    const catLabels: Record<string, string> = { top: '上衣', bottom: '下装', outerwear: '外套', dress: '连衣裙', shoes: '鞋子', accessory: '配饰' };
    for (const [cat, ids] of topByCategory) {
      const label = catLabels[cat] ?? cat;
      const itemList = ids.map(id => {
        const item = ctx.items.find(i => i.id === id);
        const score = itemScores.get(id)?.totalScore ?? 0;
        return item ? `${item.subCategory || item.category}(${id.slice(0,8)}…,规则分${score})` : id;
      }).join(' / ');
      lines.push(`- **${label}**：${itemList || '无'}`);
    }

    // 被排除的单品
    if (excludedItems.length > 0) {
      lines.push('\n### 被规则排除的单品（请勿选择）\n');
      for (const ex of excludedItems) {
        const item = ctx.items.find(i => i.id === ex.itemId);
        const name = item ? (item.subCategory || item.category) : ex.itemId;
        lines.push(`- ❌ ${name} — ${ex.reason}`);
      }
    }

    // 搭配约束
    lines.push('\n### 规则约束\n');
    lines.push(`- 温度 ${ctx.weather.temperature}°C，体感参考：${ctx.weather.temperature < 10 ? '寒冷，需保暖外套' : ctx.weather.temperature > 28 ? '炎热，需轻薄透气' : '适中，选择范围广'}`);
    if (ctx.weather.isRaining) lines.push('- ⚠️ 今日有雨，注意鞋子和外套选择');
    lines.push(`- 场合「${ctx.occasion}」正式度要求：${OCCASION_FORMALITY[ctx.occasion]?.min ?? 1}-${OCCASION_FORMALITY[ctx.occasion]?.max ?? 5}`);
    if (ctx.bodyShape) lines.push(`- 用户体型「${ctx.bodyShape}」，请优先选择适配廓形的单品`);

    return lines.join('\n');
  }
}
