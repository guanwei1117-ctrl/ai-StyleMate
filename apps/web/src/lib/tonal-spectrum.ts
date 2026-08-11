/**
 * 五维视觉调性光谱定义
 *
 * 每个风格大类 + 每个子风格都有一个五维调性向量 [曲直, 繁简, 色彩, 正式, 年代]
 * 用于计算风格之间的调性距离，过滤调性相冲的推荐。
 *
 * 维度说明：
 *   curve（曲直度）：1=曲线/柔和/甜美 → 5=直线/硬朗/冷峻
 *   complexity（繁简度）：1=极简/素净 → 5=极繁/华丽
 *   saturation（色彩饱和度）：1=低饱和/大地色 → 5=高饱和/亮色/撞色
 *   formality（正式度）：1=休闲/随意 → 5=正式/精致
 *   era（年代感）：1=经典/传统/复古 → 5=前卫/未来感
 */

import type { TonalVector, StyleCategoryId } from './scoring-types';

// ============================================================
// 8 大类的调性坐标
// ============================================================
export const CATEGORY_TONAL_VECTORS: Record<StyleCategoryId, TonalVector> = {
  // 简约质感类：直线、极简、低饱和、偏正式、经典
  minimal_quality: [4, 1, 2, 4, 2],
  // 浪漫柔和类：曲线、偏简、中低饱和、偏休闲、经典
  romantic_soft: [2, 2, 2, 2, 2],
  // 街头潮流类：直线、偏繁、中高饱和、休闲、前卫
  street_trendy: [4, 3, 4, 1, 4],
  // 职场通勤类：适中、偏简、中低饱和、正式、经典
  workplace: [3, 2, 2, 5, 2],
  // 个性暗黑类：直线、偏繁、低饱和、偏休闲、前卫
  dark_alternative: [5, 4, 1, 2, 4],
  // 运动户外类：适中、偏简、中饱和、休闲、现代
  sport_outdoor: [3, 1, 3, 1, 3],
  // 复古文艺类：偏曲、偏繁、中低饱和、偏休闲、复古
  vintage_artistic: [2, 3, 2, 2, 1],
  // 华丽表现类：曲线、极繁、高饱和、偏正式、前卫
  glamorous: [1, 5, 5, 4, 4],
};

// ============================================================
// 各子风格的五维调性坐标
// （根据风格描述、philosophy、色板、关键词综合推断）
// ============================================================
export const STYLE_TONAL_VECTORS: Record<string, TonalVector> = {
  // ===== 简约质感类 =====
  minimalist:       [4, 1, 1, 4, 2],
  nordic_minimal:   [4, 1, 1, 4, 3],
  cn_old_money:     [3, 2, 2, 5, 1],
  jp_zen:           [3, 1, 1, 3, 2],
  kr_effortless:    [3, 2, 2, 3, 3],
  cafe_lounge:      [2, 1, 2, 1, 2],
  artisan_zen:      [3, 2, 1, 2, 2],
  grey_tonal:       [4, 1, 1, 4, 3],
  zen_healing:      [2, 1, 1, 1, 2],

  // ===== 浪漫柔和类 =====
  fr_effortless:    [2, 2, 2, 3, 2],
  fr_countryside:   [1, 2, 3, 1, 2],
  jp_sweet:         [1, 3, 3, 2, 2],
  princess_core:    [1, 4, 3, 4, 2],
  white_moonlight:  [1, 1, 1, 2, 2],
  prairie_girl:     [1, 2, 2, 2, 1],
  mori_girl:        [2, 2, 1, 1, 1],
  maillard:         [3, 2, 2, 3, 2],
  cn_new_chinese:   [3, 2, 2, 4, 3],

  // ===== 街头潮流类 =====
  us_street:        [4, 3, 4, 1, 4],
  kr_street:        [4, 3, 5, 1, 4],
  jp_harajuku:      [4, 5, 5, 1, 5],
  sweet_cool:       [3, 3, 3, 2, 3],
  copenhagen:       [4, 3, 5, 1, 5],
  tomboy:           [5, 2, 3, 1, 3],
  dopamine:         [3, 3, 5, 1, 4],
  genderless:       [4, 2, 2, 3, 4],
  us_prep_vintage:  [4, 2, 3, 2, 2],

  // ===== 职场通勤类 =====
  uk_preppy:        [3, 2, 2, 4, 2],
  office_boss:      [3, 2, 2, 5, 2],
  flight_attendant: [3, 2, 2, 5, 2],
  dandy_femme:      [4, 2, 2, 5, 2],
  intellectual:     [3, 2, 1, 3, 2],
  chaebol_daughter: [2, 3, 2, 4, 3],

  // ===== 个性暗黑类 =====
  uk_punk:          [5, 4, 3, 2, 4],
  gothic:           [4, 4, 1, 3, 3],
  matrix_agent:     [5, 1, 1, 3, 4],
  wasteland_survivor: [5, 5, 2, 1, 5],
  rock_star:        [5, 3, 2, 2, 3],
  villainess:       [4, 4, 3, 4, 3],
  avant_garde:      [5, 5, 3, 3, 5],

  // ===== 运动户外类 =====
  athleisure:       [3, 1, 3, 1, 3],
  us_western:       [4, 2, 3, 2, 1],
  hk_retro:         [3, 3, 3, 3, 1],
  siren:            [1, 3, 3, 3, 3],

  // ===== 复古文艺类 =====
  vintage_lover:    [3, 3, 3, 2, 1],
  film_retro:       [2, 3, 2, 2, 1],
  bohemian:         [2, 4, 3, 1, 2],
  hippie:           [2, 3, 4, 1, 1],
  lolita:           [1, 5, 4, 4, 2],
  gatsby:           [2, 5, 4, 5, 1],
  dior_new_look:    [1, 4, 3, 5, 1],
  fairy_elf:        [1, 4, 2, 2, 4],

  // ===== 华丽表现类 =====
  party_queen:      [1, 5, 5, 4, 4],
  kpop_stage:       [2, 5, 5, 3, 5],
  it_passione:      [1, 4, 5, 4, 3],
  latina_fiesta:    [1, 4, 5, 3, 3],
  maximalist:       [3, 5, 5, 3, 4],
};

// ============================================================
// 调性距离计算工具
// ============================================================

/**
 * 计算两个五维调性向量之间的欧几里得距离
 * 最大可能距离 = sqrt( (5-1)² x 5 ) = sqrt(80) ~ 8.94
 * 调性相冲阈值：距离 >= 3.0
 */
export function tonalDistance(a: TonalVector, b: TonalVector): number {
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

/**
 * 判断两个调性向量是否相容（距离小于阈值）
 * @param threshold 默认 3.0
 */
export function isTonalCompatible(a: TonalVector, b: TonalVector, threshold = 3.0): boolean {
  return tonalDistance(a, b) < threshold;
}

/**
 * 获取一个风格的五维调性向量
 * 如果风格 ID 未定义，返回大类默认向量
 */
export function getStyleTonalVector(
  styleId: string,
  categoryId?: StyleCategoryId,
): TonalVector {
  const styleVec = STYLE_TONAL_VECTORS[styleId];
  if (styleVec) return styleVec;
  if (categoryId) return CATEGORY_TONAL_VECTORS[categoryId];
  return [3, 3, 3, 3, 3]; // 默认中位向量
}