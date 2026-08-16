import { WardrobeGapInput } from './wardrobe-gap.dto';
import type { AIMemoryContext } from '../../memory/memory.dto';

/**
 * 构建用户记忆上下文文本（衣橱缺口分析专用）
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
    if (p.dressGoals?.length) profileLines.push(`穿搭目标：${p.dressGoals.join('、')}`);
    if (p.commonOccasions?.length) profileLines.push(`常见场景：${p.commonOccasions.join('、')}`);
    if (p.avoidRules?.length) {
      const avoids = p.avoidRules
        .filter((r: any) => r.weight > 0)
        .map((r: any) => r.rule);
      if (avoids.length) profileLines.push(`避坑规则：${avoids.join('；')}`);
    }
    if (profileLines.length) {
      lines.push(`### 用户画像\n${profileLines.join('\n')}`);
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * 构建衣橱缺口分析 System Prompt
 */
export function buildWardrobeGapPrompt(input: WardrobeGapInput): string {
  const itemsJson = JSON.stringify(
    input.wardrobeItems.map((i) => ({
      id: i.id,
      category: i.category,
      subCategory: i.subCategory,
      color: i.color,
      season: i.season,
      styleTags: i.styleTags,
      occasionTags: i.occasionTags,
      formality: i.formalityScore,
      warmth: i.warmthScore,
      matchability: i.matchabilityScore,
    })),
    null,
    0,
  );

  const memoryText = buildMemoryContextText(input.memoryContext);

  return `你是 StyleMate 的专业衣橱规划师。用户想知道"我的衣橱缺什么、该先买什么"。

${memoryText}
## 当前季节
${input.season}
${input.budgetLevel ? `## 预算档位\n${input.budgetLevel}\n` : ''}
## 用户衣橱现有单品
${itemsJson.length > 2 ? itemsJson : '[]（衣橱是空的，所有基础品类都值得补充）'}

## 分析任务
基于用户衣橱现状 + 长期记忆（风格偏好/身材顾虑/常见场景/避坑规则）+ 当前季节，找出最值得补充的品类缺口：

1. 判断每个品类的数量是否足以支撑日常穿搭轮换（结合用户的常见场景）。
2. 给出每个缺口的优先级：1=先买（最影响日常穿搭），2=其次，3=可缓。
3. 每条缺口给出具体建议：二级子类、颜色、风格标签、预算区间（参考用户预算档位）。

## 输出要求
- 品类取值：top / outerwear / bottom / dress / shoes / bag / hat / accessory。
- 最多输出 5 条缺口，按优先级从高到低排序，没有明显缺口就少列。
- 颜色建议必须避开用户不喜欢的颜色，贴合偏好颜色。
- budgetRange 格式如 "¥200-400"，预算档位为 budget 时整体偏低、premium 时偏高。
- 只返回 JSON，不要 markdown，不要任何额外文字。结构如下：
{
  "summary": "一句话总结衣橱现状和最该补的品类",
  "gaps": [
    {
      "category": "outerwear",
      "current": 0,
      "recommended": 2,
      "missing": 2,
      "priority": 1,
      "reason": "冬天没有外套，通勤场景无法搭配完整造型",
      "suggestion": {
        "subCategory": "大衣",
        "color": "驼色",
        "styleTags": ["通勤", "简约"],
        "budgetRange": "¥400-800"
      }
    }
  ]
}`;
}
