import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MemoryService } from './memory.service';
import {
  UpdateStyleProfileDto,
  RecordFeedbackDto,
  UpdateIntentDto,
} from './memory.dto';

@ApiTags('长期记忆')
@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  // ==================== 用户画像 ====================

  @Get(':userId')
  @ApiOperation({ summary: '获取用户完整记忆（AI 记住了什么）' })
  getUserMemory(@Param('userId') userId: string) {
    return this.memoryService.getUserMemory(userId);
  }

  @Get(':userId/profile')
  @ApiOperation({ summary: '获取用户长期风格画像' })
  getStyleProfile(@Param('userId') userId: string) {
    return this.memoryService.getStyleProfile(userId);
  }

  @Put(':userId/profile')
  @ApiOperation({ summary: '更新用户风格画像（部分更新，合并而非覆盖）' })
  updateStyleProfile(
    @Param('userId') userId: string,
    @Body() body: UpdateStyleProfileDto,
  ) {
    return this.memoryService.updateStyleProfile(userId, body);
  }

  @Delete(':userId/profile/field/:field')
  @ApiOperation({ summary: '删除画像中的单条记忆字段' })
  removeProfileField(
    @Param('userId') userId: string,
    @Param('field') field: string,
    @Query('value') value?: string,
  ) {
    return this.memoryService.removeProfileField(userId, field, value);
  }

  @Delete(':userId/profile')
  @ApiOperation({ summary: '清空用户全部长期记忆（一键清空）' })
  clearStyleProfile(@Param('userId') userId: string) {
    return this.memoryService.clearStyleProfile(userId);
  }

  // ==================== 行为反馈 ====================

  @Post(':userId/feedback')
  @ApiOperation({ summary: '记录用户反馈（自动更新记忆权重）' })
  recordFeedback(
    @Param('userId') userId: string,
    @Body() body: RecordFeedbackDto,
  ) {
    return this.memoryService.recordOutfitFeedback(userId, body);
  }

  @Get(':userId/feedbacks')
  @ApiOperation({ summary: '获取用户最近反馈列表' })
  getRecentFeedbacks(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.memoryService.getRecentFeedbacks(userId, limit ?? 20);
  }

  // ==================== 当前意图 ====================

  @Get(':userId/intent')
  @ApiOperation({ summary: '获取用户当前购物意图' })
  getCurrentIntent(@Param('userId') userId: string) {
    return this.memoryService.getCurrentIntent(userId);
  }

  @Put(':userId/intent')
  @ApiOperation({ summary: '更新用户当前购物意图' })
  updateCurrentIntent(
    @Param('userId') userId: string,
    @Body() body: UpdateIntentDto,
  ) {
    return this.memoryService.updateCurrentIntent(userId, body);
  }

  // ==================== AI 总结 ====================

  @Get(':userId/summary')
  @ApiOperation({ summary: '获取 AI 总结记忆' })
  getMemorySummary(@Param('userId') userId: string) {
    return this.memoryService.getMemorySummary(userId);
  }

  @Post(':userId/summary/refresh')
  @ApiOperation({ summary: '刷新 AI 总结记忆（基于最新数据重新生成）' })
  refreshMemorySummary(@Param('userId') userId: string) {
    return this.memoryService.refreshMemorySummary(userId);
  }
}
