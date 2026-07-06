/**
 * 风格解释引擎 —— 顾问级输出层
 *
 * 三大能力：
 *   1. 体型解读：把"为什么推荐"翻译成自然语言，让用户理解适配原理
 *   2. 避雷建议：主动告知不适合的版型/单品/配色 + 替代方案
 *   3. 多维评分：从"标签"升级为结构化维度（核心/次级/慎选 + 适配度）
 *
 * 纯规则计算，无 AI 依赖。所有映射表预定义，运行时仅查表+模板拼接。
 */

import { STYLES } from '@/data/styles';
import type { StyleCard } from '@/data/styles';
import type {
  StyleMatchResult,
  OnboardingAnswers,
  BodyShape,
  AgeGroup,
  DressingGoal,
  BodyExplain,
  AvoidanceAdvice,
  MultiDimensionScore,
  StyleExplanation,
} from './onboarding-types';

// ============================================================
// 一、体型解读映射表
// ============================================================

interface BodyTemplate {
  featureDesc: string;
  advantages: string[];
  silhouetteAdvice: string;
}

const BODY_EXPLAIN_MAP: Record<BodyShape, BodyTemplate> = {
  pear: {
    featureDesc: '你的肩线较窄、胯部较宽，下半身重心略明显',
    advantages: ['肩颈线条优美', '腰线纤细', '上半身适合展现细节'],
    silhouetteAdvice:
      '因此更适合强调上半身结构感、弱化胯部量感的搭配，如 A 字裙、高腰线、上宽下窄的廓形，能平衡上下半身比例。',
  },
  apple: {
    featureDesc: '你的腰腹较有肉感，四肢相对纤细',
    advantages: ['腿部线条修长', '上半身有分量感', '适合利落的纵向线条'],
    silhouetteAdvice:
      '因此更适合垂坠 H 型、V 领纵向延伸的搭配，弱化腰腹量感、突出四肢优势，如直筒外套、落肩上衣。',
  },
  hourglass: {
    featureDesc: '你的胸腰臀比例协调，曲线分明',
    advantages: ['身材曲线优美', '比例协调', '几乎适配大多数版型'],
    silhouetteAdvice:
      '因此适合收腰 X 型、合身剪裁，充分展现曲线优势，如铅笔裙、收腰连衣裙、合身针织。',
  },
  rectangle: {
    featureDesc: '你的肩腰臀宽度接近，身形偏直筒',
    advantages: ['身形利落干练', '适合层叠造型', '中性气质出众'],
    silhouetteAdvice:
      '因此适合层叠造型、腰带收腰、A 字廓形来制造曲线感，如短上衣+高腰裤、叠穿马甲。',
  },
  inverted_triangle: {
    featureDesc: '你的肩线较宽、胯部较窄，上半身重心明显',
    advantages: ['肩线挺拔有气场', '腿部修长', '适合展现下半身'],
    silhouetteAdvice:
      '因此适合 A 字下装、阔腿裤平衡肩宽，弱化上半身量感，如 V 领上衣、A 字半裙。',
  },
  unknown: {
    featureDesc: '你的体型数据暂不完整，以下为通用建议',
    advantages: ['建议补充三围数据以获得精准分析', '中性百搭身形', '适合大多数基础款'],
    silhouetteAdvice:
      '建议选择中性百搭的 H 型、直筒廓形，后续补充数据可精细化推荐。',
  },
};

/** 年龄段 → 配色建议 */
function buildColorAdvice(ageGroup: AgeGroup | null): string {
  if (!ageGroup) return '建议以低饱和度的质感色彩为主，百搭且不易出错。';
  if (ageGroup === 'under_18' || ageGroup === '18_24') {
    return '你的气质年轻活泼，适合中高饱和度的明快色彩，如亮橙、雾霾蓝、嫩粉。';
  }
  if (ageGroup === '25_29' || ageGroup === '30_39') {
    return '你的气质趋于成熟知性，适合低饱和度的质感色彩，如燕麦、灰蓝、焦糖。';
  }
  return '你的气质优雅从容，适合大地色系和经典中性色，如驼色、米白、深灰。';
}

/** 穿衣目标 → 气质定位 */
function buildAuraDescription(goals: DressingGoal[], ageGroup: AgeGroup | null): string {
  const isYouth = ageGroup === 'under_18' || ageGroup === '18_24';
  if (goals.includes('look_polished') || goals.includes('professional')) {
    return isYouth
      ? '你的气质偏温和清秀，比起高攻击性的穿搭，更适合轻松、干净、有层次的风格表达。'
      : '你的气质偏知性沉稳，适合利落有质感的风格，展现可靠的专业感。';
  }
  if (goals.includes('express_personality')) {
    return '你的气质适合有辨识度的风格表达，可以通过细节和廓形传递个性，而非夸张撞色。';
  }
  if (goals.includes('comfort_first')) {
    return '你的气质偏松弛自在，适合柔软舒适、不费力的风格，让穿着服务于生活。';
  }
  return '你的气质百搭，建议从核心风格出发，逐步探索适合自己的表达方式。';
}

