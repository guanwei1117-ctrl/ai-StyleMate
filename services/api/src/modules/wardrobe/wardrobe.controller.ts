import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WardrobeService } from './wardrobe.service';

@ApiTags('衣橱管理')
@Controller('wardrobe')
export class WardrobeController {
  constructor(private readonly wardrobeService: WardrobeService) {}

  // --- 衣物 ---
  @Post('items')
  @ApiOperation({ summary: '添加衣物' })
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
}
