import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { FeedbackService } from './feedback.service';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { resolveUserId } from '../../common/guards/resolve-user-id';

/**
 * /feedback 提交 DTO
 * - reaction: 必填，用于 liked/disliked 大类记忆
 * - reasonTypes: 可选，细粒度反馈类型（多选），每个会单独触发一次记忆写入
 *   可选值：like/dislike/too_fat/too_formal/too_plain/uncomfortable/color_dislike/occasion_mismatch
 */
class SubmitFeedbackDto {
  userId: string;
  reaction: 'like' | 'dislike';
  rating?: number;
  comment?: string;
  planTitle?: string;
  plan?: Record<string, any>;
  reasonTypes?: Array<
    | 'like'
    | 'dislike'
    | 'too_fat'
    | 'too_formal'
    | 'too_plain'
    | 'uncomfortable'
    | 'color_dislike'
    | 'occasion_mismatch'
  >;
}

@Controller('feedback')
@UseGuards(OptionalAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  submit(@Body() dto: SubmitFeedbackDto, @Req() req: Request) {
    const userId = resolveUserId(req, dto.userId);
    return this.feedbackService.submit({ ...dto, userId });
  }

  @Get()
  list(@Query('userId') userId: string, @Req() req: Request) {
    return this.feedbackService.list(resolveUserId(req, userId));
  }

  @Get('stats')
  stats(@Query('userId') userId: string, @Req() req: Request) {
    return this.feedbackService.stats(resolveUserId(req, userId));
  }
}
