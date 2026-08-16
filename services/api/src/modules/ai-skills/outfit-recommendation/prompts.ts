import { OutfitRecommendationInput } from './outfit-recommendation.dto';
import type { AIMemoryContext } from '../../memory/memory.dto';

/**
 * 构建用户记忆上下文文本
 *
 * 将用户长期画像、衣柜关键数据、最近反馈、当前意图、AI 总结注入 prompt
 */
function buildMemoryContextText(ctx: AIMemoryContext | null | undefined): string {
  if (!ctx) return '## 用户长期记忆\n（暂无记忆数据，请按通用审美推荐）\n';

  const lines: string[] = ['## 用户长期记忆'];

  // AI 总结记忆
  if (ctx.memorySummary) {
    lines.push(`### AI 总结\n${ctx.memorySummary}`);
  }

  // 用户长期画像
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

  // 衣柜关键数据
  if (ctx.wardrobeSummary) {
    const ws = ctx.wardrobeSummary;
    const wsLines: string[] = [`衣柜共 ${ws.totalItems} 件`];
    const catStr = Object.entries(ws.byCategory)
      .map(([k, v]) => `${k} ${v}件`)
      .join('、');
    wsLines.push(`品类分布：${catStr}`);
    if (ws.idleItems?.length) {
      wsLines.push(
        `闲置单品（>60天未穿）：${ws.idleItems.map((i) => i.description).join('、')}`,
      );
    }
    if (ws.topWorn?.length) {
      wsLines.push(
        `高频穿着：${ws.topWorn.map((i) => `${i.description}(${i.wearCount}次)`).join('、')}`,
      );
    }
    lines.push(`### 衣柜摘要\n${wsLines.join('\n')}`);
  }

  // 最近反馈
  if (ctx.recentFeedbackSummary) {
    lines.push(`### 最近反馈\n${ctx.recentFeedbackSummary}`);
  }

  // 当前意图
  if (ctx.currentIntent) {
    const ci = ctx.currentIntent as any;
    const ciLines: string[] = [];
    if (ci.lookingFor) ciLines.push(`正在寻找：${ci.lookingFor}`);
    if (ci.targetOccasion) ciLines.push(`目标场景：${ci.targetOccasion}`);
    if (ciLines.length) {
      lines.push(`### 当前意图\n${ciLines.join('\n')}`);
    }
  }

  lines.push(
    `\n### 重要提示\n请严格遵守用户记忆中的避坑规则和不喜欢的风格/颜色。如果用户多次反馈"太正式"，降低正式度组合权重；如果反馈"太显胖"，避免宽松上衣+宽松下装。`,
  );

  return lines.join('\n') + '\n';
}

/**
 * 构建穿搭推荐 System Prompt
 *
 * 将用户长期记忆 + 衣橱单品 + 天气 + 场合 + 风格目标 + 限制条件注入 prompt
 */
export function buildOutfitRecommendationPrompt(input: OutfitRecommendationInput, rulesSummary?: string): string {
  const itemsJson = JSON.stringify(
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

  const constraintsText =
    input.constraints.length > 0
      ? input.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : '无';

  const memoryText = buildMemoryContextText(input.memoryContext);

  return `你是 StyleMate 的专业穿搭顾问。用户想知道"今天穿什么"。

## 穿搭单品品类说明
- hat: 帽子（棒球帽、渔夫帽、贝雷帽等，从 hat 品类中选）
- bag: 包（托特包、斜挎包、双肩包等，从 bag 品类中选）
- accessory: 配饰（项链、戒指、腰带、围巾等小件，不是包也不是帽子）

${memoryText}
${rulesSummary ? rulesSummary + '\n' : ''}
## 今日天气
城市：${input.weather.city}
天气：${input.weather.condition}
温度：${input.weather.temperature}°C（体感 ${input.weather.apparentTemperature}°C）
风速：${input.weather.windSpeed} km/h
湿度：${input.weather.humidity}%
是否下雨：${input.weather.isRaining ? '是' : '否'}

## 穿搭要求
场合：${input.occasion}
风格目标：${input.styleGoal}
限制条件：
${constraintsText}

## 用户衣橱单品
以下是用户衣橱中所有可用衣物，你必须从这些单品中选择搭配，不能凭空编造不存在的衣物：
${itemsJson}

## 任务
基于天气、场合和风格目标，结合用户长期记忆中的偏好和避坑规则，从用户衣橱中搭配 3 套穿搭方案：

1. safe（稳妥不出错）：用百搭单品，适合大多数场景，不会出错。
2. flattering（显瘦显高）：优先选择能修饰身材比例的单品，适合想显瘦显高的日子。
3. vibe（更有氛围感）：风格更鲜明、更有个性，适合想穿得亮眼的日子。

## 输出要求
- 只能从用户衣橱单品中选 itemId，不能编造。
- 如果用户衣橱缺少某个品类（如没有鞋子），对应字段填 null。
- 每套方案都必须给出 reason（为什么适合今天）、scene（适合什么场景）、riskWarning（风险提醒）。
- score 为综合评分 1-100。
- 必须遵守用户记忆中的避坑规则和不喜欢的风格/颜色。

必须只返回 JSON，不要 markdown，不要任何额外文字。结构如下：
{
  "plans": [
    {
      "type": "safe",
      "title": "稳妥通勤·针织衫+阔腿裤",
      "hat": null,
      "top": { "itemId": "uuid", "category": "top", "description": "白色棉质T恤" },
      "bottom": { "itemId": "uuid", "category": "bottom", "description": "黑色阔腿裤" },
      "outerwear": { "itemId": "uuid", "category": "outerwear", "description": "卡其色风衣" },
      "shoes": { "itemId": "uuid", "category": "shoes", "description": "白色帆布鞋" },
      "bag": { "itemId": "uuid", "category": "bag", "description": "棕色托特包" },
      "accessory": { "itemId": "uuid", "category": "accessory", "description": "银色项链" },
      "reason": "今天 15°C 体感偏凉，针织衫保暖且通勤正式度适中，阔腿裤舒适好走",
      "scene": "办公室通勤、日常外出",
      "riskWarning": "下午风力较大，建议随身带外套",
      "score": 85
    },
    {
      "type": "flattering",
      "title": "显瘦显高·黑色高腰+短款上衣",
      "top": null,
      "bottom": null,
      "outerwear": null,
      "shoes": null,
      "accessory": null,
      "reason": "...",
      "scene": "...",
      "riskWarning": "...",
      "score": 80
    },
    {
      "type": "vibe",
      "title": "氛围感·复古叠穿",
      "top": null,
      "bottom": null,
      "outerwear": null,
      "shoes": null,
      "accessory": null,
      "reason": "...",
      "scene": "...",
      "riskWarning": "...",
      "score": 78
    }
  ]
}`;
}
