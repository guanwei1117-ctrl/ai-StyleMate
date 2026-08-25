/**
 * 五维视觉调性光谱定义（从 Web 端复制）
 */
import type { TonalVector, StyleCategoryId } from '../types/scoring';

export const CATEGORY_TONAL_VECTORS: Record<StyleCategoryId, TonalVector> = {
  minimal_quality: [4, 1, 2, 4, 2],
  romantic_soft: [2, 2, 2, 2, 2],
  street_trendy: [4, 3, 4, 1, 4],
  workplace: [3, 2, 2, 5, 2],
  dark_alternative: [5, 4, 1, 2, 4],
  sport_outdoor: [3, 1, 3, 1, 3],
  vintage_artistic: [2, 3, 2, 2, 1],
  glamorous: [1, 5, 5, 4, 4],
};

export const STYLE_TONAL_VECTORS: Record<string, TonalVector> = {
  minimalist: [4, 1, 1, 4, 2],
  nordic_minimal: [4, 1, 1, 4, 3],
  cn_old_money: [3, 2, 2, 5, 1],
  jp_zen: [3, 1, 1, 3, 2],
  kr_effortless: [3, 2, 2, 3, 3],
  cafe_lounge: [2, 1, 2, 1, 2],
  artisan_zen: [3, 2, 1, 2, 2],
  grey_tonal: [4, 1, 1, 4, 3],
  zen_healing: [2, 1, 1, 1, 2],
  fr_effortless: [2, 2, 2, 3, 2],
  fr_countryside: [1, 2, 3, 1, 2],
  jp_sweet: [1, 3, 3, 2, 2],
  princess_core: [1, 4, 3, 4, 2],
  white_moonlight: [1, 1, 1, 2, 2],
  prairie_girl: [1, 2, 2, 2, 1],
  mori_girl: [2, 2, 1, 1, 1],
  maillard: [3, 2, 2, 3, 2],
  cn_new_chinese: [3, 2, 2, 4, 3],
  us_street: [4, 3, 4, 1, 4],
  kr_street: [4, 3, 5, 1, 4],
  jp_harajuku: [4, 5, 5, 1, 5],
  sweet_cool: [3, 3, 3, 2, 3],
  copenhagen: [4, 3, 5, 1, 5],
  tomboy: [5, 2, 3, 1, 3],
  dopamine: [3, 3, 5, 1, 4],
  genderless: [4, 2, 2, 3, 4],
  us_prep_vintage: [4, 2, 3, 2, 2],
  uk_preppy: [3, 2, 2, 4, 2],
  office_boss: [3, 2, 2, 5, 2],
  flight_attendant: [3, 2, 2, 5, 2],
  dandy_femme: [4, 2, 2, 5, 2],
  intellectual: [3, 2, 1, 3, 2],
  chaebol_daughter: [2, 3, 2, 4, 3],
  uk_punk: [5, 4, 3, 2, 4],
  gothic: [4, 4, 1, 3, 3],
  matrix_agent: [5, 1, 1, 3, 4],
  wasteland_survivor: [5, 5, 2, 1, 5],
  rock_star: [5, 3, 2, 2, 3],
  villainess: [4, 4, 3, 4, 3],
  avant_garde: [5, 5, 3, 3, 5],
  athleisure: [3, 1, 3, 1, 3],
  us_western: [4, 2, 3, 2, 1],
  hk_retro: [3, 3, 3, 3, 1],
  siren: [1, 3, 3, 3, 3],
  vintage_lover: [3, 3, 3, 2, 1],
  film_retro: [2, 3, 2, 2, 1],
  bohemian: [2, 4, 3, 1, 2],
  hippie: [2, 3, 4, 1, 1],
  lolita: [1, 5, 4, 4, 2],
  gatsby: [2, 5, 4, 5, 1],
  dior_new_look: [1, 4, 3, 5, 1],
  fairy_elf: [1, 4, 2, 2, 4],
  party_queen: [1, 5, 5, 4, 4],
  kpop_stage: [2, 5, 5, 3, 5],
  it_passione: [1, 4, 5, 4, 3],
  latina_fiesta: [1, 4, 5, 3, 3],
  maximalist: [3, 5, 5, 3, 4],
};

export function tonalDistance(a: TonalVector, b: TonalVector): number {
  let sum = 0;
  for (let i = 0; i < 5; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

export function isTonalCompatible(a: TonalVector, b: TonalVector, threshold = 3.0): boolean {
  return tonalDistance(a, b) < threshold;
}

export function getStyleTonalVector(styleId: string, categoryId?: StyleCategoryId): TonalVector {
  const styleVec = STYLE_TONAL_VECTORS[styleId];
  if (styleVec) return styleVec;
  if (categoryId) return CATEGORY_TONAL_VECTORS[categoryId];
  return [3, 3, 3, 3, 3];
}