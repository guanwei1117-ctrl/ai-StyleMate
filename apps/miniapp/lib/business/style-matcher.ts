/**
 * 风格匹配引擎 —— 三支柱打分 + AI 照片分析预留接口（从 Web 端复制，适配小程序路径）
 */
import { STYLES } from '../data/styles';
import type { StyleCard } from '../data/styles';
import type {
  OnboardingAnswers, StyleMatchResult, PhotoAnalysisResult,
  BodyShape, AgeGroup, Occupation, ClimateZone, DailyScene, DressingGoal, PriorityDimension,
} from '../types/onboarding';
import { deriveBodyShape } from './body-analysis';
import type { StyleCategoryId, CategoryScore, TonalConsistencyResult, TonalVector, ScoringSnapshot, SelectedStyleAnalysis } from '../types/scoring';
import { CATEGORY_GROUPS, getStyleIdsByCategory } from './style-categories';
import { CATEGORY_TONAL_VECTORS, tonalDistance, getStyleTonalVector } from './tonal-spectrum';

const BODY_SILHOUETTE_MAP: Record<BodyShape, string[]> = {
  pear: ['A字型', 'A字裙', 'A型大衣', '高腰线', '上宽下窄', 'X型收腰', '收腰大摆', '微A型', '微A裙摆'],
  apple: ['H型宽松', '直筒', 'V领', '垂坠A型', '茧型', '落肩', 'H型', '茧型卫衣', '宽松H型', '直筒阔腿'],
  hourglass: ['X型收腰', '包臀', '铅笔裙', '合身H型', 'V领针织', '深V领', '收腰大摆', '短上衣+低腰裤'],
  rectangle: ['H型', '直筒', '微A型', '微宽松合身', '直筒阔腿', '层叠', 'A字型', '大Oversize', '方型廓形'],
  inverted_triangle: ['A字型', 'A字裙', 'A型大衣', '阔腿裤+修身针织', '微A型', '微A裙摆', '层叠A型', '破碎廓形'],
  unknown: [],
};

const INTEREST_STYLE_MAP: Record<string, string[]> = {
  reading: ['intellectual', 'nerd_chic', 'uk_preppy', 'dark_poetry'],
  music: ['rock_star', 'kpop_stage', 'festival_boho', 'uk_punk', 'jp_harajuku'],
  fitness: ['athleisure', 'us_street', 'gorpcore', 'tenniscore'],
  travel: ['travel_resort', 'bohemian', 'gorpcore', 'kr_effortless'],
  food: ['fr_effortless', 'it_passione', 'cafe_lounge', 'kr_effortless'],
  photography: ['minimalist', 'film_retro', 'vintage_lover', 'intellectual'],
  movie: ['matrix_agent', 'gatsby', 'hk_retro', 'dark_poetry'],
  art: ['pop_art', 'grafitti_art', 'bohemian', 'indie_designer', 'avant_garde'],
  gaming: ['cyberpunk', 'y2k', 'skater', 'wasteland_survivor'],
  pets: ['cafe_lounge', 'mori_girl', 'earthy_relax', 'athleisure'],
  outdoor: ['gorpcore', 'urban_outdoor', 'camo_tech', 'us_western'],
  tech: ['cyberpunk', 'minimalist', 'y2k', 'matrix_agent', 'grey_tonal'],
};

const BUDGET_DIFFICULTY_RANGE: Record<string, { min: number; max: number }> = {
  budget: { min: 1, max: 3 },
  mid: { min: 1, max: 4 },
  premium: { min: 2, max: 5 },
};

const SKIN_TONE_COLOR_MAP: Record<string, string[]> = {
  cool: ['#1A3C5E', '#4A6FA5', '#2C3E50', '#696969', '#87CEEB', '#B8C9D4'],
  warm: ['#C41E3A', '#8B4513', '#D2691E', '#DAA520', '#C4A35A', '#D4C5B9'],
  neutral: [],
  unknown: [],
};

const AGE_DIFFICULTY_FIT: Record<AgeGroup, { ideal: [number, number]; penalty: number }> = {
  under_18: { ideal: [1, 3], penalty: 3 },
  '18_24': { ideal: [1, 4], penalty: 2 },
  '25_29': { ideal: [1, 4], penalty: 2 },
  '30_39': { ideal: [1, 4], penalty: 2 },
  '40_49': { ideal: [1, 3], penalty: 2 },
  '50_plus': { ideal: [1, 2], penalty: 3 },
};

