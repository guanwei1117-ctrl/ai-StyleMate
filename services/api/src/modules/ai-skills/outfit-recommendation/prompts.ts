import { OutfitRecommendationInput } from './outfit-recommendation.dto';

/**
 * 构建穿搭推荐 System Prompt
 *
 * 将衣橱单品、天气、场合、风格目标、限制条件注入 prompt
 */
export function buildOutfitRecommendationPrompt(input: OutfitRecommendationInput): string {
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

  return `你是 StyleMate 的专业穿搭顾问。用户想知道"今天穿什么"。

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
基于天气、场合和风格目标，从用户衣橱中搭配 3 套穿搭方案：

1. safe（稳妥不出错）：用百搭单品，适合大多数场景，不会出错。
2. flattering（显瘦显高）：优先选择能修饰身材比例的单品，适合想显瘦显高的日子。
3. vibe（更有氛围感）：风格更鲜明、更有个性，适合想穿得亮眼的日子。

## 输出要求
- 只能从用户衣橱单品中选 itemId，不能编造。
- 如果用户衣橱缺少某个品类（如没有鞋子），对应字段填 null。
- 每套方案都必须给出 reason（为什么适合今天）、scene（适合什么场景）、riskWarning（风险提醒）。
- score 为综合评分 1-100。

必须只返回 JSON，不要 markdown，不要任何额外文字。结构如下：
{
  "plans": [
    {
      "type": "safe",
      "title": "稳妥通勤·针织衫+阔腿裤",
      "top": { "itemId": "uuid", "category": "top", "description": "白色棉质T恤" },
      "bottom": { "itemId": "uuid", "category": "bottom", "description": "黑色阔腿裤" },
      "outerwear": { "itemId": "uuid", "category": "outerwear", "description": "卡其色风衣" },
      "shoes": { "itemId": "uuid", "category": "shoes", "description": "白色帆布鞋" },
      "accessory": { "itemId": "uuid", "category": "accessory", "description": "黑色托特包" },
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
