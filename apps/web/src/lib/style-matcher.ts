/**
 * 风格匹配引擎 —— 三支柱打分 + AI 照片分析预留接口
 *
 * 三支柱体系（满分 100）：
 *   审美适配 50：体型(20) + 偏好(25) + 肤色(5)
 *   现实约束 30：预算(12) + 年龄适配(8) + 场景适配(10)
 *   行为偏好 20：优先级(10) + 目标(5) + 接受度(5)
 *
 * 核心理念：适合 ≠ 会穿。审美适配判断"适不适合"，
 * 现实约束 + 行为偏好判断"会不会真的穿"。
 */

import { STYLES } from '@/data/styles';
import type { StyleCard } from '@/data/styles';
import type {
  OnboardingAnswers,
  StyleMatchResult,
  PhotoAnalysisResult,
  BodyShape,
  AgeGroup,
  Occupation,
  ClimateZone,
  DailyScene,
  DressingGoal,
  PriorityDimension,
} from './onboarding-types';
import { deriveBodyShape } from './body-analysis';

// ============================================================
// 体型 → 适配廓形映射（审美适配）
// ============================================================
const BODY_SILHOUETTE_MAP: Record<BodyShape, string[]> = {
  pear: ['A字型', 'A字裙', 'A型大衣', '高腰线', '上宽下窄', 'X型收腰', '收腰大摆', '微A型', '微A裙摆'],
  apple: ['H型宽松', '直筒', 'V领', '垂坠A型', '茧型', '落肩', 'H型', '茧型卫衣', '宽松H型', '直筒阔腿'],
  hourglass: ['X型收腰', '包臀', '铅笔裙', '合身H型', 'V领针织', '深V领', '收腰大摆', '短上衣+低腰裤'],
  rectangle: ['H型', '直筒', '微A型', '微宽松合身', '直筒阔腿', '层叠', 'A字型', '大Oversize', '方型廓形'],
  inverted_triangle: ['A字型', 'A字裙', 'A型大衣', '阔腿裤+修身针织', '微A型', '微A裙摆', '层叠A型', '破碎廓形'],
  unknown: [],
};

// ============================================================
// 兴趣 → 风格关联映射（场景适配辅助）
// ============================================================
const INTEREST_STYLE_MAP: Record<string, string[]> = {
  reading:      ['intellectual', 'nerd_chic', 'uk_preppy', 'dark_poetry'],
  music:        ['rock_star', 'kpop_stage', 'festival_boho', 'uk_punk', 'jp_harajuku'],
  fitness:      ['athleisure', 'us_street', 'gorpcore', 'tenniscore'],
  travel:       ['travel_resort', 'bohemian', 'gorpcore', 'kr_effortless'],
  food:         ['fr_effortless', 'it_passione', 'cafe_lounge', 'kr_effortless'],
  photography:  ['minimalist', 'film_retro', 'vintage_lover', 'intellectual'],
  movie:        ['matrix_agent', 'gatsby', 'hk_retro', 'dark_poetry'],
  art:          ['pop_art', 'grafitti_art', 'bohemian', 'indie_designer', 'avant_garde'],
  gaming:       ['cyberpunk', 'y2k', 'skater', 'wasteland_survivor'],
  pets:         ['cafe_lounge', 'mori_girl', 'earthy_relax', 'athleisure'],
  outdoor:      ['gorpcore', 'urban_outdoor', 'camo_tech', 'us_western'],
  tech:         ['cyberpunk', 'minimalist', 'y2k', 'matrix_agent', 'grey_tonal'],
};

// ============================================================
// 预算 → 难度适配范围（现实约束）
// ============================================================
const BUDGET_DIFFICULTY_RANGE: Record<string, { min: number; max: number }> = {
  budget: { min: 1, max: 3 },
  mid: { min: 1, max: 4 },
  premium: { min: 2, max: 5 },
};

// ============================================================
// 肤色 → 色系适配（审美适配，预留）
// ============================================================
const SKIN_TONE_COLOR_MAP: Record<string, string[]> = {
  cool: ['#1A3C5E', '#4A6FA5', '#2C3E50', '#696969', '#87CEEB', '#B8C9D4'],
  warm: ['#C41E3A', '#8B4513', '#D2691E', '#DAA520', '#C4A35A', '#D4C5B9'],
  neutral: [],
  unknown: [],
};

// ============================================================
// 年龄段 → 难度/调性适配（现实约束）
// 年轻群体包容潮流实验性，成熟群体偏经典质感
// ============================================================
const AGE_DIFFICULTY_FIT: Record<AgeGroup, { ideal: [number, number]; penalty: number }> = {
  under_18: { ideal: [1, 3], penalty: 3 }, // 青春，高难度扣分多
  '18_24':  { ideal: [1, 4], penalty: 2 }, // 潮流实验期
  '25_29':  { ideal: [1, 4], penalty: 2 }, // 轻熟过渡
  '30_39':  { ideal: [1, 4], penalty: 2 }, // 质感成熟
  '40_49':  { ideal: [1, 3], penalty: 2 }, // 经典优雅
  '50_plus':{ ideal: [1, 2], penalty: 3 }, // 舒适端庄
};