const AGE_CATEGORY_FIT: Record<AgeGroup, Set<string>> = {
  under_18: new Set(['清新甜美', '街头潮流', '运动休闲', '亚文化']),
  '18_24': new Set(['街头潮流', '亚文化', '音乐舞台', '视觉元素', '运动休闲']),
  '25_29': new Set(['职场精英', '法式', '韩系', '质感主义', '极简']),
  '30_39': new Set(['职场精英', '质感主义', '法式', '英伦', '极简']),
  '40_49': new Set(['质感主义', '职场精英', '英伦', '意式', '极简']),
  '50_plus': new Set(['质感主义', '极简', '休闲度假']),
};

const OCCUPATION_CATEGORY_MAP: Record<Occupation, string[]> = {
  student: ['休闲度假', '街头潮流', '运动休闲', '清新甜美', '亚文化'],
  office_worker: ['职场精英', '极简', '休闲度假', '韩系'],
  creative: ['文化艺术', '视觉元素', '地域文化', '质感主义'],
  management: ['职场精英', '英伦', '意式', '质感主义'],
  service: ['职场精英', '休闲度假', '极简'],
  medical_education: ['职场精英', '休闲度假', '极简', '质感主义'],
  homemaker: ['休闲度假', '运动休闲', '日系', '韩系'],
  other: [],
};

