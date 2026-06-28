/**
 * StyleMate 风格匹配引擎
 *
 * 五个维度评估用户与每种风格的适配度：
 * 1. 骨相 (25%基础权重) — 脸型 / 五官线条 / 骨架粗细
 * 2. 量感 (风格自定权重) — 五官存在感 vs 风格要求的体量
 * 3. 体型 (风格自定权重) — 身形 / 身高 / 廓形偏好
 * 4. 肤色 (风格自定权重) — 季型 / 对比度 / 色板
 * 5. 气质 (风格自定权重) — 原生气质 / 生活方式 / 内在自洽
 */

import {
  UserStyleDNA,
  StyleMatchResult,
  DimensionMatch,
  StyleAnalysisReport,
  StyleRoadmapStep,
} from '@stylemate/shared';
import {
  StyleDefinition,
  BoneStructureRules,
  VolumeSenseRules,
  BodyTypeRules,
  SkinToneRules,
  TemperamentRules,
} from '../data/style-database';

// ============================================================
// 评分工具函数
// ============================================================

/** 检查值是否在理想列表中 */
function isIdeal(value: string, ideal: string[]): boolean {
  return ideal.includes(value);
}

/** 检查值是否在可适配列表中 */
function isAdaptable(value: string, adaptable: string[]): boolean {
  return adaptable.includes(value);
}

/** 三阶评分：理想 → 100, 可适配 → 65, 其他 → 30 */
function threeTierScore(value: string, ideal: string[], adaptable: string[]): number {
  if (isIdeal(value, ideal)) return 100;
  if (isAdaptable(value, adaptable)) return 65;
  return 30;
}

/** 分数 → 等级 */
function scoreLevel(score: number): 'excellent' | 'good' | 'moderate' | 'weak' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'weak';
}

/** 分数 → 类别 */
function matchCategory(score: number): 'core' | 'explore' | 'challenge' {
  if (score >= 70) return 'core';
  if (score >= 50) return 'explore';
  return 'challenge';
}

// ============================================================
// 维度评分器
// ============================================================

function scoreBoneStructure(dna: UserStyleDNA, rules: BoneStructureRules): DimensionMatch {
  const faceScore = threeTierScore(
    dna.boneStructure.faceShape,
    rules.idealFaceShapes,
    rules.adaptableFaceShapes,
  );
  const lineScore = threeTierScore(
    dna.boneStructure.facialLineType,
    rules.idealFacialLines,
    rules.adaptableFacialLines,
  );
  const frameScore = threeTierScore(
    dna.boneStructure.frameSize,
    rules.idealFrameSizes,
    rules.adaptableFrameSizes,
  );

  // 脸型权重最高（视觉中心），骨架权重最低
  const score = Math.round(faceScore * 0.40 + lineScore * 0.35 + frameScore * 0.25);

  // 生成解释
  const reasoningParts: string[] = [];
  if (faceScore >= 80) reasoningParts.push('脸型天然适配');
  else if (faceScore >= 60) reasoningParts.push('脸型可以驾驭');
  else reasoningParts.push('脸型需要妆发配合');

  if (lineScore >= 80) reasoningParts.push('五官线条与风格高度一致');
  else if (lineScore >= 60) reasoningParts.push('五官线条基本协调');
  else reasoningParts.push('五官线条与风格略有冲突');

  if (frameScore >= 80) reasoningParts.push('骨架粗细恰好匹配');
  else if (frameScore >= 60) reasoningParts.push('骨架基本适应');
  else reasoningParts.push('骨架与风格要求的量感有差异');

  let tips = '';
  if (score < 60) {
    tips = '可通过发型修饰脸型线条、配饰转移视觉重心来调和。';
  } else if (score < 80) {
    tips = '注意领型选择可进一步优化面部与风格的协调感。';
  } else {
    tips = '骨相维度高度适配，可大胆尝试该风格的经典造型。';
  }

  return {
    dimension: 'bone_structure',
    score,
    level: scoreLevel(score),
    reasoning: reasoningParts.join('；') + '。',
    tips,
  };
}

function scoreVolumeSense(dna: UserStyleDNA, rules: VolumeSenseRules): DimensionMatch {
  const score = threeTierScore(dna.volumeSense, rules.ideal, rules.adaptable);

  let reasoning: string;
  if (score >= 80) {
    reasoning = '五官量感与该风格完美契合，视觉平衡感极佳。';
  } else if (score >= 60) {
    reasoning = '五官量感基本在该风格的包容范围内。';
  } else {
    reasoning =
      dna.volumeSense === 'low' || dna.volumeSense === 'medium_low'
        ? '你的五官偏淡颜系，该风格要求的视觉体量偏大，可能"衣穿人"而非"人穿衣"。'
        : '你的五官存在感较强，该风格偏柔和寡淡，可能压不住你的气场。';
  }

  let tips = '';
  if (score < 60) {
    tips =
      dna.volumeSense === 'low' || dna.volumeSense === 'medium_low'
        ? '建议在该风格中选择更简洁、减少装饰的单品，降低视觉噪音。'
        : '建议在该风格中适度加入有分量的配饰或色彩点缀来平衡。';
  }

  return {
    dimension: 'volume_sense',
    score,
    level: scoreLevel(score),
    reasoning,
    tips,
  };
}

