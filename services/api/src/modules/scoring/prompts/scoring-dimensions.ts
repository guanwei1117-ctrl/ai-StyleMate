import { ScoringDimension, ScoringDimensionKey } from '@stylemate/shared';

/**
 * 8 维评分标准定义
 *
 * 每个维度包含：
 * - key: 维度键名
 * - label: 中文名称
 * - description: 一句话描述
 * - rubric: 满分标准（供 LLM 评估参考）
 */
export const SCORING_DIMENSIONS: ScoringDimension[] = [
  {
    key: 'proportion' as ScoringDimensionKey,
    label: '比例与廓形',
    description: '上下身比例是否协调，外轮廓是否利落有型',
    maxScore: 100,
    rubric:
      '满分标准（100分）：上下身比例接近黄金分割，廓形清晰有结构感，不拖沓不臃肿。每件单品长度/宽度恰到好处，叠穿时有层次但不累赘。常见扣分项：裤子过长堆在鞋面、上衣过长压个子、内外层廓形冲突。',
  },
  {
    key: 'color' as ScoringDimensionKey,
    label: '色彩协调',
    description: '配色是否高级和谐，是否考虑肤色适配',
    maxScore: 100,
    rubric:
      '满分标准（100分）：整体配色≤4种主色，有明确的色彩策略（同色系/对比色/点缀色）。冷暖色调统一，不与肤色冲突。有视觉焦点但不刺眼。常见扣分项：颜色过多过杂、冷暖色调混搭违和、亮色面积过大缺乏平衡。',
  },
  {
    key: 'occasion' as ScoringDimensionKey,
    label: '场合适配',
    description: '穿搭是否匹配目标场景（通勤/约会/校园/出游等）',
    maxScore: 100,
    rubric:
      '满分标准（100分）：完全匹配指定场合的着装要求。通勤=得体不随意，约会=用心不过度，校园=轻松有风格，出游=舒适有亮点。没有用力过猛或过于随便的问题。常见扣分项：运动装配皮鞋、西装配拖鞋、去海边穿高领毛衣。',
  },
  {
    key: 'coherence' as ScoringDimensionKey,
    label: '风格一致性',
    description: '全身单品是否属于同一审美体系，风格不打架',
    maxScore: 100,
    rubric:
      '满分标准（100分）：每件单品风格统一，形成完整的审美表达。比如街头风就全部偏街头，不会出现上半身极简、下半身解构的割裂感。混搭可以有，但是有意为之而非随意拼凑。常见扣分项：运动鞋+西装裤+民族风上衣三不像。',
  },
  {
    key: 'trend' as ScoringDimensionKey,
    label: '潮流度',
    description: '是否体现当下流行元素，是否有时尚敏感度',
    maxScore: 100,
    rubric:
      '满分标准（100分）：包含 1-2 个当季流行元素（廓形/色彩/材质/单品），但不过度堆砌，保持个人风格主线。潮流元素作为点睛而非主角。常见扣分项：完全与当下审美脱节（如 2015 年的紧身小脚裤）、全身堆砌 5+ 个流行元素像走秀。',
  },
  {
    key: 'creativity' as ScoringDimensionKey,
    label: '创意度',
    description: '有没有让人眼前一亮的搭配巧思',
    maxScore: 100,
    rubric:
      '满分标准（100分）：有 1-2 个令人惊喜的搭配巧思。比如：丝巾当腰带、色彩出人意料但和谐的组合、把基本款穿出高级感的处理方式。创意服务于整体而非喧宾夺主。常见扣分项：千篇一律没记忆点、为博眼球而奇装异服。',
  },
  {
    key: 'bodyFit' as ScoringDimensionKey,
    label: '体型适配',
    description: '是否扬长避短，贴合穿着者的身体特点',
    maxScore: 100,
    rubric:
      '满分标准（100分）：廓形选择精准匹配体型特点。梨形=上紧下松放大上半身，苹果形=V领+高腰线拉长比例，矮个子=短上衣+高腰裤显腿长。衣服像是为这个人定制的。常见扣分项：阔腿裤穿在梨形身上显胯宽、横条纹穿在苹果形身上显壮。',
  },
  {
    key: 'practicality' as ScoringDimensionKey,
    label: '实穿性',
    description: '日常可穿程度，是否适合真实生活场景',
    maxScore: 100,
    rubric:
      '满分标准（100分）：穿这件出门不需要频繁调整，可以正常走路/坐下/抬手。面料舒适不扎人，厚度适合当前天气。不需要特殊维护（不用时刻整理）。常见扣分项：走路必须小碎步的紧身裙、需要不停提肩带的露肩装、冬天穿纱裙夏天穿皮草。',
  },
];

/**
 * 获取评分维度的 prompt 片段
 * 注入到 LLM system prompt 中，让 AI 按标准打分
 */
export function buildDimensionsPrompt(): string {
  const lines: string[] = [
    '## 评分标准',
    '',
    '请严格按照以下 8 个维度逐一评分，每个维度给出 0-100 的分数和一句话点评：',
    '',
  ];

  for (const dim of SCORING_DIMENSIONS) {
    lines.push(`### ${dim.label}（${dim.key}）`);
    lines.push(`- ${dim.description}`);
    lines.push(`- ${dim.rubric}`);
    lines.push('');
  }

  return lines.join('\n');
}