const CLIMATE_CATEGORY_MAP: Record<ClimateZone, string[]> = {
  cold: ['英伦', '北欧', '户外运动', '暗黑'],
  mild: [],
  hot: ['休闲度假', '法式', '韩系', '清新甜美', '运动休闲'],
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

const GOAL_CATEGORY_MAP: Record<DressingGoal, string[]> = {
  look_polished: ['职场精英', '法式', '英伦', '意式', '质感主义'],
  express_personality: ['街头潮流', '亚文化', '视觉元素', '音乐舞台', '人物原型'],
  comfort_first: ['运动休闲', '休闲度假', '极简', '日系'],
  look_slim: [],
  professional: ['职场精英', '英伦', '极简'],
  try_new_style: ['亚文化', '视觉元素', '未来科技', '梦幻幻想'],
  build_wardrobe: ['极简', '质感主义', '休闲度假'],
};

export function matchStyles(answers: OnboardingAnswers): StyleMatchResult[] {
  const bodyShape = deriveBodyShape(answers.height!, answers.weight!, answers.bust, answers.waist, answers.hip);
  const catScores = matchCategories(answers);
  const tonalCheck = checkTonalConsistency(catScores);
  const filteredScores = getFilteredCategoryScores(catScores, tonalCheck);
  const allowedStyleIds = new Set<string>();
  for (const cs of filteredScores) {
    const ids = getStyleIdsByCategory(cs.categoryId);
    for (const id of ids) allowedStyleIds.add(id);
  }
  const results: StyleMatchResult[] = STYLES
    .filter((style) => allowedStyleIds.has(style.id))
    .map((style) => {
      const breakdown = {
        bodyShape: scoreBodyShape(style, bodyShape),
        preference: scorePreference(style, answers.preferredStyleIds),
        skinTone: scoreSkinTone(style, answers.photoPreview),
        budget: scoreBudget(style, answers),
        ageFit: scoreAgeFit(style, answers.ageGroup),
        scene: scoreScene(style, answers),
        priority: scorePriority(style, answers.priorities),
        goal: scoreGoal(style, answers.dressingGoals),
        openness: scoreOpenness(style, answers),
      };
      const pillarsNew = {
        aesthetic: Math.round((breakdown.bodyShape / 20) * 25) + Math.round((breakdown.preference / 25) * 20) + breakdown.skinTone,
        behavioral: Math.round((breakdown.priority / 10) * 12) + Math.round((breakdown.goal / 5) * 10) + Math.round((breakdown.openness / 5) * 8),
        realistic: Math.round((breakdown.budget / 12) * 8) + Math.round((breakdown.ageFit / 8) * 7) + Math.round((breakdown.scene / 10) * 5),
      };
      const totalScore = pillarsNew.aesthetic + pillarsNew.behavioral + pillarsNew.realistic;
      const reasons = buildReasons(style, breakdown, { aesthetic: breakdown.bodyShape + breakdown.preference + breakdown.skinTone, realistic: breakdown.budget + breakdown.ageFit + breakdown.scene, behavioral: breakdown.priority + breakdown.goal + breakdown.openness }, bodyShape);
      return { styleId: style.id, styleName: style.name, category: style.category, score: totalScore, matchReasons: reasons, matchBreakdown: breakdown, pillars: pillarsNew };
    })
    .sort((a, b) => b.score - a.score);
  const coreStyles = results.filter((r) => r.score >= 85);
  const secondaryStyles = results.filter((r) => r.score >= 65 && r.score < 85);
  const remaining = results.filter((r) => r.score < 65);
  return [...coreStyles, ...secondaryStyles, ...remaining];
}

function scoreBodyShape(style: StyleCard, bodyShape: BodyShape): number {
  if (bodyShape === 'unknown') return 10;
  const compatible = BODY_SILHOUETTE_MAP[bodyShape] || [];
  const matches = style.silhouette.filter((s) => compatible.some((c) => c.includes(s) || s.includes(c)));
  const ratio = matches.length / Math.max(style.silhouette.length, 1);
  return Math.round(ratio * 20);
}

function scorePreference(style: StyleCard, preferredIds: string[]): number {
  if (preferredIds.length === 0) return 12;
  if (preferredIds.includes(style.id)) return 25;
  const sameSubCategory = preferredIds.some((id) => { const s = STYLES.find((st) => st.id === id); return s && s.category === style.category; });
  if (sameSubCategory) return 20;
  const sameDimension = preferredIds.some((id) => { const s = STYLES.find((st) => st.id === id); return s && s.dimension === style.dimension; });
  return sameDimension ? 15 : 8;
}

function scoreSkinTone(style: StyleCard, hasPhoto: string | null): number {
  return hasPhoto ? 4 : 3;
}

const BUDGET_FRIENDLY_CATEGORIES = new Set(['质感主义', '色彩美学', '休闲度假', '运动休闲']);
function scoreBudget(style: StyleCard, answers: OnboardingAnswers): number {
  const budget = answers.budget;
  if (!budget) return 6;
  let score: number;
  const range = BUDGET_DIFFICULTY_RANGE[budget];
  if (style.difficulty >= range.min && style.difficulty <= range.max) {
    score = 10;
  } else {
    const dist = Math.min(Math.abs(style.difficulty - range.min), Math.abs(style.difficulty - range.max));
    score = Math.max(2, 10 - dist * 3);
  }
  if (BUDGET_FRIENDLY_CATEGORIES.has(style.category)) score = Math.min(12, score + 2);
  if (budget === 'budget' && style.difficulty >= 4) score = Math.min(score, 5);
  if (answers.monthlyBudgetMax && answers.monthlyBudgetMax < 500 && style.difficulty >= 4) score = Math.max(3, score - 2);
  return Math.round(Math.min(12, Math.max(0, score)));
}

function scoreAgeFit(style: StyleCard, ageGroup: AgeGroup | null): number {
  if (!ageGroup) return 4;
  const fit = AGE_DIFFICULTY_FIT[ageGroup];
  let score: number;
  if (style.difficulty >= fit.ideal[0] && style.difficulty <= fit.ideal[1]) {
    score = 6;
  } else {
    const dist = Math.min(Math.abs(style.difficulty - fit.ideal[0]), Math.abs(style.difficulty - fit.ideal[1]));
    score = Math.max(1, 6 - dist * fit.penalty);
  }
  if (AGE_CATEGORY_FIT[ageGroup].has(style.category)) score = Math.min(8, score + 2);
  return Math.round(score);
}

function scoreScene(style: StyleCard, answers: OnboardingAnswers): number {
  let score = 4;
  if (answers.occupation) {
    const cats = OCCUPATION_CATEGORY_MAP[answers.occupation] || [];
    if (cats.includes(style.category)) score += 3;
    else if (cats.length > 0) score -= 1;
  }
  if (answers.dailyScenes.length > 0) {
    const sceneHits = answers.dailyScenes.filter((scene) => (DAILY_SCENE_CATEGORY_MAP[scene] || []).includes(style.category)).length;
    score += Math.min(3, sceneHits);
  }
  if (answers.climate) {
    const cats = CLIMATE_CATEGORY_MAP[answers.climate] || [];
    if (cats.includes(style.category)) score += 2;
  }
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

function scorePriority(style: StyleCard, priorities: PriorityDimension[]): number {
  if (priorities.length === 0) return 5;
  let score = 0;
  priorities.forEach((p, idx) => {
    const weight = priorities.length - idx;
    let fit = 0;
    if (p === 'comfort') fit = style.difficulty <= 2 ? 1 : style.difficulty === 3 ? 0.5 : 0.2;
    else if (p === 'texture') fit = ['质感主义', '极简', '色彩美学'].includes(style.category) ? 1 : 0.4;
    else if (p === 'personality') fit = ['人物原型', '视觉元素'].includes(style.dimension) ? 1 : 0.3;
    else if (p === 'slimming') fit = style.silhouette.some((s) => /收腰|A字|高腰|直筒/.test(s)) ? 1 : 0.4;
    score += weight * fit;
  });
  const maxPossible = (priorities.length * (priorities.length + 1)) / 2;
  return Math.round((score / maxPossible) * 10);
}

function scoreGoal(style: StyleCard, goals: DressingGoal[]): number {
  if (goals.length === 0) return 2;
  let hits = 0;
  for (const goal of goals) {
    const cats = GOAL_CATEGORY_MAP[goal] || [];
    if (cats.length === 0) { if (goal === 'look_slim' && style.silhouette.some((s) => /收腰|A字|高腰/.test(s))) hits++; continue; }
    if (cats.includes(style.category)) hits++;
  }
  return Math.round((hits / goals.length) * 5);
}

function scoreOpenness(style: StyleCard, answers: OnboardingAnswers): number {
  if (answers.openToNewStyles === false) { if (style.difficulty >= 4) return 1; if (style.difficulty === 3) return 3; return 5; }
  if (answers.openToNewStyles === true) { if (style.difficulty >= 4) return 5; return 4; }
  if (answers.styleOpenness) { if (answers.styleOpenness >= 4 && style.difficulty >= 4) return 5; if (answers.styleOpenness >= 4) return 4; if (answers.styleOpenness <= 2 && style.difficulty >= 4) return 1; if (answers.styleOpenness <= 2) return 3; }
  if (style.difficulty <= 2) return 4;
  if (style.difficulty >= 4) return 2;
  return 3;
}

function buildReasons(style: StyleCard, breakdown: StyleMatchResult['matchBreakdown'], pillars: StyleMatchResult['pillars'], _bodyShape: BodyShape): string[] {
  const reasons: string[] = [];
  if (breakdown.bodyShape >= 16) reasons.push('廓形高度适配你的体型');
  else if (breakdown.bodyShape >= 10) reasons.push('廓形与你的体型较为适配');
  if (breakdown.preference >= 20) reasons.push('符合你偏好的风格方向');
  else if (breakdown.preference >= 15) reasons.push('与你偏好的风格有相似调性');
  if (breakdown.budget >= 10) reasons.push('在你的预算范围内容易实现');
  if (breakdown.ageFit >= 7) reasons.push('与你的年龄段气质契合');
  if (breakdown.scene >= 8) reasons.push('匹配你的职业与生活场景');
  else if (breakdown.scene >= 6) reasons.push('与你的日常场景较为契合');
  if (breakdown.priority >= 8) reasons.push('高度符合你的穿衣优先级');
  if (breakdown.goal >= 4) reasons.push('能帮你实现穿衣目标');
  if (breakdown.openness >= 4) reasons.push('难度在你的接受范围内');
  if (pillars.aesthetic >= 40 && pillars.realistic >= 24 && pillars.behavioral >= 15) reasons.push('审美、现实、偏好三方面高度契合');
  if (reasons.length === 0) reasons.push('综合推荐，值得尝试');
  return reasons;
}

export function matchCategories(answers: OnboardingAnswers): CategoryScore[] {
  const bodyShape = deriveBodyShape(answers.height!, answers.weight!, answers.bust, answers.waist, answers.hip);
  const results: CategoryScore[] = CATEGORY_GROUPS.map((group) => {
    const styles = group.styleIds.map((id) => STYLES.find((s) => s.id === id)).filter((s): s is StyleCard => s !== undefined);
    if (styles.length === 0) return { categoryId: group.id, categoryName: group.name, totalScore: 0, breakdown: { aesthetic: 0, behavioral: 0, realistic: 0 } };
    let totalAesthetic = 0, totalBehavioral = 0, totalRealistic = 0;
    for (const style of styles) {
      const bodyShapeScore = scoreBodyShape(style, bodyShape);
      const preferenceScore = scorePreference(style, answers.preferredStyleIds);
      const skinToneScore = scoreSkinTone(style, answers.photoPreview);
      totalAesthetic += Math.round((bodyShapeScore / 20) * 25) + Math.round((preferenceScore / 25) * 20) + skinToneScore;
      const priorityScore = scorePriority(style, answers.priorities);
      const goalScore = scoreGoal(style, answers.dressingGoals);
      const opennessScore = scoreOpenness(style, answers);
      totalBehavioral += Math.round((priorityScore / 10) * 12) + Math.round((goalScore / 5) * 10) + Math.round((opennessScore / 5) * 8);
      const budgetScore = scoreBudget(style, answers);
      const ageFitScore = scoreAgeFit(style, answers.ageGroup);
      const sceneScore = scoreScene(style, answers);
      totalRealistic += Math.round((budgetScore / 12) * 8) + Math.round((ageFitScore / 8) * 7) + Math.round((sceneScore / 10) * 5);
    }
    const count = styles.length;
    return { categoryId: group.id, categoryName: group.name, totalScore: Math.round((totalAesthetic + totalBehavioral + totalRealistic) / count), breakdown: { aesthetic: Math.round(totalAesthetic / count), behavioral: Math.round(totalBehavioral / count), realistic: Math.round(totalRealistic / count) } };
  });
  return results.sort((a, b) => b.totalScore - a.totalScore);
}

export function checkTonalConsistency(categoryScores: CategoryScore[]): TonalConsistencyResult {
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
    if (cs.categoryId === dominant.categoryId) retained.push(cs.categoryId);
    else if (dist >= 3.0) filteredOut.push(cs.categoryId);
    else retained.push(cs.categoryId);
  }
  return { dominantCategoryId: dominant.categoryId, dominantTonalVector: dominantVec, distancesToOthers, filteredOutCategoryIds: filteredOut, retainedCategoryIds: retained };
}

export function getFilteredCategoryScores(categoryScores: CategoryScore[], consistency: TonalConsistencyResult): CategoryScore[] {
  return categoryScores.filter((cs) => consistency.retainedCategoryIds.includes(cs.categoryId));
}

function analyzeSelectedStyles(selectedStyleIds: string[], answers: OnboardingAnswers): SelectedStyleAnalysis | undefined {
  if (selectedStyleIds.length === 0) return undefined;
  const styleId = selectedStyleIds[0];
  const style = STYLES.find((s) => s.id === styleId);
  if (!style) return undefined;
  const bodyShape = deriveBodyShape(answers.height!, answers.weight!, answers.bust, answers.waist, answers.hip);
  const advantages: string[] = [];
  const bodyShapeScore = scoreBodyShape(style, bodyShape);
  if (bodyShapeScore >= 16) advantages.push('廓形与你的体型高度适配');
  else if (bodyShapeScore >= 10) advantages.push('廓形基本适配你的体型');
  const budgetScore = scoreBudget(style, answers);
  if (budgetScore >= 10) advantages.push('在预算范围内易于实现');
  const goalScore = scoreGoal(style, answers.dressingGoals);
  if (goalScore >= 4) advantages.push('能帮助你实现穿衣目标');
  if (style.difficulty <= 2) advantages.push('难度较低，日常容易搭配');
  if (advantages.length === 0) advantages.push('你对该风格有个人偏好');
  const disadvantages: string[] = [];
  if (bodyShapeScore < 10) disadvantages.push('廓形与你的体型适配度较低，建议注意版型选择');
  if (answers.budget === 'budget' && style.difficulty >= 4) disadvantages.push('该风格单品价格偏高，可能超出你的预算');
  if (answers.climate === 'cold' && style.silhouette.every((s) => /吊带|短袖|短裙|凉鞋/.test(s))) disadvantages.push('该风格部分单品在寒冷地区实用性较低');
  if (answers.climate === 'hot' && style.silhouette.some((s) => /大衣|皮草|厚卫衣|毛衣/.test(s))) disadvantages.push('该风格部分单品在炎热地区穿着较热');
  if (style.difficulty >= 4 && answers.styleOpenness !== null && answers.styleOpenness <= 2) disadvantages.push('该风格难度较高，搭配需要一定功底');
  if (disadvantages.length === 0) disadvantages.push('无明显不适配点');
  const similarRecommendations: string[] = [];
  const styleVec = getStyleTonalVector(styleId);
  const sameCategory = CATEGORY_GROUPS.find((g) => g.styleIds.includes(styleId));
  const candidateStyleIds = sameCategory ? sameCategory.styleIds.filter((id) => id !== styleId) : STYLES.filter((s) => s.id !== styleId).map((s) => s.id);
  for (const candidateId of candidateStyleIds) {
    const candidateVec = getStyleTonalVector(candidateId);
    if (tonalDistance(styleVec, candidateVec) < 2.0) similarRecommendations.push(candidateId);
  }
  const crossCategoryIds: StyleCategoryId[] = [];
  if (sameCategory) {
    const dominantVec = CATEGORY_TONAL_VECTORS[sameCategory.id];
    for (const [catId, catVec] of Object.entries(CATEGORY_TONAL_VECTORS)) {
      if (catId === sameCategory.id) continue;
      if (tonalDistance(dominantVec, catVec) < 3.0) crossCategoryIds.push(catId as StyleCategoryId);
    }
  }
  return { styleId: style.id, styleName: style.name, advantages, disadvantages, similarRecommendations: similarRecommendations.slice(0, 5), crossCategoryRecommendations: crossCategoryIds.slice(0, 3) };
}

function buildRiskFlags(style: StyleCard, answers: OnboardingAnswers): string[] {
  const flags: string[] = [];
  if (answers.budget === 'budget' && style.difficulty >= 4) flags.push('预算偏高：该风格单品价格可能超出你的预算');
  if (style.difficulty >= 4 && answers.styleOpenness !== null && answers.styleOpenness <= 2) flags.push('风格难度大：该风格需要较强的搭配功底，可能超出你的舒适区');
  if (answers.climate === 'cold' && style.silhouette.every((s) => /吊带|短袖|短裙|凉鞋/.test(s))) flags.push('气候不匹配：该风格部分单品在寒冷地区可能不实用');
  if (answers.climate === 'hot' && style.silhouette.some((s) => /大衣|皮草|厚卫衣|毛衣/.test(s))) flags.push('气候不匹配：该风格部分单品在炎热地区穿着较热');
  if (answers.ageGroup && ['under_18', '18_24'].includes(answers.ageGroup) && style.difficulty >= 5) flags.push('年龄建议：超难风格可能需要较长的搭配经验积累');
  if (answers.ageGroup && ['40_49', '50_plus'].includes(answers.ageGroup) && style.difficulty >= 4) flags.push('年龄建议：高难度前卫风格可能与你的年龄段气质有差异');
  return flags;
}

export function buildScoringSnapshot(answers: OnboardingAnswers, categoryScores: CategoryScore[], tonalConsistency: TonalConsistencyResult, matchResults: StyleMatchResult[]): ScoringSnapshot {
  const bodyShape = deriveBodyShape(answers.height!, answers.weight!, answers.bust, answers.waist, answers.hip);
  const coreStyles = matchResults.filter((r) => r.score >= 85);
  const secondaryStyles = matchResults.filter((r) => r.score >= 65 && r.score < 85);
  return {
    timestamp: new Date().toISOString(), version: '2.0.0',
    userProfile: { bodyShape, ageGroup: answers.ageGroup, occupation: answers.occupation, budget: answers.budget, climate: answers.climate, interests: answers.interests, priorities: answers.priorities, dressingGoals: answers.dressingGoals, styleOpenness: answers.styleOpenness },
    categoryScores, userSelectedStyleIds: answers.preferredStyleIds,
    coreStyles: coreStyles.map((r) => ({ styleId: r.styleId, styleName: r.styleName, categoryName: r.category, score: r.score, reasons: r.matchReasons, riskFlags: [] })),
    secondaryStyles: secondaryStyles.map((r) => ({ styleId: r.styleId, styleName: r.styleName, categoryName: r.category, score: r.score, reasons: r.matchReasons, riskFlags: [] })),
    tonalConsistency,
    selectedStyleAnalysis: answers.preferredStyleIds.length > 0 ? analyzeSelectedStyles(answers.preferredStyleIds, answers) : undefined,
  };
}