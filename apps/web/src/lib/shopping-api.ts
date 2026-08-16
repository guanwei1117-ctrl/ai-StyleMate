/**
 * 电商导购 — 前端 API 与深链打开逻辑
 *
 * 所有搜索请求自动附带本地风格档案画像（适合风格/喜好关键词/避雷词/体型/身高/目标/预算），
 * 让淘宝搜索词贴合"这个人"，而不是只按缺什么搜什么。
 */

import { loadStyleProfile } from './style-profile-storage';

export interface ShoppingProfileContext {
  suitableStyles?: string[];
  likedKeywords?: string[];
  dislikedKeywords?: string[];
  dressingGoals?: string[];
  bodyShape?: 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted_triangle';
  heightCm?: number;
  budgetLevel?: 'budget' | 'mid' | 'premium';
}

export interface ShoppingLinkQuery {
  category: string;
  subCategory?: string;
  color?: string;
  styleTags?: string[];
  budgetRange?: string;
  occasion?: string;
  profile?: ShoppingProfileContext;
}

export interface ShoppingLinkProduct {
  title: string;
  price?: string;
  imageUrl?: string;
  itemUrl: string;
}

export interface ShoppingLinkResult {
  platform: 'taobao';
  mode: 'deep-link' | 'affiliate-api';
  query: string;
  deepLink?: string;
  webUrl: string;
  products?: ShoppingLinkProduct[];
  note?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * 从本地风格档案构建画像上下文（未测评返回 undefined）
 */
export function buildShoppingProfileContext(): ShoppingProfileContext | undefined {
  const profile = loadStyleProfile();
  if (!profile) return undefined;

  // 适合的风格：测评 Top 结果（按分数排序取前 3）+ 用户自选偏好风格
  const topStyles = [...(profile.results ?? [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.styleName)
    .filter(Boolean);

  // 预算档位：档案里存的是中文标签（平价/中等价位/轻奢），映射回 level
  const budgetLabel = profile.answersSummary.budget ?? '';
  const budgetLevel: ShoppingProfileContext['budgetLevel'] = /平价|实惠|学生/.test(budgetLabel)
    ? 'budget'
    : /轻奢|高端|大牌/.test(budgetLabel)
      ? 'premium'
      : undefined;

  return {
    suitableStyles: [...new Set([...topStyles, ...(profile.answersSummary.preferredStyles ?? [])])],
    likedKeywords: profile.extractedIntent?.likedKeywords ?? [],
    dislikedKeywords: profile.extractedIntent?.dislikedKeywords ?? [],
    dressingGoals: profile.answersSummary.dressingGoals ?? [],
    bodyShape:
      profile.bodyShape && profile.bodyShape !== 'unknown'
        ? profile.bodyShape
        : undefined,
    heightCm: profile.answersSummary.height ?? undefined,
    budgetLevel,
  };
}

/**
 * 获取导购链接/商品卡（后端自动选择联盟或深链模式）
 *
 * 自动附带本地风格档案画像，无需调用方重复构造。
 */
export async function fetchShoppingLinks(
  item: ShoppingLinkQuery,
): Promise<ShoppingLinkResult> {
  const body: { platform: string; item: ShoppingLinkQuery } = {
    platform: 'taobao',
    item: {
      ...item,
      profile: item.profile ?? buildShoppingProfileContext(),
    },
  };

  const res = await fetch(`${API_BASE}/shopping/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '生成导购链接失败' }));
    throw new Error(err.message || '生成导购链接失败');
  }
  return res.json();
}

/**
 * 打开导购链接：
 * - 联盟模式（有商品卡）→ 直接打开第一个商品的购买链接
 * - 深链模式：移动端先尝试唤起淘宝 App（taobao://），1.2 秒内页面被切走
 *   则视为成功；否则回退打开网页版搜索页。桌面端直接打开网页版。
 */
export function openShoppingLink(result: ShoppingLinkResult): void {
  if (result.mode === 'affiliate-api' && result.products && result.products.length > 0) {
    window.open(result.products[0].itemUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const webUrl = result.webUrl;
  if (!webUrl) return;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile || !result.deepLink) {
    window.open(webUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // 移动端：先试 App 深链，页面失焦则不再回退
  let appOpened = false;
  const markOpened = () => {
    if (document.visibilityState === 'hidden') appOpened = true;
  };
  document.addEventListener('visibilitychange', markOpened);
  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', markOpened);
    if (!appOpened) window.location.href = webUrl;
  }, 1200);
  window.location.href = result.deepLink!;
}