/** 年龄段偏好的风格 category（额外加分） */
const AGE_CATEGORY_FIT: Record<AgeGroup, Set<string>> = {
  under_18: new Set(['清新甜美', '街头潮流', '运动休闲', '亚文化']),
  '18_24':  new Set(['街头潮流', '亚文化', '音乐舞台', '视觉元素', '运动休闲']),
  '25_29':  new Set(['职场精英', '法式', '韩系', '质感主义', '极简']),
  '30_39':  new Set(['职场精英', '质感主义', '法式', '英伦', '极简']),
  '40_49':  new Set(['质感主义', '职场精英', '英伦', '意式', '极简']),
  '50_plus':new Set(['质感主义', '极简', '休闲度假']),
};

// ============================================================
// 职业/场景 → 风格 category 适配（现实约束）
// ============================================================
const OCCUPATION_CATEGORY_MAP: Record<Occupation, string[]> = {
  student:            ['休闲度假', '街头潮流', '运动休闲', '清新甜美', '亚文化'],
  office_worker:      ['职场精英', '极简', '休闲度假', '韩系'],
  creative:           ['文化艺术', '视觉元素', '地域文化', '质感主义'],
  management:         ['职场精英', '英伦', '意式', '质感主义'],
  service:            ['职场精英', '休闲度假', '极简'],
  medical_education:  ['职场精英', '休闲度假', '极简', '质感主义'],
  homemaker:          ['休闲度假', '运动休闲', '日系', '韩系'],
  other:              [],
};

// ============================================================
// 气候 → 风格适配（现实约束辅助）
// 寒冷地区偏爱叠穿/厚实，炎热地区偏爱轻薄/透气
// ============================================================
const CLIMATE_CATEGORY_MAP: Record<ClimateZone, string[]> = {
  cold:     ['英伦', '北欧', '户外运动', '暗黑'],
  mild:     [],
  hot:      ['休闲度假', '法式', '韩系', '清新甜美', '运动休闲'],
  variable: ['户外运动', '层叠'],
};

const DAILY_SCENE_CATEGORY_MAP: Record<DailyScene, string[]> = {
  school: ['学院', '休闲度假', '日系', '韩系', '街头潮流'],
  commute: ['职场精英', '极简', '韩系', '质感主义'],
  office: ['职场精英', '极简', '质感主义', '法式'],
  client_meeting: ['职场精英', '英伦', '意式', '质感主义'],
  interview: ['职场精英', '极简', '英伦', '质感主义'],
  date: ['法式', '清新甜美', '韩系', '意式'],
  street: ['街头潮流', '美式', '韩系', '运动休闲'],
  party: ['音乐舞台', '视觉元素', '意式', '亚文化'],
  travel: ['休闲度假', '法式', '日系', '户外运动'],
  photo_shoot: ['视觉元素', '法式', '意式', '人物原型'],
  workout: ['运动休闲', '户外运动', '美式'],
  home: ['休闲度假', '日系', '韩系', '运动休闲'],
  wedding_formal: ['意式', '法式', '质感主义', '职场精英'],
  music_festival: ['音乐舞台', '波西米亚', '街头潮流', '亚文化'],
  parenting: ['休闲度假', '运动休闲', '日系', '韩系'],
  on_camera: ['质感主义', '色彩美学', '职场精英', '法式'],
};

// ============================================================
// 穿衣目标 → 风格适配（行为偏好）
// ============================================================
const GOAL_CATEGORY_MAP: Record<DressingGoal, string[]> = {
  look_polished:        ['职场精英', '法式', '英伦', '意式', '质感主义'],
  express_personality:  ['街头潮流', '亚文化', '视觉元素', '音乐舞台', '人物原型'],
  comfort_first:        ['运动休闲', '休闲度假', '极简', '日系'],
  look_slim:            [], // 体型相关，由 silhouette 判断
  professional:         ['职场精英', '英伦', '极简'],
  try_new_style:        ['亚文化', '视觉元素', '未来科技', '梦幻幻想'],
  build_wardrobe:       ['极简', '质感主义', '休闲度假'],
};

// ============================================================
// 主匹配函数
// ============================================================
// ============================================================
// 【阶段三】新版主匹配函数 —— 二层架构 + 分层输出
// ============================================================

/**
 * 风格匹配（新版二层架构）
 *
 * 流程：
 *   1. 对 8 个大类评分 → 大类排序
 *   2. 视觉调性过滤 → 剔除调性相冲的大类
 *   3. 在保留的大类内对子风格精确评分
 *   4. 分层输出：核心风格（≥85） + 可尝试风格（65-84）
 *
 * 输出格式不变（StyleMatchResult[]），但内部语义变了：
 *   - 前几个是经过调性过滤的"核心风格"
 *   - 后续是"可尝试风格"
 *   调用方通过 score 阈值来区分（≥85 为核心，≥65 为可尝试）
 */