/** 生成体型解读 */
export function buildBodyExplain(
  bodyShape: BodyShape,
  answers: OnboardingAnswers,
): BodyExplain {
  const tpl = BODY_EXPLAIN_MAP[bodyShape] || BODY_EXPLAIN_MAP.unknown;
  return {
    featureDesc: tpl.featureDesc,
    advantages: tpl.advantages,
    silhouetteAdvice: tpl.silhouetteAdvice,
    colorAdvice: buildColorAdvice(answers.ageGroup),
    auraDescription: buildAuraDescription(answers.dressingGoals, answers.ageGroup),
  };
}

// ============================================================
// 二、避雷建议映射表
// ============================================================

const BODY_AVOIDANCE_MAP: Record<BodyShape, AvoidanceAdvice[]> = {
  pear: [
    {
      category: 'silhouette',
      warning: '不建议紧身下装突出胯宽',
      reason: '会放大下半身量感，显胖显矮',
      alternatives: ['A 字半裙', '直筒阔腿裤'],
    },
    {
      category: 'item',
      warning: '不建议低腰裤压低腰线',
      reason: '会进一步下移视觉重心，破坏比例',
      alternatives: ['高腰直筒裤', '高腰连衣裙'],
    },
    {
      category: 'silhouette',
      warning: '不建议上半身过于简约',
      reason: '会让视觉焦点全部集中在下半身',
      alternatives: ['有结构感的上衣', 'V 领或方领上衣'],
    },
  ],
  apple: [
    {
      category: 'item',
      warning: '不建议过紧针织暴露腰腹',
      reason: '会凸显腰腹短板',
      alternatives: ['垂坠 H 型上衣', '茧型外套'],
    },
    {
      category: 'silhouette',
      warning: '不建议腰部收束的 X 型',
      reason: '会强调腰腹量感',
      alternatives: ['直筒廓形', '落肩宽松款'],
    },
    {
      category: 'item',
      warning: '不建议短款上衣露腰',
      reason: '会暴露腰腹，显臃肿',
      alternatives: ['中长款上衣', '高腰下装'],
    },
  ],
  hourglass: [
    {
      category: 'silhouette',
      warning: '不建议过度宽松的 H 型',
      reason: '会掩盖身材曲线优势',
      alternatives: ['收腰 X 型', '合身剪裁'],
    },
    {
      category: 'item',
      warning: '不建议无腰线的直筒连衣裙',
      reason: '会让曲线优势消失，显直筒',
      alternatives: ['腰带收腰款', 'X 型连衣裙'],
    },
  ],
  rectangle: [
    {
      category: 'silhouette',
      warning: '不建议全身紧身',
      reason: '会让身形更显单薄扁平',
      alternatives: ['层叠造型', 'A 字廓形'],
    },
    {
      category: 'item',
      warning: '不建议无腰线的直筒长款',
      reason: '会让身形缺乏层次',
      alternatives: ['腰带收腰', '短款上衣+高腰下装'],
    },
  ],
  inverted_triangle: [
    {
      category: 'silhouette',
      warning: '不建议垫肩或宽肩上衣',
      reason: '会进一步放大肩宽，头重脚轻',
      alternatives: ['落肩款', 'V 领上衣'],
    },
    {
      category: 'item',
      warning: '不建议紧身下装',
      reason: '会让肩胯比例更失衡',
      alternatives: ['A 字裙', '阔腿裤'],
    },
  ],
  unknown: [],
};

/** 通用误区（根据身高/接受度过滤） */
function buildGeneralAvoidance(answers: OnboardingAnswers): AvoidanceAdvice[] {
  const list: AvoidanceAdvice[] = [];

  // 小个子雷区
  if (answers.height && answers.height < 160) {
    list.push({
      category: 'general',
      warning: '不建议过长上衣压身高',
      reason: '会破坏身材比例，显矮显拖沓',
      alternatives: ['短款外套', '高腰内搭'],
    });
  }

  // 配色雷区
  list.push({
    category: 'color',
    warning: '不建议高饱和大面积撞色',
    reason: '容易显土且难驾驭',
    alternatives: ['低对比配色', '同色系层次'],
  });

  // 接受度低 + 高难度雷区
  if (answers.styleOpenness && answers.styleOpenness <= 2) {
    list.push({
      category: 'general',
      warning: '不建议盲目尝试高难度实验性风格',
      reason: '超出你的接受度，容易穿不出门',
      alternatives: ['从经典安全款入手', '小面积融入新元素'],
    });
  }

  return list;
}

/** 预算雷区 */
function buildBudgetAvoidance(
  results: StyleMatchResult[],
  answers: OnboardingAnswers,
): AvoidanceAdvice[] {
  if (answers.budget !== 'budget' || results.length === 0) return [];
  const top1 = results[0];
  const style = STYLES.find((s) => s.id === top1.styleId);
  if (!style || style.difficulty < 4) return [];

  return [
    {
      category: 'budget',
      warning: `不建议盲目追求"${style.name}"等高难度质感风格`,
      reason: '该风格对面料剪裁要求高，平价预算难以还原质感',
      alternatives: ['同调性的基础款替代', '选择难度 2-3 的近似风格'],
    },
  ];
}

