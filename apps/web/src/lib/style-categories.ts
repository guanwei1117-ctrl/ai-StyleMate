/**
 * 8 大风格大类分组定义
 *
 * 将现有 80 种风格归入 8 个大类，每个大类内视觉调性相近。
 * 一个大类下的子风格可能在具体表现上不同，但核心调性相容。
 */

import type { StyleCategoryId } from './scoring-types';

export interface CategoryGroup {
  id: StyleCategoryId;
  name: string;
  description: string;
  /** 属于该大类的风格 ID 列表 */
  styleIds: string[];
}

/**
 * 8 大类分组定义
 *
 * 分配逻辑：
 * - 简约质感类：以 minimal、quality、clean、timeless 为核心调性的风格
 * - 浪漫柔和类：以 soft、romantic、feminine、sweet 为核心调性的风格
 * - 街头潮流类：以 street、urban、trendy、youth 为核心调性的风格
 * - 职场通勤类：以 professional、office、formal、preppy 为核心调性的风格
 * - 个性暗黑类：以 dark、edgy、alternative、gothic 为核心调性的风格
 * - 运动户外类：以 sporty、athletic、outdoor、functional 为核心调性的风格
 * - 复古文艺类：以 vintage、retro、artistic、bohemian 为核心调性的风格
 * - 华丽表现类：以 glamorous、luxe、dramatic、festive 为核心调性的风格
 */
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'minimal_quality',
    name: '简约质感类',
    description: '极简、高品质基础款，强调剪裁、面料和克制美学',
    styleIds: [
      'minimalist',
      'nordic_minimal',
      'cn_old_money',
      'jp_zen',
      'kr_effortless',
      'cafe_lounge',
      'artisan_zen',
      'grey_tonal',
      'zen_healing',
    ],
  },
  {
    id: 'romantic_soft',
    name: '浪漫柔和类',
    description: '温柔、浪漫、甜美、女性化的风格，色彩柔和线条圆润',
    styleIds: [
      'fr_effortless',
      'fr_countryside',
      'jp_sweet',
      'princess_core',
      'white_moonlight',
      'prairie_girl',
      'mori_girl',
      'maillard',
      'cn_new_chinese',
    ],
  },
  {
    id: 'street_trendy',
    name: '街头潮流类',
    description: '以街头文化为根基，强调个性表达、宽松廓形和潮流元素',
    styleIds: [
      'us_street',
      'kr_street',
      'jp_harajuku',
      'sweet_cool',
      'copenhagen',
      'tomboy',
      'dopamine',
      'genderless',
      'us_prep_vintage',
    ],
  },
  {
    id: 'workplace',
    name: '职场通勤类',
    description: '适合职场和正式场合，剪裁精良、色调中性、气质干练',
    styleIds: [
      'uk_preppy',
      'office_boss',
      'flight_attendant',
      'dandy_femme',
      'intellectual',
      'chaebol_daughter',
    ],
  },
  {
    id: 'dark_alternative',
    name: '个性暗黑类',
    description: '暗黑、硬朗、前卫、亚文化导向的风格，强调态度和辨识度',
    styleIds: [
      'uk_punk',
      'gothic',
      'matrix_agent',
      'wasteland_survivor',
      'rock_star',
      'villainess',
      'avant_garde',
    ],
  },
  {
    id: 'sport_outdoor',
    name: '运动户外类',
    description: '运动功能和休闲舒适结合，强调穿着场景的实用性和自由度',
    styleIds: [
      'athleisure',
      'us_western',
      'hk_retro',
      'siren',
    ],
  },
  {
    id: 'vintage_artistic',
    name: '复古文艺类',
    description: '怀旧、文艺、有故事感，从历史或艺术中汲取灵感的风格',
    styleIds: [
      'vintage_lover',
      'film_retro',
      'bohemian',
      'hippie',
      'lolita',
      'gatsby',
      'dior_new_look',
      'fairy_elf',
    ],
  },
  {
    id: 'glamorous',
    name: '华丽表现类',
    description: '华丽、闪耀、大胆表现，适合派对、舞台和需要成为焦点的场合',
    styleIds: [
      'party_queen',
      'kpop_stage',
      'it_passione',
      'latina_fiesta',
      'maximalist',
      'dior_new_look',
    ],
  },
];

/** 通过风格 ID 查询它属于哪个大类 */
export function findCategoryByStyleId(styleId: string): StyleCategoryId | null {
  for (const group of CATEGORY_GROUPS) {
    if (group.styleIds.includes(styleId)) {
      return group.id;
    }
  }
  return null;
}

/** 获取大类下包含的所有风格 ID */
export function getStyleIdsByCategory(categoryId: StyleCategoryId): string[] {
  const group = CATEGORY_GROUPS.find((g) => g.id === categoryId);
  return group?.styleIds ?? [];
}

/** 获取大类的中文名称 */
export function getCategoryName(categoryId: StyleCategoryId): string {
  const group = CATEGORY_GROUPS.find((g) => g.id === categoryId);
  return group?.name ?? categoryId;
}
