/**
 * 风格匹配引擎 —— 前端规则打分 + AI 照片分析预留接口
 */

import { STYLES } from '@/data/styles';
import type { StyleCard } from '@/data/styles';
import type {
  OnboardingAnswers,
  StyleMatchResult,
  PhotoAnalysisResult,
  BodyShape,
} from './onboarding-types';
import { deriveBodyShape } from './body-analysis';

// ============================================================
// 体型 → 适配廓形映射
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
// 兴趣 → 风格关联映射
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
// 预算 → 风格难度适配
// ============================================================
const BUDGET_DIFFICULTY_RANGE: Record<string, { min: number; max: number }> = {
  budget: { min: 1, max: 3 },
  mid: { min: 1, max: 4 },
  premium: { min: 2, max: 5 },
};

// ============================================================
// 肤色 → 色系适配 (预留，目前使用默认分数)
// ============================================================
const SKIN_TONE_COLOR_MAP: Record<string, string[]> = {
  cool: ['#1A3C5E', '#4A6FA5', '#2C3E50', '#696969', '#87CEEB', '#B8C9D4'], // 冷色调友好
  warm: ['#C41E3A', '#8B4513', '#D2691E', '#DAA520', '#C4A35A', '#D4C5B9'], // 暖色调友好
  neutral: [],
  unknown: [],
};

// ============================================================
// 主匹配函数
// ============================================================
export function matchStyles(answers: OnboardingAnswers): StyleMatchResult[] {
  const bodyShape = deriveBodyShape(
    answers.height!,
    answers.weight!,
    answers.bust,
    answers.waist,
    answers.hip,
  );

  const results: StyleMatchResult[] = STYLES.map((style) => {
    const breakdown = {
      bodyShape: scoreBodyShape(style, bodyShape),        // 0-25
      preference: scorePreference(style, answers.preferredStyleIds), // 0-25
      difficulty: scoreDifficulty(style, answers.budget), // 0-20
      budget: scoreBudget(style, answers.budget),         // 0-15
      interests: scoreInterests(style, answers.interests), // 0-10
      skinTone: answers.photo ? 5 : 5, // AI 分析预留，暂给满分 (0-5)
    };

    const totalScore =
      breakdown.bodyShape +
      breakdown.preference +
      breakdown.difficulty +
      breakdown.budget +
      breakdown.interests +
      breakdown.skinTone;

    const reasons = buildReasons(style, breakdown, bodyShape);

    return {
      styleId: style.id,
      styleName: style.name,
      category: style.category,
      score: totalScore,
      matchReasons: reasons,
      matchBreakdown: breakdown,
    };
  });

  // 按分数降序排序，取 Top 8
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

// ============================================================
// 打分子函数
// ============================================================

/** 体型匹配 (0-25分) */
function scoreBodyShape(style: StyleCard, bodyShape: BodyShape): number {
  if (bodyShape === 'unknown') return 12;

  const compatible = BODY_SILHOUETTE_MAP[bodyShape] || [];
  const matches = style.silhouette.filter((s) =>
    compatible.some((c) => c.includes(s) || s.includes(c)),
  );

  const ratio = matches.length / Math.max(style.silhouette.length, 1);
  return Math.round(ratio * 25);
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

/** 难度匹配 (0-20分) */
function scoreDifficulty(style: StyleCard, budget: string | null): number {
  const range = BUDGET_DIFFICULTY_RANGE[budget || 'mid'];
  if (style.difficulty >= range.min && style.difficulty <= range.max) {
    return 20;
  }
  const dist = Math.min(
    Math.abs(style.difficulty - range.min),
    Math.abs(style.difficulty - range.max),
  );
  return Math.max(0, 20 - dist * 6);
}

/** 预算匹配 (0-15分) — 质感主义/色彩美学/休闲度假类在任何预算下都容易实现 */
const BUDGET_FRIENDLY_CATEGORIES = new Set(['质感主义', '色彩美学', '休闲度假', '运动休闲']);
function scoreBudget(style: StyleCard, budget: string | null): number {
  if (!budget) return 8;
  if (BUDGET_FRIENDLY_CATEGORIES.has(style.category)) return 15;

  const difficultyBonus: Record<string, number> = {
    budget:  style.difficulty <= 2 ? 15 : style.difficulty <= 3 ? 10 : 5,
    mid:     style.difficulty <= 3 ? 15 : style.difficulty <= 4 ? 12 : 8,
    premium: style.difficulty <= 4 ? 15 : 15,
  };
  return difficultyBonus[budget] || 10;
}

/** 兴趣匹配 (0-10分) */
function scoreInterests(style: StyleCard, interests: string[]): number {
  if (interests.length === 0) return 5;

  let hits = 0;
  for (const interest of interests) {
    const related = INTEREST_STYLE_MAP[interest] || [];
    if (related.includes(style.id)) hits++;
  }

  const ratio = hits / interests.length;
  return Math.round(ratio * 10);
}

// ============================================================
// 辅助函数
// ============================================================

function buildReasons(
  style: StyleCard,
  breakdown: StyleMatchResult['matchBreakdown'],
  _bodyShape: BodyShape,
): string[] {
  const reasons: string[] = [];

  if (breakdown.bodyShape >= 20) {
    reasons.push('廓形高度适配你的体型');
  } else if (breakdown.bodyShape >= 12) {
    reasons.push('廓形与你的体型较为适配');
  }

  if (breakdown.preference >= 20) {
    reasons.push('符合你偏好的风格方向');
  } else if (breakdown.preference >= 15) {
    reasons.push('与你偏好的风格有相似调性');
  }

  if (breakdown.difficulty >= 15) {
    reasons.push('入门难度适合你当前阶段');
  } else if (breakdown.difficulty >= 10) {
    reasons.push('有一定的挑战性，值得尝试');
  }

  if (breakdown.budget >= 12) {
    reasons.push('在你的预算范围内容易实现');
  }

  if (breakdown.interests >= 7) {
    reasons.push('与你的兴趣爱好场景契合');
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