export function matchStyles(answers: OnboardingAnswers): StyleMatchResult[] {
  const bodyShape = deriveBodyShape(
    answers.height!,
    answers.weight!,
    answers.bust,
    answers.waist,
    answers.hip,
  );

  // Step 1: 大类评分
  const catScores = matchCategories(answers);

  // Step 2: 调性过滤
  const tonalCheck = checkTonalConsistency(catScores);
  const filteredScores = getFilteredCategoryScores(catScores, tonalCheck);

  // Step 3: 只在保留的大类内对子风格精确评分
  const allowedStyleIds = new Set<string>();
  for (const cs of filteredScores) {
    const ids = getStyleIdsByCategory(cs.categoryId);
    for (const id of ids) allowedStyleIds.add(id);
  }

  // Step 4: 对允许的风格逐一使用新权重精确打分
  const results: StyleMatchResult[] = STYLES
    .filter((style) => allowedStyleIds.has(style.id))
    .map((style) => {
      const breakdown = {
        // 审美适配（50分）—— 新权重
        bodyShape: scoreBodyShape(style, bodyShape),                       // 0-20（兼容旧接口）
        preference: scorePreference(style, answers.preferredStyleIds),     // 0-25
        skinTone: scoreSkinTone(style, answers.photoPreview),              // 0-5
        // 现实约束（20分）—— 新权重
        budget: scoreBudget(style, answers),                               // 0-12
        ageFit: scoreAgeFit(style, answers.ageGroup),                      // 0-8
        scene: scoreScene(style, answers),                                 // 0-10
        // 行为偏好（30分）—— 新权重
        priority: scorePriority(style, answers.priorities),                // 0-10
        goal: scoreGoal(style, answers.dressingGoals),                     // 0-5
        openness: scoreOpenness(style, answers),                           // 0-5
      };

      // 按新权重体系重新计算三支柱
      const pillarsNew = {
        aesthetic: Math.round((breakdown.bodyShape / 20) * 25) + Math.round((breakdown.preference / 25) * 20) + breakdown.skinTone,
        behavioral: Math.round((breakdown.priority / 10) * 12) + Math.round((breakdown.goal / 5) * 10) + Math.round((breakdown.openness / 5) * 8),
        realistic: Math.round((breakdown.budget / 12) * 8) + Math.round((breakdown.ageFit / 8) * 7) + Math.round((breakdown.scene / 10) * 5),
      };

      const totalScore = pillarsNew.aesthetic + pillarsNew.behavioral + pillarsNew.realistic;
      const reasons = buildReasons(style, breakdown, {
        aesthetic: breakdown.bodyShape + breakdown.preference + breakdown.skinTone,
        realistic: breakdown.budget + breakdown.ageFit + breakdown.scene,
        behavioral: breakdown.priority + breakdown.goal + breakdown.openness,
      }, bodyShape);

      return {
        styleId: style.id,
        styleName: style.name,
        category: style.category,
        score: totalScore,
        matchReasons: reasons,
        matchBreakdown: breakdown,
        pillars: pillarsNew,
        dimensions: [],
        summary: style.philosophy,
        recommendedItems: style.keyItems,
        colorPalette: style.colorPalette,
        difficulty: style.difficulty,
      };
    })
    .sort((a, b) => b.score - a.score);

  // 按分层返回：核心（≥85）在前，可尝试（≥65）在后
  const coreStyles = results.filter((r) => r.score >= 85);
  const secondaryStyles = results.filter((r) => r.score >= 65 && r.score < 85);
  const remaining = results.filter((r) => r.score < 65);

  return [...coreStyles, ...secondaryStyles, ...remaining];
}

// ============================================================
// 审美适配子函数（50分）
// ============================================================

/** 体型匹配 (0-20分) */
function scoreBodyShape(style: StyleCard, bodyShape: BodyShape): number {
  if (bodyShape === 'unknown') return 10;

  const compatible = BODY_SILHOUETTE_MAP[bodyShape] || [];
  const matches = style.silhouette.filter((s) =>
    compatible.some((c) => c.includes(s) || s.includes(c)),
  );

  const ratio = matches.length / Math.max(style.silhouette.length, 1);
  return Math.round(ratio * 20);
}

/** 偏好匹配 (0-25分) - 用户选中的得满分，同维度给部分分 */
function scorePreference(style: StyleCard, preferredIds: string[]): number {
  if (preferredIds.length === 0) return 12;
  if (preferredIds.includes(style.id)) return 25;

  const sameSubCategory = preferredIds.some((id) => {
    const s = STYLES.find((st) => st.id === id);
    return s && s.category === style.category;
  });
  if (sameSubCategory) return 20;

  const sameDimension = preferredIds.some((id) => {
    const s = STYLES.find((st) => st.id === id);
    return s && s.dimension === style.dimension;
  });
  return sameDimension ? 15 : 8;
}

