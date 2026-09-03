import { OutfitRecommendationInput } from './outfit-recommendation.dto';
import type { AIMemoryContext, MemorySnapshot } from '../../memory/memory.dto';

/**
 * 构建用户记忆上下文文本
 *
 * 核心优化：只读取预压缩的 MemorySnapshot，不再读取原始数据。
 * 将用户偏好、避坑规则、AI 总结等压缩为 150 字以内的精简摘要，
 * 大幅减少 token 消耗。
 */
function buildMemoryContextText(ctx: AIMemoryContext | null | undefined): string {
  if (!ctx?.snapshot) return '## 用户长期记忆\n（暂无记忆数据，请按通用审美推荐）\n';

  const s = ctx.snapshot;
  const lines: string[] = ['## 用户长期记忆'];

  // AI 总结（核心摘要）
  if (s.summary) {
    lines.push(`### AI 总结\n${s.summary}`);
  }

  // 偏好（仅输出非空字段）
  const prefs: string[] = [];
  if (s.likedStyles.length) prefs.push(`喜欢风格：${s.likedStyles.join('、')}`);
  if (s.dislikedStyles.length) prefs.push(`避开风格：${s.dislikedStyles.join('、')}`);
  if (s.preferredColors.length) prefs.push(`偏好颜色：${s.preferredColors.join('、')}`);
  if (s.dislikedColors.length) prefs.push(`避开颜色：${s.dislikedColors.join('、')}`);
  if (s.dressGoals.length) prefs.push(`穿搭目标：${s.dressGoals.join('、')}`);
  if (s.bodyConcerns.length) prefs.push(`身材顾虑：${s.bodyConcerns.join('、')}`);
  if (prefs.length) {
    lines.push(`### 偏好\n${prefs.join('\n')}`);
  }

  // 避坑规则（高权重优先）
  if (s.avoidRules.length) {
    lines.push(`### 避坑规则\n${s.avoidRules.map((r: string) => `  - ${r}`).join('\n')}`);
  }

  // 当前意图
  if (s.currentIntent) {
    lines.push(`### 当前意图\n正在寻找：${s.currentIntent}`);
  }

  lines.push(
    `\n### 重要提示\n请严格遵守避坑规则和避开风格/颜色。优先推荐用户喜欢的风格和颜色。`,
  );

  return lines.join('\n') + '\n';
}

/**
 * 构建空衣橱起步方案 System Prompt
 *
 * 用户衣橱为空时使用：所有单品都是"建议购买"，帮助不会穿搭/不会买的新手直接照着买照着穿。
 * 输出 JSON 结构与常规推荐一致，但每个 item 不带 itemId，而是带 budgetHint。
 */
export function buildStarterOutfitPrompt(input: OutfitRecommendationInput): string {
  const memoryText = buildMemoryContextText(input.memoryContext);

  const constraintsText =
    input.constraints.length > 0
      ? input.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : '无';

  return `你是 StyleMate 的专业穿搭顾问。用户衣橱还是空的，想知道"今天穿什么、以及照着买什么"。

${memoryText}
## 今日天气
城市：${input.weather.city}
天气：${input.weather.condition}
温度：${input.weather.temperature}°C（体感 ${input.weather.apparentTemperature}°C）
是否下雨：${input.weather.isRaining ? '是' : '否'}

## 穿搭要求
场合：${input.occasion}
风格目标：${input.styleGoal}
限制条件：
${constraintsText}

## 任务
用户衣橱为空，请给出 3 套"照着买就能穿"的起步方案（safe / flattering / vibe 各一套）。
每套方案用建议购买的单品填满 hat/top/bottom/outerwear/shoes/bag/accessory 槽位（没有需要的槽位填 null）。

## 输出要求
- 每个单品对象字段：{ "category": "品类", "description": "具体描述（颜色+品类，如 米白色针织开衫）", "budgetHint": "建议预算区间（如 ¥150-300）" }，不要 itemId。
- 品类取值：top / outerwear / bottom / dress / shoes / bag / hat / accessory（dress 连体装放 top 槽）。
- 单品建议要具体、可执行、符合中国大众消费价位，预算档位参考用户记忆（若有预算信息务必遵守）。
- 必须遵守用户记忆中的避坑规则、不喜欢风格/颜色、身材顾虑。
- 每套方案给出 reason（为什么适合今天）、scene（适合什么场景）、riskWarning（风险提醒，没有则填"无"）、score（1-100）。
- 只返回 JSON，不要 markdown，不要任何额外文字。结构如下：
{
  "plans": [
    {
      "type": "safe",
      "title": "稳妥起步·针织衫+直筒裤",
      "hat": null,
      "top": { "category": "top", "description": "米白色圆领针织衫", "budgetHint": "¥150-300" },
      "bottom": { "category": "bottom", "description": "黑色高腰直筒裤", "budgetHint": "¥200-400" },
      "outerwear": { "category": "outerwear", "description": "卡其色短款风衣", "budgetHint": "¥300-600" },
      "shoes": { "category": "shoes", "description": "白色厚底帆布鞋", "budgetHint": "¥150-300" },
      "bag": { "category": "bag", "description": "棕色单肩托特包", "budgetHint": "¥200-500" },
      "accessory": null,
      "reason": "针织衫+直筒裤是零出错的基础组合，适合通勤与日常",
      "scene": "办公室通勤、周末逛街",
      "riskWarning": "无",
      "score": 85
    },
    { "type": "flattering", "title": "…", "hat": null, "top": null, "bottom": null, "outerwear": null, "shoes": null, "bag": null, "accessory": null, "reason": "…", "scene": "…", "riskWarning": "…", "score": 80 },
    { "type": "vibe", "title": "…", "hat": null, "top": null, "bottom": null, "outerwear": null, "shoes": null, "bag": null, "accessory": null, "reason": "…", "scene": "…", "riskWarning": "…", "score": 78 }
  ]
}`;
}
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
