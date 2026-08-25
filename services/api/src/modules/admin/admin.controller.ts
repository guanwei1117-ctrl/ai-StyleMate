import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