/** 肤色匹配 (0-5分) — AI 分析预留，当前给中性基础分 */
function scoreSkinTone(style: StyleCard, hasPhoto: string | null): number {
  // TODO: 接入 AI 照片分析后，根据 skinTone 与 style.colorPalette 匹配度打分
  // 当前无真实肤色数据，给中性基础分
  return hasPhoto ? 4 : 3;
}

// ============================================================
// 现实约束子函数（30分）
// ============================================================

/** 预算匹配 (0-12分) — 单件档位 + 难度适配 + 月度预算 */
const BUDGET_FRIENDLY_CATEGORIES = new Set(['质感主义', '色彩美学', '休闲度假', '运动休闲']);
function scoreBudget(style: StyleCard, answers: OnboardingAnswers): number {
  const budget = answers.budget;
  if (!budget) return 6;

  let score: number;

  // 基础：难度与预算档位适配
  const range = BUDGET_DIFFICULTY_RANGE[budget];
  if (style.difficulty >= range.min && style.difficulty <= range.max) {
    score = 10;
  } else {
    const dist = Math.min(
      Math.abs(style.difficulty - range.min),
      Math.abs(style.difficulty - range.max),
    );
    score = Math.max(2, 10 - dist * 3);
  }

  // 预算友好类目加分
  if (BUDGET_FRIENDLY_CATEGORIES.has(style.category)) score = Math.min(12, score + 2);

  // 平价预算遇到高难度高质感风格扣分（现实约束）
  if (budget === 'budget' && style.difficulty >= 4) score = Math.min(score, 5);

  // 月度预算范围微调
  if (answers.monthlyBudgetMax && answers.monthlyBudgetMax < 500 && style.difficulty >= 4) {
    score = Math.max(3, score - 2);
  }

  return Math.round(Math.min(12, Math.max(0, score)));
}

/** 年龄适配 (0-8分) — 难度调性 + category 偏好 */
function scoreAgeFit(style: StyleCard, ageGroup: AgeGroup | null): number {
  if (!ageGroup) return 4;

  const fit = AGE_DIFFICULTY_FIT[ageGroup];
  let score: number;

  if (style.difficulty >= fit.ideal[0] && style.difficulty <= fit.ideal[1]) {
    score = 6;
  } else {
    const dist = Math.min(
      Math.abs(style.difficulty - fit.ideal[0]),
      Math.abs(style.difficulty - fit.ideal[1]),
    );
    score = Math.max(1, 6 - dist * fit.penalty);
  }

  // category 偏好加分
  if (AGE_CATEGORY_FIT[ageGroup].has(style.category)) score = Math.min(8, score + 2);

  return Math.round(score);
}

/** 场景适配 (0-10分) — 职业 + 气候 + 兴趣综合 */
function scoreScene(style: StyleCard, answers: OnboardingAnswers): number {
  let score = 4; // 基础分

  // 职业匹配
  if (answers.occupation) {
    const cats = OCCUPATION_CATEGORY_MAP[answers.occupation] || [];
    if (cats.includes(style.category)) score += 3;
    else if (cats.length > 0) score -= 1;
  }

  // 具体日常场景匹配
  if (answers.dailyScenes.length > 0) {
    const sceneHits = answers.dailyScenes.filter((scene) => (DAILY_SCENE_CATEGORY_MAP[scene] || []).includes(style.category)).length;
    score += Math.min(3, sceneHits);
  }

  const customScene = answers.customScene.trim();
  if (customScene && (style.keyItems.some((item) => customScene.includes(item)) || customScene.includes(style.category))) {
    score += 1;
  }

  // 气候匹配
  if (answers.climate) {
    const cats = CLIMATE_CATEGORY_MAP[answers.climate] || [];
    if (cats.includes(style.category)) score += 2;
  }

  // 兴趣匹配（沿用原逻辑，映射到 0-3 分）
  if (answers.interests.length > 0) {
    let hits = 0;
    for (const interest of answers.interests) {
      const related = INTEREST_STYLE_MAP[interest] || [];
      if (related.includes(style.id)) hits++;
    }
    score += Math.round((hits / answers.interests.length) * 3);
  }

  return Math.round(Math.min(10, Math.max(0, score)));
}

// ============================================================
// 行为偏好子函数（20分）
// ============================================================

