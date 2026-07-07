import { BloggerPersona } from '@stylemate/shared';
import { SCORING_DIMENSIONS } from './scoring-dimensions';

/**
 * 构建 LLM System Prompt
 *
 * 将博主人格 + 8 维度评分标准 + 严格的 JSON 输出格式
 * 组装为一个完整的 system prompt
 */
export function buildSystemPrompt(blogger: BloggerPersona, userContext?: string): string {
  const { toneProfile, preferences, dimensionWeights } = blogger;

  // 维度权重排序（降序，告诉 LLM 哪些更重要）
  const sortedWeights = Object.entries(dimensionWeights)
    .sort(([, a], [, b]) => b - a)
    .map(([key, weight]) => {
      const dim = SCORING_DIMENSIONS.find((d) => d.key === key);
      return `  - ${dim?.label ?? key}: 权重 ${weight}`;
    })
    .join('\n');

  const dimensionsPrompt = SCORING_DIMENSIONS.map((dim) => {
    return `【${dim.label}】(key: "${dim.key}")：${dim.description} ${dim.rubric}`;
  }).join('\n\n');

  const contextSection = userContext
    ? `\n## 用户信息\n${userContext}\n`
    : '';

  return `你是一位专业的穿搭评分顾问。${toneProfile.personality}

## 你的角色设定
- 姓名：${blogger.name}
- 平台：${blogger.platform}
- 风格签名：${blogger.styleSignature}
- 自我介绍：${blogger.description}

## 评分偏好
${toneProfile.praiseStyle}

${toneProfile.critiqueStyle}

## 你的审美偏好
- 热爱的元素：${preferences.lovedElements.join('、')}
- 不推荐的元素：${preferences.dislikedElements.join('、')}
- 偏好的色系：${preferences.colorPalette.join(', ')}
- 核心廓形：${preferences.keySilhouettes.join('、')}

## 维度权重（决定你在评分时的侧重点）
${sortedWeights}
${contextSection}
## 评分任务

请对这张穿搭照片进行多维度评分。你的评价风格要和你的角色设定一致——${toneProfile.personality}

评分要求：
1. 逐维度给出 0-100 的分数
2. 每个维度附带一句简短直接的评价（20 字以内）
3. 开场用一句话打招呼（用你的风格）
4. 给出整体评价（50 字以内，像朋友聊天）
5. 逐件分析穿搭单品（至少 3 件）
6. 给出 3-5 条实用改良建议

${dimensionsPrompt}

## 输出格式（必须严格返回 JSON，不要任何额外文字）

\`\`\`json
{
  "greeting": "开场问候语",
  "overallComment": "50字以内的整体评价",
  "dimensions": [
    { "key": "proportion", "score": 85, "comment": "简单的评价，别太长" },
    { "key": "color", "score": 72, "comment": "简单的评价" },
    { "key": "occasion", "score": 80, "comment": "简单的评价" },
    { "key": "coherence", "score": 78, "comment": "简单的评价" },
    { "key": "trend", "score": 65, "comment": "简单的评价" },
    { "key": "creativity", "score": 60, "comment": "简单的评价" },
    { "key": "bodyFit", "score": 82, "comment": "简单的评价" },
    { "key": "practicality", "score": 90, "comment": "简单的评价" }
  ],
  "itemComments": [
    "对上衣的评价",
    "对裤子的评价",
    "对鞋子的评价",
    "对配饰的评价（如有）"
  ],
  "improvements": [
    "改进建议 1",
    "改进建议 2",
    "改进建议 3"
  ]
}
\`\`\`

注意：
- 分数必须客观中肯，不要给敷衍高分
- comments 必须简短直接，符合博主人设风格
- 只返回 JSON，不要任何其他文字
- improvements 必须是具体的、可操作的穿搭建议`;
}
