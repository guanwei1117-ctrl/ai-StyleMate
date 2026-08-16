import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  ShoppingLinkProvider,
  ShoppingLinkQuery,
  ShoppingLinkResult,
  ShoppingPlatform,
} from './shopping-link-provider.interface';
import { TaobaoDeepLinkProvider } from './taobao-deep-link.provider';
import { TaobaoAffiliateProvider } from './taobao-affiliate.provider';

/**
 * 电商导购服务 — Provider 注册表 + 回退策略
 *
 * 选择逻辑：
 *  1. 平台有联盟 Provider 且已配置（AppKey 齐全）→ 优先联盟（真实商品卡 + 佣金链接）；
 *  2. 联盟未配置或调用失败 → 自动回退 DeepLink（预填关键词的平台搜索页）；
 *  3. 两者都失败 → 抛出明确错误。
 *
 * 新增平台（京东/拼多多）：实现 ShoppingLinkProvider + 注册到 providerMap 即可。
 */
@Injectable()
export class ShoppingService {
  private readonly logger = new Logger(ShoppingService.name);
  private readonly providerMap: Map<ShoppingPlatform, ShoppingLinkProvider[]>;

  constructor(
    private readonly taobaoDeepLink: TaobaoDeepLinkProvider,
    private readonly taobaoAffiliate: TaobaoAffiliateProvider,
  ) {
    // 每个平台按优先级排列：[联盟, 深链兜底]
    this.providerMap = new Map<ShoppingPlatform, ShoppingLinkProvider[]>();
    this.providerMap.set('taobao', [taobaoAffiliate, taobaoDeepLink]);
  }

  async getLinks(
    platform: ShoppingPlatform,
    item: ShoppingLinkQuery,
  ): Promise<ShoppingLinkResult> {
    if (!item || typeof item !== 'object') {
      throw new BadRequestException('缺少单品信息');
    }
    if (!item.category) {
      throw new BadRequestException('单品信息缺少品类 category');
    }

    const providers = this.providerMap.get(platform);
    if (!providers || providers.length === 0) {
      throw new BadRequestException(`暂不支持的平台: ${platform}`);
    }

    for (const provider of providers) {
      if (!provider.isConfigured) {
        this.logger.debug(`${provider.platform} ${provider.constructor.name} 未配置，跳过`);
        continue;
      }
      try {
        const result = await provider.getLinks(item);
        this.logger.log(
          `导购链接生成成功 | 平台: ${platform} | 模式: ${result.mode} | 关键词: ${result.query}`,
        );
        return result;
      } catch (err) {
        this.logger.warn(
          `${provider.constructor.name} 调用失败，尝试下一级: ${err instanceof Error ? err.message : String(err)}`,
        );
        // 继续尝试下一级 Provider（深链兜底）
      }
    }

    throw new BadRequestException('导购链接生成失败，请稍后重试');
  }
}