/** 优先级匹配 (0-10分) — 用户排序与风格特征匹配 */
function scorePriority(style: StyleCard, priorities: PriorityDimension[]): number {
  if (priorities.length === 0) return 5;

  let score = 0;
  priorities.forEach((p, idx) => {
    const weight = priorities.length - idx; // 第1名权重最高
    let fit = 0;

    if (p === 'comfort') {
      // 舒适度优先：低难度、宽松廓形加分
      fit = style.difficulty <= 2 ? 1 : style.difficulty === 3 ? 0.5 : 0.2;
    } else if (p === 'texture') {
      // 质感优先：质感主义/极简/色彩美学加分
      fit = ['质感主义', '极简', '色彩美学'].includes(style.category) ? 1 : 0.4;
    } else if (p === 'personality') {
      // 个性优先：人物原型/视觉元素/亚文化加分
      fit = ['人物原型', '视觉元素'].includes(style.dimension) ? 1 : 0.3;
    } else if (p === 'slimming') {
      // 显瘦优先：修饰体型廓形加分
      fit = style.silhouette.some((s) => /收腰|A字|高腰|直筒/.test(s)) ? 1 : 0.4;
    }

    score += weight * fit;
  });

  // 归一化到 0-10：max = 4+3+2+1 = 10（4项全满）
  const maxPossible = (priorities.length * (priorities.length + 1)) / 2;
  return Math.round((score / maxPossible) * 10);
}

/** 穿衣目标匹配 (0-5分) */
function scoreGoal(style: StyleCard, goals: DressingGoal[]): number {
  if (goals.length === 0) return 2;

  let hits = 0;
  for (const goal of goals) {
    const cats = GOAL_CATEGORY_MAP[goal] || [];
    if (cats.length === 0) {
      // look_slim 等无 category 映射的，按廓形判断
      if (goal === 'look_slim' && style.silhouette.some((s) => /收腰|A字|高腰/.test(s))) hits++;
      continue;
    }
    if (cats.includes(style.category)) hits++;
  }

  const ratio = hits / goals.length;
  return Math.round(ratio * 5);
}

/** 接受度匹配 (0-5分) — 风格难度与用户开放度匹配 */
function scoreOpenness(style: StyleCard, answers: OnboardingAnswers): number {
  // 明确拒绝尝试新风格
  if (answers.openToNewStyles === false) {
    if (style.difficulty >= 4) return 1;
    if (style.difficulty === 3) return 3;
    return 5;
  }

  // 明确愿意尝试
  if (answers.openToNewStyles === true) {
    if (style.difficulty >= 4) return 5;
    return 4;
  }

  // 风格接受度评分 (1-5)
  if (answers.styleOpenness) {
    // 高接受度(4-5)：高难度风格加分
    if (answers.styleOpenness >= 4 && style.difficulty >= 4) return 5;
    if (answers.styleOpenness >= 4) return 4;
    // 低接受度(1-2)：高难度风格扣分
    if (answers.styleOpenness <= 2 && style.difficulty >= 4) return 1;
    if (answers.styleOpenness <= 2) return 3;
  }

  // 默认：低难度加分，高难度略扣
  if (style.difficulty <= 2) return 4;
  if (style.difficulty >= 4) return 2;
  return 3;
}

// ============================================================
// 辅助函数
// ============================================================

function buildReasons(
  style: StyleCard,
  breakdown: StyleMatchResult['matchBreakdown'],
  pillars: StyleMatchResult['pillars'],
  _bodyShape: BodyShape,
): string[] {
  const reasons: string[] = [];

  // 审美适配
  if (breakdown.bodyShape >= 16) {
    reasons.push('廓形高度适配你的体型');
  } else if (breakdown.bodyShape >= 10) {
    reasons.push('廓形与你的体型较为适配');
  }

  if (breakdown.preference >= 20) {
    reasons.push('符合你偏好的风格方向');
  } else if (breakdown.preference >= 15) {
    reasons.push('与你偏好的风格有相似调性');
  }

  // 现实约束
  if (breakdown.budget >= 10) {
    reasons.push('在你的预算范围内容易实现');
  }

  if (breakdown.ageFit >= 7) {
    reasons.push('与你的年龄段气质契合');
  }

  if (breakdown.scene >= 8) {
    reasons.push('匹配你的职业与生活场景');
  } else if (breakdown.scene >= 6) {
    reasons.push('与你的日常场景较为契合');
  }

  // 行为偏好
  if (breakdown.priority >= 8) {
    reasons.push('高度符合你的穿衣优先级');
  }

  if (breakdown.goal >= 4) {
    reasons.push('能帮你实现穿衣目标');
  }

  if (breakdown.openness >= 4) {
    reasons.push('难度在你的接受范围内');
  }

  // 三支柱总结
  if (pillars.aesthetic >= 40 && pillars.realistic >= 24 && pillars.behavioral >= 15) {
    reasons.push('审美、现实、偏好三方面高度契合');
  }

  if (reasons.length === 0) {
    reasons.push('综合推荐，值得尝试');
  }

  return reasons;
}

// ============================================================
// AI 照片分析预留接口
// ============================================================
const AI_ANALYSIS_ENDPOINT = '/api/style/analyze-photo';

/**
 * 分析大头照片 — 获取肤色/脸型信息
 *
 * TODO: 接入后端 AI 服务后替换此实现。
 * 当前为 stub 版本，返回 mock 数据。
 * 预期后端接口:
 *   POST /api/style/analyze-photo
 *   Body: FormData { photo: File }
 *   Response: { skinTone: 'cool'|'warm'|'neutral', faceShape: string, confidence: number }
 */
