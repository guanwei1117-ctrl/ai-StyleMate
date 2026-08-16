import { CATEGORY_LABELS, ClothingCategory } from '@stylemate/shared';
import type { ShoppingLinkQuery } from './shopping-link-provider.interface';

/**
 * 搜索词工程 — StyleMate 电商导购的核心价值
 *
 * 平台搜索 API / 搜索页只是执行者，关键词才是精准度的来源。
 * 这里把结构化单品数据（品类+颜色+风格+预算+场景）拼成用户
 * 自己想不到的高质量搜索词，避免"大数据广告"式的泛搜索。
 */

/** 值得保留进搜索词的风格标签（过滤"百搭/基础/日常"这类低信息量词） */
const GENERIC_STYLE_TAGS = new Set([
  '百搭', '基础', '基础款', '日常', '简约', '经典', '实穿', '舒适',
]);

/** 值得保留进搜索词的场景词 */
const OCCASION_KEYWORDS: Record<string, string> = {
  commute: '通勤', work: '职场', office: '职场', date: '约会',
  party: '派对', banquet: '宴会', travel: '度假', vacation: '度假',
  sport: '运动', casual: '休闲', interview: '面试',
};

/** 预算档位 → 搜索词 */
function budgetKeyword(budgetRange?: string): string | undefined {
  if (!budgetRange) return undefined;
  const nums = budgetRange.match(/\d+/g);
  if (!nums || nums.length === 0) return undefined;
  const min = Number(nums[0]);
  const max = nums.length > 1 ? Number(nums[1]) : min;
  if (max <= 200) return '平价';
  if (min >= 600) return '轻奢';
  return undefined;
}

/**
 * 构建平台搜索关键词
 *
 * 顺序：颜色 + 子类（或品类中文名）+ 风格标签（最多 2 个）+ 预算词 + 场景词
 */
export function buildSearchQuery(input: ShoppingLinkQuery): string {
  const parts: string[] = [];

  // 颜色
  if (input.color && input.color.trim()) {
    parts.push(input.color.trim());
  }

  // 子类 / 品类
  const sub = input.subCategory?.trim();
  if (sub) {
    parts.push(sub);
  } else if (input.category) {
    const label =
      CATEGORY_LABELS[input.category as ClothingCategory] ?? input.category;
    parts.push(label);
  }

  // 风格标签：过滤泛词，最多 2 个
  const styleTags = (input.styleTags ?? [])
    .map((t) => t.trim())
    .filter((t) => t && !GENERIC_STYLE_TAGS.has(t))
    .slice(0, 2);
  parts.push(...styleTags);

  // 预算词
  const budget = budgetKeyword(input.budgetRange);
  if (budget) parts.push(budget);

  // 场景词
  const occasion = input.occasion?.trim();
  if (occasion) {
    const mapped = OCCASION_KEYWORDS[occasion] ?? occasion;
    parts.push(mapped);
  }

  // 去重 + 拼接
  return [...new Set(parts)].join(' ');
}
