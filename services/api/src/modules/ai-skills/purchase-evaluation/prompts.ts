import { PurchaseEvaluationInput } from './purchase-evaluation.dto';
import type { AIMemoryContext } from '../../memory/memory.dto';

/**
 * 构建用户记忆上下文文本（买前判断专用）
 */
function buildMemoryContextText(ctx: AIMemoryContext | null | undefined): string {
  if (!ctx) return '## 用户长期记忆\n（暂无记忆数据）\n';

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

  if (ctx.currentIntent) {
    const ci = ctx.currentIntent as any;
    const ciLines: string[] = [];
    if (ci.lookingFor) ciLines.push(`正在寻找：${ci.lookingFor}`);
    if (ci.targetOccasion) ciLines.push(`目标场景：${ci.targetOccasion}`);
    if (ci.budgetRange?.max) ciLines.push(`预算上限：${ci.budgetRange.max}元`);
    if (ciLines.length) {
      lines.push(`### 当前意图\n${ciLines.join('\n')}`);
    }
  }

  lines.push(
    `\n### 重要提示\n请根据用户记忆判断：如果商品属于用户不喜欢的颜色/风格，或违反避坑规则，应降低评分。如果商品正好匹配用户当前意图（正在寻找的品类），应提高评分。`,
  );

  return lines.join('\n') + '\n';
}

/**
 * 构建买前判断 System Prompt
 *
 * 将商品图片信息 + 用户衣橱数据 + 用户画像 + 长期记忆注入 prompt
 */
export function buildPurchaseEvaluationPrompt(input: PurchaseEvaluationInput): string {
  const itemsJson = JSON.stringify(
    input.wardrobeItems.map((i) => ({
      id: i.id,
      category: i.category,
      subCategory: i.subCategory,
      color: i.color,
      pattern: i.pattern,
      material: i.material,
      season: i.season,
      styleTags: i.styleTags,
      occasionTags: i.occasionTags,
      formalityScore: i.formalityScore,
      warmthScore: i.warmthScore,
      matchabilityScore: i.matchabilityScore,
      matchColors: i.matchColors,
      matchCategories: i.matchCategories,
      wearCount: i.wearCount,
      lastWornAt: i.lastWornAt,
    })),
    null,
    0,
  );

  const profileText = input.userProfile
    ? `## 用户基础画像
体型：${input.userProfile.bodyShape ?? '未知'}
风格偏好：${input.userProfile.stylePreferences?.join('、') ?? '未知'}
穿衣目标：${input.userProfile.dressingGoals?.join('、') ?? '未知'}`
    : '## 用户基础画像\n（无）';

  const memoryText = buildMemoryContextText(input.memoryContext);

  return `你是 StyleMate 的专业买前顾问。用户上传了一件商品的图片，想判断是否值得购买。

你的任务不是简单回答"好看不好看"，而是要结合用户已有衣橱和长期记忆进行深度分析。

${memoryText}
## 用户衣橱单品
以下是用户衣橱中已有的衣物数据（含穿着次数和最后穿着时间）：
${itemsJson}

${profileText}

## 你需要判断的 9 个维度

1. **风格适配**：这件商品是否适合用户的个人风格？
2. **身材适配**：这件商品是否适合用户的身材特点（体型、身高）？
3. **重复风险**：用户衣橱里是否有类似单品？颜色、品类、风格是否重复？
4. **搭配可能性**：能否和用户已有的衣服搭配？
5. **可搭套数**：大约可以搭出几套已有衣柜的组合？
6. **颜色选择**：如果有多色可选，哪个颜色更适合用户？
7. **闲置风险**：这件衣服是否容易闲置（太挑场合、太个性、难搭配等）？
8. **不建议原因**：如果有不建议购买的理由，明确列出。
9. **品类补充**：用户衣橱是否更缺某个品类？是否建议把钱花在其他品类上？

## 分析原则
- 穿着次数低、长期未穿的单品说明用户不太喜欢那个品类或风格，要留意。
- 优先考虑百搭、利用率高的单品。
- 如果用户已有类似单品（同色系、同品类、同风格），标记为重复风险高。
- 颜色选择上，结合用户肤色和已有衣橱色系推荐。
- 给出具体的搭配建议：这件可以搭用户衣橱里的哪几件，组成什么风格的穿搭。
- 必须遵守用户记忆中的避坑规则和不喜欢的颜色/风格。

## 输出要求
必须只返回 JSON，不要 markdown，不要任何额外文字。结构如下：
{
  "decision": "buy" | "consider" | "skip",
  "score": 82,
  "reasons": [
    "黑色百搭，和你已有的牛仔裤、灰色半裙都能搭",
    "风格偏简约，符合你日常通勤的需求"
  ],
  "matchedWardrobeItems": [
    { "id": "uuid", "name": "蓝色直筒牛仔裤", "reason": "黑色上衣+蓝色牛仔裤是经典搭配" },
    { "id": "uuid", "name": "米色西装外套", "reason": "内搭这件+米色西装，通勤感很强" }
  ],
  "possibleOutfits": [
    "这件+蓝色牛仔裤+白色帆布鞋 = 休闲日常",
    "这件+灰色半裙+米色西装 = 通勤知性",
    "这件+黑色阔腿裤+乐福鞋 = 简约高级"
  ],
  "duplicateRisk": "low" | "medium" | "high",
  "idleRisk": "low" | "medium" | "high",
  "betterColors": ["黑色", "深蓝"],
  "recommendedCategory": "下装",
  "skipReasons": [
    "你衣柜里已有 3 件相似浅色上衣，粉色这件容易重复",
    "这个版型对梨形身材不太友好，容易显胯宽"
  ]
}

注意：
- decision 取 "buy"（推荐买）、"consider"（可以考虑，但有顾虑）、"skip"（不建议买）之一。
- score 为 0-100 综合评分。
- matchedWardrobeItems 中 id 必须是用户衣橱中真实存在的 id。
- possibleOutfits 每套用 "=" 分隔穿搭描述和风格标签。
- duplicateRisk 和 idleRisk 为 "low"、"medium"、"high" 之一。
- betterColors 如果商品只有一种颜色或颜色已最佳，返回空数组。
- recommendedCategory 如果用户衣橱不缺品类，返回 null。
- skipReasons 当 decision 为 "skip" 或 "consider" 时必须提供，为 "buy" 时可为空数组。`;
}