export async function analyzePhoto(
  file: File,
): Promise<PhotoAnalysisResult> {
  try {
    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch(AI_ANALYSIS_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`AI analysis failed: ${res.status}`);
    }

    return await res.json();
  } catch {
    // 后端未就绪时返回 stub 数据
    console.warn(
      '[style-matcher] AI photo analysis endpoint not available, using stub result. ' +
      `Expected endpoint: ${AI_ANALYSIS_ENDPOINT}`,
    );
    return getStubPhotoAnalysis();
  }
}

/** Stub: 在没有 AI 后端时返回默认分析结果 */
function getStubPhotoAnalysis(): PhotoAnalysisResult {
  const tones: PhotoAnalysisResult['skinTone'][] = ['cool', 'warm', 'neutral'];
  return {
    skinTone: tones[Math.floor(Math.random() * tones.length)],
    faceShape: 'oval',
    confidence: 0.5,
  };
}

// ============================================================
// 【阶段二】大类评分引擎 + 视觉调性过滤
// ============================================================

import type { StyleCategoryId, CategoryScore, TonalConsistencyResult, TonalVector, ScoringSnapshot, SelectedStyleAnalysis } from './scoring-types';
import { CATEGORY_GROUPS, getStyleIdsByCategory, getCategoryName } from './style-categories';
import { CATEGORY_TONAL_VECTORS, tonalDistance, getStyleTonalVector } from './tonal-spectrum';

/**
 * 大类评分 —— 对 8 个大类逐一打分
 *
 * 大类评分逻辑：
 *   取大类下所有子风格，对每个子风格用原有子函数打分，然后取大类内平均分。
 *   这样大类分数本质上是"这个大类对用户整体而言有多合适"。
 *
 * 权重体系（总分调整为新规则）：
 *   审美适配 50：体型(25) + 偏好(20) + 色彩(5)
 *   行为偏好 30：优先级(12) + 目标(10) + 接受度(8)
 *   现实约束 20：预算(8) + 场景(7) + 气候(5)
 */
