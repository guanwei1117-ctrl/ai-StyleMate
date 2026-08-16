import { CATEGORY_LABELS, ClothingCategory } from '@stylemate/shared';
import type {
  ShoppingLinkQuery,
  ShoppingProfileContext,
} from './shopping-link-provider.interface';

/**
 * 搜索词工程 — StyleMate 电商导购的核心价值
 *
 * 平台搜索 API / 搜索页只是执行者，关键词才是精准度的来源。
 * 这里把结构化单品数据（品类+颜色+风格+预算+场景）与用户个人画像
 * （适合风格/体型/身高/目标/预算）拼成"贴合这个人"的搜索词，
 * 避免"缺什么买什么"的泛搜索。
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

/** 搜索词数量上限（避免过长导致淘宝搜索失焦） */
const MAX_QUERY_PARTS = 7;

/** 预算档位 → 搜索词 */
function budgetKeyword(
  budgetRange?: string,
  budgetLevel?: ShoppingProfileContext['budgetLevel'],
): string | undefined {
  if (budgetRange) {
    const nums = budgetRange.match(/\d+/g);
    if (nums && nums.length > 0) {
      const min = Number(nums[0]);
      const max = nums.length > 1 ? Number(nums[1]) : min;
      if (max <= 200) return '平价';
      if (min >= 600) return '轻奢';
      return undefined;
    }
  }
  // 单品没有预算区间时，用画像预算档位兜底
  if (budgetLevel === 'budget') return '平价';
  if (budgetLevel === 'premium') return '轻奢';
  return undefined;
}

/** 体型 → 修饰词（按品类区分，避免给鞋子配"高腰"） */
const BODY_FIT_BOTTOM: Record<NonNullable<ShoppingProfileContext['bodyShape']>, string> = {
  pear: '高腰',
  apple: '高腰',
  hourglass: '收腰',
  rectangle: '直筒',
  inverted_triangle: 'A字',
};
const BODY_FIT_TOP: Record<NonNullable<ShoppingProfileContext['bodyShape']>, string> = {
  pear: '显瘦',
  apple: '显瘦',
  hourglass: '收腰',
  rectangle: '廓形',
  inverted_triangle: 'V领',
};

/** 穿搭目标（中文标签）→ 搜索词 */
function goalKeyword(goals: string[]): string | undefined {
  const text = goals.join('、');
  if (/显瘦|显高/.test(text)) return '显瘦';
  if (/得体|精致|优雅/.test(text)) return '质感';
  if (/个性|独特/.test(text)) return '设计感';
  if (/职场|专业|通勤/.test(text)) return '通勤';
  return undefined;
}

/** 从画像提取风格关键词（适合风格 + 喜好关键词，过滤泛词与避雷词） */
function profileStyleKeywords(profile?: ShoppingProfileContext): string[] {
  if (!profile) return [];
  const disliked = new Set((profile.dislikedKeywords ?? []).map((k) => k.trim()));
  return [
    ...(profile.suitableStyles ?? []),
    ...(profile.likedKeywords ?? []),
  ]
    .map((s) => s.trim())
    .filter(
      (s) =>
        s &&
        s.length <= 4 && // 过长词组不进搜索词
        !GENERIC_STYLE_TAGS.has(s) &&
        !disliked.has(s),
    );
}

/**
 * 构建平台搜索关键词
 *
 * 顺序：颜色 + 子类（或品类中文名）+ 单品风格标签 + 画像风格 + 身材修饰 + 小个子 + 目标词 + 预算词 + 场景词
 * 总数上限 MAX_QUERY_PARTS，去重。
 */
export function buildSearchQuery(input: ShoppingLinkQuery): string {
  const parts: string[] = [];
  const add = (value?: string) => {
    if (value && value.trim() && !parts.includes(value.trim())) {
      parts.push(value.trim());
    }
  };

  const profile = input.profile;

  // 颜色
  add(input.color);

  // 子类 / 品类
  const sub = input.subCategory?.trim();
  if (sub) {
    add(sub);
  } else if (input.category) {
    add(CATEGORY_LABELS[input.category as ClothingCategory] ?? input.category);
  }

  // 单品自带风格标签：过滤泛词，最多 2 个
  const disliked = new Set((profile?.dislikedKeywords ?? []).map((k) => k.trim()));
  const itemTags = (input.styleTags ?? [])
    .map((t) => t.trim())
    .filter((t) => t && !GENERIC_STYLE_TAGS.has(t) && !disliked.has(t))
    .slice(0, 2);
  itemTags.forEach(add);

  // 画像风格：补足到风格词合计 3 个
  const styleBudget = Math.max(0, 3 - itemTags.length);
  profileStyleKeywords(profile).slice(0, styleBudget).forEach(add);

  // 身材修饰词（只对相关品类）
  if (profile?.bodyShape) {
    const fit =
      input.category === 'bottom' || input.category === 'dress'
        ? BODY_FIT_BOTTOM[profile.bodyShape]
        : input.category === 'top' || input.category === 'outerwear'
          ? BODY_FIT_TOP[profile.bodyShape]
          : undefined;
    add(fit);
  }

  // 小个子（仅服装品类）
  if (
    profile?.heightCm != null &&
    profile.heightCm > 0 &&
    profile.heightCm < 158 &&
    ['top', 'bottom', 'dress', 'outerwear'].includes(input.category)
  ) {
    add('小个子');
  }

  // 穿搭目标词
  if (profile?.dressingGoals?.length) {
    add(goalKeyword(profile.dressingGoals));
  }

  // 预算词
  add(budgetKeyword(input.budgetRange, profile?.budgetLevel));

  // 场景词
  const occasion = input.occasion?.trim();
  if (occasion) {
    add(OCCASION_KEYWORDS[occasion] ?? occasion);
  }

  return parts.slice(0, MAX_QUERY_PARTS).join(' ');
}
