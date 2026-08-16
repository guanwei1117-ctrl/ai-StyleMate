import { Injectable, Logger } from '@nestjs/common';
import {
  ShoppingLinkProvider,
  ShoppingLinkQuery,
  ShoppingLinkResult,
} from './shopping-link-provider.interface';
import { buildSearchQuery } from './search-query.builder';

/**
 * 淘宝搜索深链 Provider（默认，无需 API Key）
 *
 * - webUrl：淘宝网页搜索（始终可用，兜底）
 * - deepLink：taobao:// 唤起淘宝 App 搜索（移动端优先，App 未装时前端回退网页）
 */
@Injectable()
export class TaobaoDeepLinkProvider implements ShoppingLinkProvider {
  readonly platform = 'taobao' as const;
  readonly isConfigured = true;
  private readonly logger = new Logger(TaobaoDeepLinkProvider.name);

  async getLinks(query: ShoppingLinkQuery): Promise<ShoppingLinkResult> {
    const keyword = buildSearchQuery(query);
    if (!keyword) {
      throw new Error('单品信息不足，无法生成搜索词');
    }
    const q = encodeURIComponent(keyword);
    this.logger.log(`生成淘宝搜索深链 | 关键词: ${keyword}`);
    return {
      platform: 'taobao',
      mode: 'deep-link',
      query: keyword,
      deepLink: `taobao://s.taobao.com/search?q=${q}`,
      webUrl: `https://s.taobao.com/search?q=${q}`,
    };
  }
}