export function matchCategories(answers: OnboardingAnswers): CategoryScore[] {
  const bodyShape = deriveBodyShape(
    answers.height!,
    answers.weight!,
    answers.bust,
    answers.waist,
    answers.hip,
  );

  const results: CategoryScore[] = CATEGORY_GROUPS.map((group) => {
    const styleIds = group.styleIds;
    const styles = styleIds
      .map((id) => STYLES.find((s) => s.id === id))
      .filter((s): s is StyleCard => s !== undefined);

    if (styles.length === 0) {
      return {
        categoryId: group.id,
        categoryName: group.name,
        totalScore: 0,
        breakdown: { aesthetic: 0, behavioral: 0, realistic: 0 },
      };
    }

    // 对大类下所有子风格逐一打分，取平均
    let totalAesthetic = 0;
    let totalBehavioral = 0;
    let totalRealistic = 0;

    for (const style of styles) {
      // 审美适配（50分）—— 新权重
      const bodyShapeScore = scoreBodyShape(style, bodyShape); // 0-20
      const preferenceScore = scorePreference(style, answers.preferredStyleIds); // 0-25
      const skinToneScore = scoreSkinTone(style, answers.photoPreview); // 0-5

      // 偏好分从 0-25 映射到 0-20
      const preferenceMapped = Math.round((preferenceScore / 25) * 20);
      // 体型分从 0-20 映射到 0-25
      const bodyShapeMapped = Math.round((bodyShapeScore / 20) * 25);

      totalAesthetic += bodyShapeMapped + preferenceMapped + skinToneScore;

      // 行为偏好（30分）
      const priorityScore = scorePriority(style, answers.priorities); // 0-10
      const goalScore = scoreGoal(style, answers.dressingGoals); // 0-5
      const opennessScore = scoreOpenness(style, answers); // 0-5

      const priorityMapped = Math.round((priorityScore / 10) * 12);
      const goalMapped = Math.round((goalScore / 5) * 10);
      const opennessMapped = Math.round((opennessScore / 5) * 8);

      totalBehavioral += priorityMapped + goalMapped + opennessMapped;

      // 现实约束（20分）
      const budgetScore = scoreBudget(style, answers); // 0-12
      const ageFitScore = scoreAgeFit(style, answers.ageGroup); // 0-8
      const sceneScore = scoreScene(style, answers); // 0-10

      const budgetMapped = Math.round((budgetScore / 12) * 8);
      const ageMapped = Math.round((ageFitScore / 8) * 7);
      const sceneMapped = Math.round((sceneScore / 10) * 5);

      totalRealistic += budgetMapped + ageMapped + sceneMapped;
    }

    const count = styles.length;
    return {
      categoryId: group.id,
      categoryName: group.name,
      totalScore: Math.round((totalAesthetic + totalBehavioral + totalRealistic) / count),
      breakdown: {
        aesthetic: Math.round(totalAesthetic / count),
        behavioral: Math.round(totalBehavioral / count),
        realistic: Math.round(totalRealistic / count),
      },
    };
  });

  return results.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * 视觉调性一致性校验
 *
 * 取得分最高的大类作为主导大类，计算与其他大类的调性距离，
 * 距离 >= 3.0 的判定为调性相冲，从推荐中过滤掉。
 */
export function checkTonalConsistency(
  categoryScores: CategoryScore[],
): TonalConsistencyResult {
  const sorted = [...categoryScores].sort((a, b) => b.totalScore - a.totalScore);
  const dominant = sorted[0];
  const dominantVec = CATEGORY_TONAL_VECTORS[dominant.categoryId];

  const distancesToOthers: Record<string, number> = {};
  const filteredOut: StyleCategoryId[] = [];
  const retained: StyleCategoryId[] = [];

  for (const cs of sorted) {
    const vec = CATEGORY_TONAL_VECTORS[cs.categoryId];
    const dist = tonalDistance(dominantVec, vec);
    distancesToOthers[cs.categoryId] = Math.round(dist * 100) / 100;

    if (cs.categoryId === dominant.categoryId) {
      retained.push(cs.categoryId);
    } else if (dist >= 3.0) {
      filteredOut.push(cs.categoryId);
    } else {
      retained.push(cs.categoryId);
    }
  }

  return {
    dominantCategoryId: dominant.categoryId,
    dominantTonalVector: dominantVec,
    distancesToOthers,
    filteredOutCategoryIds: filteredOut,
    retainedCategoryIds: retained,
  };
}

/**
 * 获取通过调性过滤后保留的大类分数列表
 */
export function getFilteredCategoryScores(
  categoryScores: CategoryScore[],
  consistency: TonalConsistencyResult,
): CategoryScore[] {
  return categoryScores.filter(
    (cs) => consistency.retainedCategoryIds.includes(cs.categoryId),
  );
}



// ============================================================
// 【阶段三】辅助函数：风险标记 + 记忆输出
// ============================================================
// ============================================================
// 【阶段四】已选风格分析
// ============================================================

/**
 * 分析用户已选的风格
 *
 * 当用户主动选择了某个/某些风格时，不走评分推荐流程，
 * 而是分析这些风格的优缺点，并推荐调性相近的其他风格。
 *
 * @param selectedStyleIds 用户选择的风格 ID 列表
 * @param answers 用户问卷答案
 * @returns 已选风格分析结果
 */
function analyzeSelectedStyles(
  selectedStyleIds: string[],
  answers: OnboardingAnswers,
): SelectedStyleAnalysis | undefined {
  if (selectedStyleIds.length === 0) return undefined;

  const styleId = selectedStyleIds[0];
  const style = STYLES.find((s) => s.id === styleId);
  if (!style) return undefined;

  const bodyShape = deriveBodyShape(
    answers.height!,
    answers.weight!,
    answers.bust,
    answers.waist,
    answers.hip,
  );

  // 优点
  const advantages: string[] = [];
  const bodyShapeScore = scoreBodyShape(style, bodyShape);
  if (bodyShapeScore >= 16) {
    advantages.push('廓形与你的体型高度适配');
  } else if (bodyShapeScore >= 10) {
    advantages.push('廓形基本适配你的体型');
  }

  const budgetScore = scoreBudget(style, answers);
  if (budgetScore >= 10) {
    advantages.push('在预算范围内易于实现');
  }

  const goalScore = scoreGoal(style, answers.dressingGoals);
  if (goalScore >= 4) {
    advantages.push('能帮助你实现穿衣目标');
  }

  if (style.difficulty <= 2) {
    advantages.push('难度较低，日常容易搭配');
  }

  if (advantages.length === 0) {
    advantages.push('你对该风格有个人偏好');
  }

  // 缺点/不适配点
  const disadvantages: string[] = [];
  if (bodyShapeScore < 10) {
    disadvantages.push('廓形与你的体型适配度较低，建议注意版型选择');
  }
  if (answers.budget === 'budget' && style.difficulty >= 4) {
    disadvantages.push('该风格单品价格偏高，可能超出你的预算');
  }
  if (answers.climate === 'cold' && style.silhouette.every((s) => /吊带|短袖|短裙|凉鞋/.test(s))) {
    disadvantages.push('该风格部分单品在寒冷地区实用性较低');
  }
  if (answers.climate === 'hot' && style.silhouette.some((s) => /大衣|皮草|厚卫衣|毛衣/.test(s))) {
    disadvantages.push('该风格部分单品在炎热地区穿着较热');
  }
  if (style.difficulty >= 4 && answers.styleOpenness !== null && answers.styleOpenness <= 2) {
    disadvantages.push('该风格难度较高，搭配需要一定功底');
  }

  if (disadvantages.length === 0) {
    disadvantages.push('无明显不适配点');
  }

  // 调性相近的其他风格推荐
  const similarRecommendations: string[] = [];
  const styleVec = getStyleTonalVector(styleId);
  const sameCategory = CATEGORY_GROUPS.find((g) => g.styleIds.includes(styleId));
  const candidateStyleIds = sameCategory
    ? sameCategory.styleIds.filter((id) => id !== styleId)
    : STYLES.filter((s) => s.id !== styleId).map((s) => s.id);

  for (const candidateId of candidateStyleIds) {
    const candidateVec = getStyleTonalVector(candidateId);
    const dist = tonalDistance(styleVec, candidateVec);
    if (dist < 2.0) {
      similarRecommendations.push(candidateId);
    }
  }

  // 跨大类推荐
  const crossCategoryIds: StyleCategoryId[] = [];
  if (sameCategory) {
    const dominantVec = CATEGORY_TONAL_VECTORS[sameCategory.id];
    for (const [catId, catVec] of Object.entries(CATEGORY_TONAL_VECTORS)) {
      if (catId === sameCategory.id) continue;
      const dist = tonalDistance(dominantVec, catVec);
      if (dist < 3.0) {
        crossCategoryIds.push(catId as StyleCategoryId);
      }
    }
  }

  return {
    styleId: style.id,
    styleName: style.name,
    advantages,
    disadvantages,
    similarRecommendations: similarRecommendations.slice(0, 5),
    crossCategoryRecommendations: crossCategoryIds.slice(0, 3),
  };
}

/**
 * 构建风险标记列表
 * 分析风格的潜在不适配点，生成人类可读的风险提示
 */
function buildRiskFlags(
  style: StyleCard,
  answers: OnboardingAnswers,
): string[] {
  const flags: string[] = [];

  // 预算风险
  if (answers.budget === 'budget' && style.difficulty >= 4) {
    flags.push('预算偏高：该风格单品价格可能超出你的预算');
  }

  // 难度风险
  if (style.difficulty >= 4 && answers.styleOpenness !== null && answers.styleOpenness <= 2) {
    flags.push('风格难度大：该风格需要较强的搭配功底，可能超出你的舒适区');
  }

  // 气候风险
  if (answers.climate === 'cold' && style.silhouette.every((s) => /吊带|短袖|短裙|凉鞋/.test(s))) {
    flags.push('气候不匹配：该风格部分单品在寒冷地区可能不实用');
  }
  if (answers.climate === 'hot' && style.silhouette.some((s) => /大衣|皮草|厚卫衣|毛衣/.test(s))) {
    flags.push('气候不匹配：该风格部分单品在炎热地区穿着较热');
  }

  // 年龄风险
  if (answers.ageGroup && ['under_18', '18_24'].includes(answers.ageGroup) && style.difficulty >= 5) {
    flags.push('年龄建议：超难风格可能需要较长的搭配经验积累');
  }
  if (answers.ageGroup && ['40_49', '50_plus'].includes(answers.ageGroup) && style.difficulty >= 4) {
    flags.push('年龄建议：高难度前卫风格可能与你的年龄段气质有差异');
  }

  return flags;
}

/**
 * 构建评分快照 —— 记忆接口输出
 *
 * 将完整的评分结果包装成 ScoringSnapshot 格式，
 * 包含时间戳、用户画像快照、大类得分、分层推荐、调性校验结果。
 */
export function buildScoringSnapshot(
  answers: OnboardingAnswers,
  categoryScores: CategoryScore[],
  tonalConsistency: TonalConsistencyResult,
  matchResults: StyleMatchResult[],
): ScoringSnapshot {
  const bodyShape = deriveBodyShape(
    answers.height!,
    answers.weight!,
    answers.bust,
    answers.waist,
    answers.hip,
  );

  // 分层
  const coreStyles = matchResults.filter((r) => r.score >= 85);
  const secondaryStyles = matchResults.filter((r) => r.score >= 65 && r.score < 85);

  return {
    timestamp: new Date().toISOString(),
    version: '2.0.0',

    userProfile: {
      bodyShape,
      ageGroup: answers.ageGroup,
      occupation: answers.occupation,
      budget: answers.budget,
      climate: answers.climate,
      interests: answers.interests,
      priorities: answers.priorities,
      dressingGoals: answers.dressingGoals,
      styleOpenness: answers.styleOpenness,
    },

    categoryScores,

    userSelectedStyleIds: answers.preferredStyleIds,

    coreStyles: coreStyles.map((r) => ({
      styleId: r.styleId,
      styleName: r.styleName,
      categoryName: r.category,
      score: r.score,
      reasons: r.matchReasons,
      riskFlags: [],
    })),

    secondaryStyles: secondaryStyles.map((r) => ({
      styleId: r.styleId,
      styleName: r.styleName,
      categoryName: r.category,
      score: r.score,
      reasons: r.matchReasons,
      riskFlags: [],
    })),

    tonalConsistency,

    selectedStyleAnalysis: answers.preferredStyleIds.length > 0
      ? analyzeSelectedStyles(answers.preferredStyleIds, answers) : undefined,
  };
}


