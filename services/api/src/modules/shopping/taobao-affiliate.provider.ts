import { Injectable, Logger } from '@nestjs/common';
import {
  ShoppingLinkProvider,
  ShoppingLinkQuery,
  ShoppingLinkResult,
  ShoppingLinkProduct,
} from './shopping-link-provider.interface';
import { buildSearchQuery } from './search-query.builder';
import { signTaobaoParams, taobaoTimestamp } from './taobao-sign';

/**
 * 淘宝客联盟 Provider（taobao.tbk.dg.material.optional 物料搜索）
 *
 * 激活条件（.env）：
 *   TAOBAO_APP_KEY     — 淘宝联盟 AppKey
 *   TAOBAO_APP_SECRET  — AppSecret
 *   TAOBAO_ADZONE_ID   — 推广位 PID（adzone_id）
 *
 * 未配置时 isConfigured=false，ShoppingService 自动回退 DeepLink；
 * 配置后调用失败（限流/网络）同样由 Service 回退 DeepLink，保证可用性。
 */
@Injectable()
export class TaobaoAffiliateProvider implements ShoppingLinkProvider {
  readonly platform = 'taobao' as const;
  private readonly logger = new Logger(TaobaoAffiliateProvider.name);

  private static readonly API_URL = 'https://gw-api.taobao.com/router/rest';
  private static readonly METHOD = 'taobao.tbk.dg.material.optional';

  get isConfigured(): boolean {
    return Boolean(
      process.env.TAOBAO_APP_KEY &&
      process.env.TAOBAO_APP_SECRET &&
      process.env.TAOBAO_ADZONE_ID,
    );
  }

  async getLinks(query: ShoppingLinkQuery): Promise<ShoppingLinkResult> {
    if (!this.isConfigured) {
      throw new Error('淘宝联盟未配置（缺少 TAOBAO_APP_KEY/SECRET/ADZONE_ID）');
    }

    const keyword = buildSearchQuery(query);
    if (!keyword) {
      throw new Error('单品信息不足，无法生成搜索词');
    }

    const appKey = process.env.TAOBAO_APP_KEY!;
    const appSecret = process.env.TAOBAO_APP_SECRET!;
    const adzoneId = process.env.TAOBAO_ADZONE_ID!;

    const params: Record<string, string> = {
      method: TaobaoAffiliateProvider.METHOD,
      app_key: appKey,
      timestamp: taobaoTimestamp(),
      format: 'json',
      v: '2.0',
      sign_method: 'md5',
      adzone_id: adzoneId,
      q: keyword,
      page_size: '8',
      page_no: '1',
    };
    params.sign = signTaobaoParams(params, appSecret);

    const body = new URLSearchParams(params).toString();
    this.logger.log(`调用淘宝客物料搜索 | 关键词: ${keyword}`);

    const res = await fetch(TaobaoAffiliateProvider.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new Error(`淘宝客接口返回 ${res.status}`);
    }

    const data = (await res.json()) as any;
    const response = data?.tbk_dg_material_optional_response;
    if (response?.error_response) {
      throw new Error(
        `淘宝客接口错误: ${response.error_response.sub_msg ?? response.error_response.msg ?? '未知'}`,
      );
    }

    const mapData: any[] = response?.result_list?.map_data ?? [];
    const products: ShoppingLinkProduct[] = mapData.map((item: any) => ({
      title: String(item.title ?? ''),
      price: item.zk_final_price != null ? String(item.zk_final_price) : undefined,
      imageUrl: item.pict_url ? String(item.pict_url) : undefined,
      // 淘宝客 item_url 可能是 http，统一转 https
      itemUrl: String(item.item_url ?? '').replace(/^http:\/\//, 'https://'),
    }));

    this.logger.log(`淘宝客商品搜索完成 | 商品数: ${products.length}`);

    return {
      platform: 'taobao',
      mode: 'affiliate-api',
      query: keyword,
      webUrl: `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`,
      products,
      note: '已启用淘宝联盟返利，购买后你也会获得推广收益',
    };
  }
}