/** 生成避雷建议（合并体型雷区 + 通用误区 + 预算雷区，去重，最多 6 条） */
export function buildAvoidanceAdvice(
  bodyShape: BodyShape,
  results: StyleMatchResult[],
  answers: OnboardingAnswers,
): AvoidanceAdvice[] {
  const bodyList = BODY_AVOIDANCE_MAP[bodyShape] || [];
  const generalList = buildGeneralAvoidance(answers);
  const budgetList = buildBudgetAvoidance(results, answers);

  const all = [...bodyList, ...generalList, ...budgetList];
  // 去重：相同 warning 只保留一条
  const seen = new Set<string>();
  return all
    .filter((a) => {
      if (seen.has(a.warning)) return false;
      seen.add(a.warning);
      return true;
    })
    .slice(0, 6);
}

// ============================================================
// 三、多维评分聚合
// ============================================================

/** 查找风格详情 */
function findStyle(styleId: string): StyleCard | undefined {
  return STYLES.find((s) => s.id === styleId);
}

/** 生成多维评分 */
export function buildMultiDimension(
  results: StyleMatchResult[],
  answers: OnboardingAnswers,
): MultiDimensionScore {
  // 风格分层
  const coreStyles = results.filter((r) => r.score >= 75).slice(0, 2);
  const rest = results.filter((r) => r.score < 75);
  const secondaryStyles = rest.slice(0, 3);
  const cautionStyles = rest.slice(3);

  // 适配度评分（取 Top3 平均归一化到 100）
  const top3 = results.slice(0, 3);
  const avgSkinTone = avg(top3.map((r) => r.matchBreakdown.skinTone)) / 5; // max 5
  const avgBodyShape = avg(top3.map((r) => r.matchBreakdown.bodyShape)) / 20; // max 20
  const avgScene = avg(top3.map((r) => r.matchBreakdown.scene)) / 10; // max 10

  const colorScore = Math.round(avgSkinTone * 100);
  const silhouetteScore = Math.round(avgBodyShape * 100);
  const sceneScore = Math.round(avgScene * 100);

  // 最佳版型：从核心风格聚合高频 silhouette
  const bestSilhouettes = aggregateFrequency(
    coreStyles.length > 0 ? coreStyles : top3,
    'silhouette',
  ).slice(0, 4);

  // 最佳配色：从核心风格聚合高频 colorPalette
  const bestColors = aggregateFrequency(
    coreStyles.length > 0 ? coreStyles : top3,
    'colorPalette',
  ).slice(0, 4);

  // 风险提示
  const top1 = results[0];
  const top1Style = top1 ? findStyle(top1.styleId) : null;
  const riskFlags = buildRiskFlags(top1Style, cautionStyles, answers);

  return {
    coreStyles,
    secondaryStyles,
    cautionStyles,
    colorScore,
    silhouetteScore,
    sceneScore,
    bestSilhouettes,
    bestColors,
    riskFlags,
  };
}

/** 聚合高频字段（silhouette 或 colorPalette） */
function aggregateFrequency(
  styles: StyleMatchResult[],
  field: 'silhouette' | 'colorPalette',
): string[] {
  const counter = new Map<string, number>();
  for (const r of styles) {
    const style = findStyle(r.styleId);
    if (!style) continue;
    for (const item of style[field]) {
      counter.set(item, (counter.get(item) || 0) + 1);
    }
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
}

/** 风险提示 */
function buildRiskFlags(
  top1Style: StyleCard | null,
  cautionStyles: StyleMatchResult[],
  answers: OnboardingAnswers,
): string[] {
  const flags: string[] = [];

  // 预算与难度不匹配
  if (answers.budget === 'budget' && top1Style && top1Style.difficulty >= 4) {
    flags.push('推荐风格难度较高，平价预算可能难以还原质感');
  }

  // 接受度低但推荐高难度
  if (
    answers.styleOpenness &&
    answers.styleOpenness <= 2 &&
    top1Style &&
    top1Style.difficulty >= 4
  ) {
    flags.push('推荐风格超出你的接受度，建议从低难度款入手');
  }

  // 慎选风格中有用户偏好但低分（使用与 cautionStyles 一致的范围）
  const lowScorePreferred = cautionStyles.find(
    (r) => r.score < 45 && answers.preferredStyleIds.includes(r.styleId),
  );
  if (lowScorePreferred) {
    flags.push(`你偏好的"${lowScorePreferred.styleName}"与现实条件匹配度较低，建议谨慎尝试`);
  }

  return flags;
}

// ============================================================
// 四、主导出函数 —— 聚合三者
// ============================================================

/** 生成完整顾问级解释 */
export function generateExplanation(
  results: StyleMatchResult[],
  answers: OnboardingAnswers,
  bodyShape: BodyShape,
): StyleExplanation {
  return {
    bodyExplain: buildBodyExplain(bodyShape, answers),
    avoidanceAdvice: buildAvoidanceAdvice(bodyShape, results, answers),
    multiDimension: buildMultiDimension(results, answers),
  };
}

// ============================================================
// 辅助
// ============================================================

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
