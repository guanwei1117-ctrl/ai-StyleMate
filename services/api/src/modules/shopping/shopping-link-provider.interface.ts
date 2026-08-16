/**
 * 电商导购 Provider 架构
 *
 * 目标：把"该买什么"变成"一键去找"。
 *
 * 两级实现：
 *  1. DeepLinkProvider — 无需任何 API Key，跳转平台搜索页并预填精准关键词；
 *  2. AffiliateProvider — 配置联盟 AppKey/Secret 后，调用平台商品搜索 API，
 *     返回真实商品卡（标题/图片/价格/佣金链接）。
 *
 * 平台注册表按 platform 选择实现；联盟 Provider 未配置或调用失败时
 * 自动回退到 DeepLink，保证功能永远可用。
 */

export type ShoppingPlatform = 'taobao';

/** 生成搜索链接所需的单品信息（来自购物清单/缺口建议/起步方案） */
export interface ShoppingLinkQuery {
  /** 品类 key（top/outerwear/bottom/dress/shoes/bag/hat/accessory） */
  category: string;
  /** 二级子类（如"阔腿裤""托特包"） */
  subCategory?: string;
  /** 颜色 */
  color?: string;
  /** 风格标签 */
  styleTags?: string[];
  /** 预算区间（如"¥200-400"） */
  budgetRange?: string;
  /** 场景（如"通勤"） */
  occasion?: string;
}

/** 联盟模式下的真实商品卡 */
export interface ShoppingLinkProduct {
  title: string;
  /** 券后价（元，字符串保留原始格式） */
  price?: string;
  imageUrl?: string;
  /** 可购买链接（佣金链接） */
  itemUrl: string;
}

export interface ShoppingLinkResult {
  platform: ShoppingPlatform;
  /** deep-link：搜索深链兜底；affiliate-api：联盟商品搜索 */
  mode: 'deep-link' | 'affiliate-api';
  /** 拼好的搜索关键词 */
  query: string;
  /** App 深链（唤起淘宝 App 搜索） */
  deepLink?: string;
  /** 网页版搜索链接（始终可用，兜底） */
  webUrl: string;
  /** affiliate 模式下的商品卡列表 */
  products?: ShoppingLinkProduct[];
  /** 展示用提示（如"已启用联盟返利"） */
  note?: string;
}

export interface ShoppingLinkProvider {
  readonly platform: ShoppingPlatform;
  /** 是否为联盟模式（配置了 API Key） */
  readonly isConfigured: boolean;
  /**
   * 生成搜索链接/商品卡
   * @throws 失败时抛出，由 ShoppingService 决定是否回退 DeepLink
   */
  getLinks(query: ShoppingLinkQuery): Promise<ShoppingLinkResult>;
}
