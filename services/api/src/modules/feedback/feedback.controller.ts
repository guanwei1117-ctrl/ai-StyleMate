import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { FeedbackService } from './feedback.service';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { resolveUserId } from '../../common/guards/resolve-user-id';

class SubmitFeedbackDto {
  userId: string;
  reaction: 'like' | 'dislike';
  rating?: number;
  comment?: string;
  planTitle?: string;
  plan?: Record<string, any>;
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
