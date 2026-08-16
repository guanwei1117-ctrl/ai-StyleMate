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
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { resolveUserId, getAuthedUserId } from '../../common/guards/resolve-user-id';
import { WardrobeService } from './wardrobe.service';
import { validateImageDataUrl } from '../scoring/image-data-url.validator';

@ApiTags('衣橱管理')
@UseGuards(DbRequiredGuard, OptionalAuthGuard)
@Controller('wardrobe')
export class WardrobeController {
  private readonly logger = new Logger(WardrobeController.name);

  constructor(private readonly wardrobeService: WardrobeService) {}

  // --- 衣物 ---

  @Post('items/recognize')
  @ApiOperation({ summary: 'AI 识别衣物图片并落库' })
  async recognizeAndAddItem(
    @Body() body: { userId: string; imageBase64: string; imageUrls?: string[] },
    @Req() req: Request,
  ) {
    validateImageDataUrl(body.imageBase64, 'imageBase64');
    const userId = resolveUserId(req, body.userId);
    this.logger.log(`收到衣物识别请求 | userId: ${userId}`);
    return this.wardrobeService.recognizeAndAddItem(
      userId,
      body.imageBase64,
      body.imageUrls,
    );
  }

  @Post('items')
  @ApiOperation({ summary: '添加衣物（手动录入）' })
  addItem(@Body() body: Record<string, unknown>, @Req() req: Request) {
    const userId = resolveUserId(req, typeof body.userId === 'string' ? body.userId : null);
    return this.wardrobeService.addItem({ ...body, userId });
  }

  @Get('items')
  @ApiOperation({ summary: '获取用户衣物列表' })
  getUserItems(
    @Query('userId') userId: string,
    @Query('category') category?: string,
    @Query('subCategory') subCategory?: string,
    @Req() req?: Request,
  ) {
    const resolved = resolveUserId(req!, userId);
    return this.wardrobeService.getUserItems(resolved, category, subCategory);
  }

  @Get('items/:id')
  @ApiOperation({ summary: '获取衣物详情' })
  getItemById(@Param('id') id: string, @Req() req?: Request) {
    return this.wardrobeService.getItemById(id, getAuthedUserId(req!));
  }

  @Put('items/:id')
  @ApiOperation({ summary: '更新衣物信息' })
  updateItem(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req?: Request,
  ) {
    return this.wardrobeService.updateItem(id, body, getAuthedUserId(req!));
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '删除衣物' })
  deleteItem(@Param('id') id: string, @Req() req?: Request) {
    return this.wardrobeService.deleteItem(id, getAuthedUserId(req!));
  }

  // --- 搭配 ---
  @Post('outfits')
  @ApiOperation({ summary: '创建搭配' })
  createOutfit(@Body() body: Record<string, unknown>, @Req() req: Request) {
    const userId = resolveUserId(req, typeof body.userId === 'string' ? body.userId : null);
    return this.wardrobeService.createOutfit({ ...body, userId });
  }

  @Get('outfits')
  @ApiOperation({ summary: '获取用户搭配列表' })
  getUserOutfits(@Query('userId') userId: string, @Req() req?: Request) {
    return this.wardrobeService.getUserOutfits(resolveUserId(req!, userId));
  }

  @Get('outfits/:id')
  @ApiOperation({ summary: '获取搭配详情' })
  getOutfitById(@Param('id') id: string, @Req() req?: Request) {
    return this.wardrobeService.getOutfitById(id, getAuthedUserId(req!));
  }

  @Delete('outfits/:id')
  @ApiOperation({ summary: '删除搭配' })
  deleteOutfit(@Param('id') id: string, @Req() req?: Request) {
    return this.wardrobeService.deleteOutfit(id, getAuthedUserId(req!));
  }
}
