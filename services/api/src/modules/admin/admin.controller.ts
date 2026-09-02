import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { OotdService } from '../ootd/ootd.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ootdService: OotdService,
  ) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('users-trend')
  usersTrend(@Query('days') days?: string) {
    return this.adminService.usersTrend(days ? parseInt(days) : 30);
  }

  @Get('profile-distribution')
  profileDistribution() {
    return this.adminService.profileDistribution();
  }

  @Get('feedback-stats')
  feedbackStats() {
    return this.adminService.feedbackStats();
  }

  @Get('llm-stats')
  llmStats(@Query('days') days?: string) {
    return this.adminService.llmStats(days ? parseInt(days) : 7);
  }

  // ========== 帖子审核 ==========

  @Get('ootd/posts')
  ootdPosts(
    @Query('status') status: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.ootdService.adminList(
      status || 'pending',
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Patch('ootd/posts/:id/review')
  reviewOotdPost(
    @Param('id') id: string,
    @Body() body: { action: 'approved' | 'rejected'; rejectReason?: string },
    @Req() req: any,
  ) {
    const reviewerId = req.user?.id || 'admin';
    return this.ootdService.reviewPost(id, reviewerId, body.action, body.rejectReason);
  }

  // ========== 风格标签管理 ==========

  @Get('tags')
  getTags() {
    return this.adminService.getTags();
  }

  @Post('tags')
  createTag(@Body() body: { name: string; label: string }) {
    return this.adminService.createTag(body.name, body.label);
  }

  @Patch('tags/:name')
  updateTag(@Param('name') name: string, @Body() body: { name?: string; label?: string }) {
    return this.adminService.updateTag(name, body.name, body.label);
  }

  @Delete('tags/:name')
  deleteTag(@Param('name') name: string) {
    return this.adminService.deleteTag(name);
  }
}