function scoreBodyType(dna: UserStyleDNA, rules: BodyTypeRules): DimensionMatch {
  const shapeScore = threeTierScore(
    dna.bodyType.shape,
    rules.idealBodyShapes,
    rules.adaptableBodyShapes,
  );
  const heightScore = threeTierScore(
    dna.bodyType.heightCategory,
    rules.idealHeight,
    rules.adaptableHeight,
  );

  const score = Math.round(shapeScore * 0.6 + heightScore * 0.4);

  let reasoning: string;
  if (score >= 80) {
    reasoning = `身形与身高在该风格中属于理想类型。${rules.flatteringNote}`;
  } else if (score >= 60) {
    reasoning = `身形基本适合该风格，通过单品选择可以进一步优化。${rules.flatteringNote}`;
  } else {
    reasoning = `身形与该风格的典型廓形存在一定冲突。${rules.flatteringNote}`;
  }

  let tips = '';
  if (shapeScore < 60) {
    tips = '可通过调整单品版型（如高腰、V领、垂坠面料）来让该风格更适合你的身形。';
  }
  if (heightScore < 60) {
    tips += '注意衣长和裤长，避免被衣服"吃掉"比例。';
  }

  return {
    dimension: 'body_type',
    score,
    level: scoreLevel(score),
    reasoning,
    tips: tips || '按标准版型选择即可。',
  };
}

function scoreSkinTone(dna: UserStyleDNA, rules: SkinToneRules): DimensionMatch {
  const seasonScore = threeTierScore(
    dna.skinTone.colorSeason,
    rules.idealSeasons,
    rules.adaptableSeasons,
  );
  const contrastScore = threeTierScore(
    dna.skinTone.contrastLevel,
    rules.idealContrast,
    rules.adaptableContrast,
  );

  const score = Math.round(seasonScore * 0.7 + contrastScore * 0.3);

  let reasoning: string;
  if (seasonScore >= 80) {
    reasoning = `你的肤色季型与该风格的标准色板高度一致。${rules.colorNote}`;
  } else if (seasonScore >= 60) {
    reasoning = `你的季型可以在该风格内找到适配的配色方案。${rules.colorNote}`;
  } else {
    reasoning = `你的季型与该风格的标准配色存在偏差。${rules.colorNote}`;
  }

  let tips = '';
  if (score < 60) {
    tips = `避雷色：${rules.avoidColors.join('、')}。优先选择${rules.colorFamily.join('、')}中与你季型兼容的色调。`;
  } else if (score < 80) {
    tips = `在该风格中选择${rules.colorFamily.join('、')}的色调最能出彩。`;
  }

  return {
    dimension: 'skin_tone',
    score,
    level: scoreLevel(score),
    reasoning,
    tips: tips || `该风格的${rules.colorFamily.join('、')}色系可放心使用。`,
  };
}

function scoreTemperament(dna: UserStyleDNA, rules: TemperamentRules): DimensionMatch {
  const primaryTemperamentScore = threeTierScore(
    dna.temperament.primary,
    rules.idealTemperaments,
    rules.adaptableTemperaments,
  );

  // 生活方式：取最佳匹配（多 lifestyle 只要有一个 hit 就算匹配）
  const lifestyleScores = dna.temperament.lifestyle.map((ls) =>
    threeTierScore(ls, rules.idealLifestyles, rules.adaptableLifestyles),
  );
  const bestLifestyleScore = Math.max(...lifestyleScores);

  const score = Math.round(primaryTemperamentScore * 0.65 + bestLifestyleScore * 0.35);

  let reasoning: string;
  if (score >= 80) {
    reasoning = `气质内核与风格灵魂高度自洽。${rules.innerRequirement}`;
  } else if (score >= 60) {
    reasoning = `气质与风格基本兼容，少数场景可能感到不自洽。`;
  } else {
    reasoning = `你的原生气质与该风格的内核有一定距离。${rules.innerRequirement}`;
  }

  let tips = '';
  if (primaryTemperamentScore < 60) {
    tips = `该风格需要${rules.innerRequirement}。如果确实喜欢，可以从该风格的简化版入门。`;
  }
  if (bestLifestyleScore < 60) {
    tips += '日常生活场景可能不太方便穿这个风格，可作为周末探索。';
  }

  return {
    dimension: 'temperament',
    score,
    level: scoreLevel(score),
    reasoning,
    tips: tips || '气质维度适配良好，穿着时内外一致、自然舒适。',
  };
}

// ============================================================
// 主匹配函数
// ============================================================

