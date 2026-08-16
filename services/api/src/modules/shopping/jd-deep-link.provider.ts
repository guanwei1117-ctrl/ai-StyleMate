import { Injectable, Logger } from '@nestjs/common';
import {
  ShoppingLinkProvider,
  ShoppingLinkQuery,
  ShoppingLinkResult,
} from './shopping-link-provider.interface';
import { buildSearchQuery } from './search-query.builder';

/**
 * 京东搜索深链 Provider（无需 API Key）
 *
 * - webUrl：京东 PC 搜索页（始终可用，兜底）
 * - 移动端：打开京东移动搜索页（m.jd.com），App 深链方案不稳定，走网页最可靠
 */
@Injectable()
export class JdDeepLinkProvider implements ShoppingLinkProvider {
  readonly platform = 'jd' as const;
  readonly isConfigured = true;
  private readonly logger = new Logger(JdDeepLinkProvider.name);

  async getLinks(query: ShoppingLinkQuery): Promise<ShoppingLinkResult> {
    const keyword = buildSearchQuery(query);
    if (!keyword) {
      throw new Error('单品信息不足，无法生成搜索词');
    }
    const q = encodeURIComponent(keyword);
    this.logger.log(`生成京东搜索深链 | 关键词: ${keyword}`);
    return {
      platform: 'jd',
      mode: 'deep-link',
      query: keyword,
      webUrl: `https://search.jd.com/Search?keyword=${q}&enc=utf-8`,
    };
  }
}
