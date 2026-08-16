import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { SyncService } from './sync.service';

/**
 * 登录用户本地数据同步（周计划 / 风格档案）
 *
 * 仅登录用户可用：匿名用户数据留在本机 localStorage。
 */
@ApiTags('数据同步')
@UseGuards(OptionalAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  private requireUser(req: Request): string {
    const userId = (req as any).user?.sub as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('请先登录后再使用跨设备同步');
    }
    return userId;
  }

  @Get(':key')
  @ApiOperation({ summary: '拉取同步条目（登录后跨设备合并用）' })
  async getEntry(@Param('key') key: string, @Req() req: Request) {
    const userId = this.requireUser(req);
    return this.syncService.getEntry(userId, key);
  }

  @Put(':key')
  @ApiOperation({ summary: '上传同步条目（服务端按 updatedAt 防旧覆盖新）' })
  async putEntry(
    @Param('key') key: string,
    @Body() body: { value: unknown; updatedAt: string },
    @Req() req: Request,
  ) {
    const userId = this.requireUser(req);
    if (!body || typeof body.updatedAt !== 'string') {
      throw new UnauthorizedException('缺少 updatedAt');
    }
    return this.syncService.putEntry(userId, key, body.value, body.updatedAt);
  }
}