/** 计算单个用户 vs 单个风格的匹配结果 */
export function matchUserToStyle(dna: UserStyleDNA, style: StyleDefinition): StyleMatchResult {
  const dims: DimensionMatch[] = [
    scoreBoneStructure(dna, style.boneRules),
    scoreVolumeSense(dna, style.volumeRules),
    scoreBodyType(dna, style.bodyRules),
    scoreSkinTone(dna, style.skinRules),
    scoreTemperament(dna, style.temperamentRules),
  ];

  // 动态权重：骨相固定0.25，其余四个维度使用风格定义的 importance
  const boneWeight = 0.25;
  const volumeWeight = style.volumeRules.importance;
  const bodyWeight = style.bodyRules.importance;
  const skinWeight = style.skinRules.importance;
  const temperamentWeight = style.temperamentRules.importance;

  const totalWeight = boneWeight + volumeWeight + bodyWeight + skinWeight + temperamentWeight;

  const weightedScore =
    (dims[0].score * boneWeight +
      dims[1].score * volumeWeight +
      dims[2].score * bodyWeight +
      dims[3].score * skinWeight +
      dims[4].score * temperamentWeight) /
    totalWeight;

  const overallScore = Math.round(weightedScore);

  // 生成一句话总结
  const summary = generateSummary(overallScore, dims, style);

  return {
    styleId: style.id,
    styleName: style.name,
    overallScore,
    category: matchCategory(overallScore),
    dimensions: dims,
    summary,
    recommendedItems: style.keyItems.slice(0, 5),
    colorPalette: style.colorPalette,
    difficulty: style.difficulty,
  };
}

/** 对用户做全量风格匹配并生成分析报告 */
export function analyzeAllStyles(dna: UserStyleDNA, styles: StyleDefinition[]): StyleAnalysisReport {
  const matches = styles
    .map((style) => matchUserToStyle(dna, style))
    .sort((a, b) => b.overallScore - a.overallScore);

  const coreStyles = matches.filter((m) => m.category === 'core');
  const exploreStyles = matches.filter((m) => m.category === 'explore');
  const challengeStyles = matches.filter((m) => m.category === 'challenge');

  const roadmap = generateRoadmap(coreStyles, exploreStyles, challengeStyles);

  return {
    userDNA: dna,
    matches,
    coreStyles,
    exploreStyles,
    challengeStyles,
    roadmap,
  };
}

// ============================================================
// 总结 & 路线图生成
// ============================================================

function generateSummary(
  overallScore: number,
  dims: DimensionMatch[],
  style: StyleDefinition,
): string {
  if (overallScore >= 80) {
    return `${style.name}与你高度适配，五个维度天然契合，是最值得深耕的风格方向。`;
  }
  if (overallScore >= 65) {
    const bestDim = dims.sort((a, b) => b.score - a.score)[0];
    const dimNames: Record<string, string> = {
      bone_structure: '骨相',
      volume_sense: '量感',
      body_type: '体型',
      skin_tone: '肤色',
      temperament: '气质',
    };
    return `${style.name}与你在「${dimNames[bestDim.dimension]}」方面高度契合，整体适配度良好。个别维度可通过微调优化。`;
  }
  if (overallScore >= 50) {
    return `${style.name}可作为探索方向，建议从简化版入手或选择性借鉴该风格的关键元素。`;
  }
  return `${style.name}与你的原生条件匹配度较低，但如果真心喜欢，可以在规则之外寻找个人化的融合方式。`;
}

function generateRoadmap(
  coreStyles: StyleMatchResult[],
  exploreStyles: StyleMatchResult[],
  challengeStyles: StyleMatchResult[],
): StyleRoadmapStep[] {
  const steps: StyleRoadmapStep[] = [];

  if (coreStyles.length > 0) {
    steps.push({
      phase: 1,
      title: '第一阶段：建立自信',
      description:
        '从与你天然高度适配的风格入手，这些风格不需要费力就能穿出好效果。先在这里建立穿搭的自信和肌肉记忆。',
      styles: coreStyles.slice(0, 5).map((s) => s.styleName),
      focus: '买对不买多——每个风格精选 3-5 件核心单品即可。',
    });
  }

  if (exploreStyles.length > 0) {
    steps.push({
      phase: 2,
      title: '第二阶段：拓展边界',
      description:
        '在核心风格稳固后，逐步探索适配度不错的风格。这时你已经有了穿搭直觉，可以开始有意识地融合不同风格的元素。',
      styles: exploreStyles.slice(0, 5).map((s) => s.styleName),
      focus: '在一个维度上做改变（如换色系、换面料），不要一次变动太多。',
    });
  }

  if (challengeStyles.length > 0) {
    steps.push({
      phase: 3,
      title: '第三阶段：自由创造',
      description:
        '当你完全了解自己的风格DNA后，即使匹配度不高的风格也可以被你"改造"。不是你去适应风格，而是风格为你服务。',
      styles: challengeStyles.slice(0, 3).map((s) => s.styleName),
      focus: '借鉴一个元素而非全套模仿。比如只学配色，保留自己适合的廓形。',
    });
  }

  return steps;
}
