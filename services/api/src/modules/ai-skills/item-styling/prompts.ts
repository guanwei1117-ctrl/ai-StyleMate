import { ItemStylingInput } from './item-styling.dto';
import type { AIMemoryContext } from '../../memory/memory.dto';

/**
 * 构建用户记忆上下文文本（与穿搭推荐 skill 共用逻辑，独立实现避免耦合）
 */
function buildMemoryContextText(ctx: AIMemoryContext | null | undefined): string {
  if (!ctx) return '## 用户长期记忆\n（暂无记忆数据，请按通用审美推荐）\n';

  const lines: string[] = ['## 用户长期记忆'];

  if (ctx.memorySummary) {
    lines.push(`### AI 总结\n${ctx.memorySummary}`);
  }

  const p = ctx.styleProfile as any;
  if (p) {
    const profileLines: string[] = [];
    if (p.suitableStyles?.length) profileLines.push(`适合风格：${p.suitableStyles.join('、')}`);
    if (p.likedStyles?.length) profileLines.push(`喜欢风格：${p.likedStyles.join('、')}`);
    if (p.dislikedStyles?.length) profileLines.push(`不喜欢风格：${p.dislikedStyles.join('、')}`);
    if (p.preferredColors?.length) profileLines.push(`偏好颜色：${p.preferredColors.join('、')}`);
    if (p.dislikedColors?.length) profileLines.push(`不喜欢颜色：${p.dislikedColors.join('、')}`);
    if (p.bodyType) profileLines.push(`体型：${p.bodyType}`);
    if (p.bodyConcerns?.length) profileLines.push(`身材顾虑：${p.bodyConcerns.join('、')}`);
    if (p.dressGoals?.length) profileLines.push(`穿搭目标：${p.dressGoals.join('、')}`);
    if (p.commonOccasions?.length) profileLines.push(`常见场景：${p.commonOccasions.join('、')}`);
    if (p.avoidRules?.length) {
      const avoids = p.avoidRules
        .filter((r: any) => r.weight > 0)
        .map((r: any) => r.rule);
      if (avoids.length) profileLines.push(`避坑规则：\n${avoids.map((a: string) => `  - ${a}`).join('\n')}`);
    }
    if (profileLines.length) {
      lines.push(`### 用户画像\n${profileLines.join('\n')}`);
    }
  }

  if (ctx.recentFeedbackSummary) {
    lines.push(`### 最近反馈\n${ctx.recentFeedbackSummary}`);
  }

  lines.push(
    `\n### 重要提示\n请严格遵守用户记忆中的避坑规则和不喜欢的风格/颜色。`,
  );

  return lines.join('\n') + '\n';
}

/**
 * 构建"这件怎么搭"System Prompt
 */
export function buildItemStylingPrompt(input: ItemStylingInput): string {
  const focus = input.focusItem;
  const focusJson = JSON.stringify(
    {
      id: focus.id,
      category: focus.category,
      subCategory: focus.subCategory,
      color: focus.color,
      material: focus.material,
      season: focus.season,
      styleTags: focus.styleTags,
      occasionTags: focus.occasionTags,
      formality: focus.formalityScore,
      warmth: focus.warmthScore,
      matchability: focus.matchabilityScore,
      matchColors: focus.matchColors,
      matchCategories: focus.matchCategories,
    },
    null,
    0,
  );

  const wardrobeJson = JSON.stringify(
    input.wardrobeItems.map((i) => ({
      id: i.id,
      category: i.category,
      subCategory: i.subCategory,
      color: i.color,
      material: i.material,
      season: i.season,
      styleTags: i.styleTags,
      occasionTags: i.occasionTags,
      formality: i.formalityScore,
      warmth: i.warmthScore,
      matchability: i.matchabilityScore,
      matchColors: i.matchColors,
      matchCategories: i.matchCategories,
    })),
    null,
    0,
  );

  const memoryText = buildMemoryContextText(input.memoryContext);

  return `你是 StyleMate 的专业穿搭顾问。用户想知道"这件衣服怎么搭"。

## 穿搭单品品类说明
- hat: 帽子；bag: 包；accessory: 配饰（项链、腰带、围巾等小件）
- dress（连体装）单品放入 top 槽位

${memoryText}
## 焦点单品（用户想搭配的这件）
${focusJson}

## 用户衣橱其余单品
${wardrobeJson.length > 2 ? wardrobeJson : '[]（衣橱里暂时只有这一件）'}

## 搭配要求
${input.occasion ? `场合：${input.occasion}` : '场合：不限，给出不同场景的方案更佳'}

## 任务
以焦点单品为核心，给出 3 套搭配方案（safe / flattering / vibe 各一套）：
1. safe（稳妥不出错）：焦点单品 + 最不容易出错的基础组合。
2. flattering（显瘦显高）：结合用户身材顾虑，扬长避短。
3. vibe（更有氛围感）：更有个性、更出彩的组合。

## 输出要求
- 优先使用衣橱已有单品（带 itemId），只能引用"用户衣橱其余单品"列表中的 id，不能编造。
- 若某个槽位衣橱里没有合适单品，可以给出建议购买的单品：{ "category": "...", "description": "...（颜色+品类）", "budgetHint": "¥区间" }，不带 itemId。
- 焦点单品必须出现在方案的某个槽位中（它可能适合 top/bottom/outerwear 等，由品类决定）。
- 每套方案给出 reason（为什么这样搭）、scene（适合场景）、riskWarning（风险提醒，没有则填"无"）、score（1-100）。
- 必须遵守用户记忆中的避坑规则和不喜欢的风格/颜色。

必须只返回 JSON，不要 markdown，不要任何额外文字。结构如下：
{
  "focusItemName": "白色棉质T恤",
  "note": "一句话总结这件单品的搭配要点",
  "plans": [
    {
      "type": "safe",
      "title": "基础不出错·T恤+直筒裤",
      "hat": null,
      "top": { "itemId": "uuid", "category": "top", "description": "白色棉质T恤" },
      "bottom": { "itemId": "uuid", "category": "bottom", "description": "深蓝直筒牛仔裤" },
      "outerwear": null,
      "shoes": { "itemId": "uuid", "category": "shoes", "description": "白色帆布鞋" },
      "bag": null,
      "accessory": null,
      "reason": "白T+牛仔裤是永不出错的基础公式，日常通勤都合适",
      "scene": "日常、逛街",
      "riskWarning": "无",
      "score": 85
    },
    {
      "type": "flattering",
      "title": "…",
      "hat": null, "top": null, "bottom": null, "outerwear": null, "shoes": null, "bag": null, "accessory": null,
      "reason": "…", "scene": "…", "riskWarning": "…", "score": 80
    },
    {
      "type": "vibe",
      "title": "…",
      "hat": null, "top": null, "bottom": null, "outerwear": null, "shoes": null, "bag": null, "accessory": null,
      "reason": "…", "scene": "…", "riskWarning": "…", "score": 78
    }
  ]
}`;
}
