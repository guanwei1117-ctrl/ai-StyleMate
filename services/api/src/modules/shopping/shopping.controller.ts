import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShoppingService } from './shopping.service';
import {
  ShoppingLinkQuery,
  ShoppingPlatform,
} from './shopping-link-provider.interface';

@ApiTags('电商导购')
@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  /**
   * 生成商品搜索链接/商品卡
   *
   * 联盟 API 已配置 → 返回真实商品卡（佣金链接）；
   * 未配置或失败 → 返回预填精准关键词的平台搜索深链。
   */
  @Post('links')
  @ApiOperation({ summary: '根据单品信息生成导购搜索链接（淘宝）' })
  async getLinks(
    @Body()
    body: {
      platform?: ShoppingPlatform;
      item: ShoppingLinkQuery;
    },
  ) {
    const platform: ShoppingPlatform = body.platform ?? 'taobao';
    return this.shoppingService.getLinks(platform, body.item);
  }
}
