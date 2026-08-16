import { Module } from '@nestjs/common';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { TaobaoDeepLinkProvider } from './taobao-deep-link.provider';
import { TaobaoAffiliateProvider } from './taobao-affiliate.provider';

/**
 * 电商导购模块 — 无数据库依赖，ENABLE_DB=false 时同样可用
 */
@Module({
  controllers: [ShoppingController],
  providers: [ShoppingService, TaobaoDeepLinkProvider, TaobaoAffiliateProvider],
  exports: [ShoppingService],
})
export class ShoppingModule {}
