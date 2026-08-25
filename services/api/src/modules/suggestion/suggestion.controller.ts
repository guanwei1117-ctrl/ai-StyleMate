import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { SuggestionService } from './suggestion.service';
import { SuggestionCategory } from './suggestion.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../admin/roles.guard';

class SubmitSuggestionDto {
  content: string;
  category?: SuggestionCategory;
  userId?: string | null;
  pageUrl?: string | null;
}

@Controller()
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  /** 用户提交建议（公开端点，无需 JWT） */
  @Post('suggestions')
  submit(@Body() dto: SubmitSuggestionDto) {
    return this.suggestionService.submit(dto);
  }

  /** 管理端：分页查询建议列表 */
  @Get('admin/suggestions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: 'new' | 'viewed',
  ) {
    return this.suggestionService.list(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
      status,
    );
  }

  /** 管理端：标记建议为已查看 */
  @Patch('admin/suggestions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  markViewed(@Param('id') id: string) {
    return this.suggestionService.markViewed(id);
  }
}
