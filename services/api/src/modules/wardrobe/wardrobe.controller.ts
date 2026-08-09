import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { DbRequiredGuard } from '../../common/guards/db-required.guard';
import { WardrobeService } from './wardrobe.service';
import { validateImageDataUrl } from '../scoring/image-data-url.validator';
import { AiRateLimiter } from '../scoring/ai-rate-limiter';

@ApiTags('衣橱管理')
@UseGuards(DbRequiredGuard)
@Controller('wardrobe')
export class WardrobeController {
  private readonly logger = new Logger(WardrobeController.name);

  constructor(
    private readonly wardrobeService: WardrobeService,
    private readonly aiRateLimiter: AiRateLimiter,
  ) {}

  // --- 衣物 ---

  @Post('items/recognize')
  @ApiOperation({ summary: 'AI 识别衣物图片并落库' })
  async recognizeAndAddItem(
    @Body() body: { userId: string; imageBase64: string; imageUrls?: string[] },
    @Req() req: Request,
  ) {
    this.assertAiRequestAllowed(req);
    validateImageDataUrl(body.imageBase64, 'imageBase64');
    this.logger.log(`收到衣物识别请求 | userId: ${body.userId}`);
    return this.wardrobeService.recognizeAndAddItem(
      body.userId,
      body.imageBase64,
      body.imageUrls,
    );
  }

  @Post('items')
  @ApiOperation({ summary: '添加衣物（手动录入）' })
  addItem(@Body() body: Record<string, unknown>) {
    return this.wardrobeService.addItem(body);
  }

  @Get('items')
  @ApiOperation({ summary: '获取用户衣物列表' })
  getUserItems(
    @Query('userId') userId: string,
    @Query('category') category?: string,
  ) {
    return this.wardrobeService.getUserItems(userId, category);
  }

  @Get('items/:id')
  @ApiOperation({ summary: '获取衣物详情' })
  getItemById(@Param('id') id: string) {
    return this.wardrobeService.getItemById(id);
  }

  @Put('items/:id')
  @ApiOperation({ summary: '更新衣物信息' })
  updateItem(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.wardrobeService.updateItem(id, body);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '删除衣物' })
  deleteItem(@Param('id') id: string) {
    return this.wardrobeService.deleteItem(id);
  }

  @Post('items/:id/wear')
  @ApiOperation({ summary: '记录穿着次数 +1' })
  wearItem(@Param('id') id: string) {
    return this.wardrobeService.incrementWearCount(id);
  }

  // --- 搭配 ---
  @Post('outfits')
  @ApiOperation({ summary: '创建搭配' })
  createOutfit(@Body() body: Record<string, unknown>) {
    return this.wardrobeService.createOutfit(body);
  }

  @Get('outfits')
  @ApiOperation({ summary: '获取用户搭配列表' })
  getUserOutfits(@Query('userId') userId: string) {
    return this.wardrobeService.getUserOutfits(userId);
  }

  @Get('outfits/:id')
  @ApiOperation({ summary: '获取搭配详情' })
  getOutfitById(@Param('id') id: string) {
    return this.wardrobeService.getOutfitById(id);
  }

  @Delete('outfits/:id')
  @ApiOperation({ summary: '删除搭配' })
  deleteOutfit(@Param('id') id: string) {
    return this.wardrobeService.deleteOutfit(id);
  }

  private assertAiRequestAllowed(req: Request): void {
    const forwardedFor = req.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0];
    const key =
      forwardedIp?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
    this.aiRateLimiter.assertAllowed(key);
  }
}
