import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { OotdService } from './ootd.service';

@ApiTags('OOTD 社区')
@UseGuards(OptionalAuthGuard)
@Controller('ootd')
export class OotdController {
  constructor(private readonly ootdService: OotdService) {}

  private viewerId(req: Request): string | undefined {
    return (req as any).user?.sub as string | undefined;
  }

  private requireUser(req: Request): string {
    const userId = this.viewerId(req);
    if (!userId) throw new UnauthorizedException('请先登录');
    return userId;
  }

  @Get()
  @ApiOperation({ summary: 'OOTD 信息流（浏览无需登录）' })
  async list(
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Req() req: Request,
  ) {
    return this.ootdService.list(
      this.viewerId(req),
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
    );
  }

  @Post()
  @ApiOperation({ summary: '发布 OOTD（需登录）' })
  async create(
    @Body() body: { imageData: string; caption?: string; scoreAvg?: number; scoreJson?: string; styleTags?: string },
    @Req() req: Request,
  ) {
    const userId = this.requireUser(req);
    return this.ootdService.create(userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除自己的帖子（需登录）' })
  async deletePost(@Param('id') id: string, @Req() req: Request) {
    const userId = this.requireUser(req);
    await this.ootdService.deletePost(userId, id);
    return { code: 0, message: '已删除' };
  }

  @Post(':id/like')
  @ApiOperation({ summary: '点赞/取消点赞（需登录）' })
  async toggleLike(@Param('id') id: string, @Req() req: Request) {
    const userId = this.requireUser(req);
    return this.ootdService.toggleLike(userId, id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: '帖子评论列表' })
  async listComments(@Param('id') id: string) {
    return this.ootdService.listComments(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: '发表评论（需登录）' })
  async addComment(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() req: Request,
  ) {
    const userId = this.requireUser(req);
    return this.ootdService.addComment(userId, id, body.content);
  }
}
