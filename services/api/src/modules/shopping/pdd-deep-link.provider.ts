import { Injectable, Logger } from '@nestjs/common';
import {
  ShoppingLinkProvider,
  ShoppingLinkQuery,
  ShoppingLinkResult,
} from './shopping-link-provider.interface';
import { buildSearchQuery } from './search-query.builder';

/**
 * 拼多多搜索深链 Provider（无需 API Key）
 *
 * - webUrl：拼多多移动搜索页（拼多多以移动端为主，桌面同样可打开）
 * - deepLink：pinduoduo:// 唤起 App 搜索（best-effort，前端带网页兜底）
 */
@Injectable()
export class PddDeepLinkProvider implements ShoppingLinkProvider {
  readonly platform = 'pdd' as const;
  readonly isConfigured = true;
  private readonly logger = new Logger(PddDeepLinkProvider.name);

  async getLinks(query: ShoppingLinkQuery): Promise<ShoppingLinkResult> {
    const keyword = buildSearchQuery(query);
    if (!keyword) {
      throw new Error('单品信息不足，无法生成搜索词');
    }
    const q = encodeURIComponent(keyword);
    this.logger.log(`生成拼多多搜索深链 | 关键词: ${keyword}`);
    return {
      platform: 'pdd',
      mode: 'deep-link',
      query: keyword,
      deepLink: `pinduoduo://com.xunmeng.pinduoduo/search_result.html?search_key=${q}`,
      webUrl: `https://mobile.yangkeduo.com/search_result.html?search_key=${q}`,
    };
  }
}
