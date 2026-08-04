import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

class SubmitFeedbackDto {
  userId: string;
  reaction: 'like' | 'dislike';
  rating?: number;
  comment?: string;
  planTitle?: string;
  plan?: Record<string, any>;
}

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  submit(@Body() dto: SubmitFeedbackDto) {
    return this.feedbackService.submit(dto);
  }

  @Get()
  list(@Query('userId') userId: string) {
    return this.feedbackService.list(userId);
  }

  @Get('stats')
  stats(@Query('userId') userId: string) {
    return this.feedbackService.stats(userId);
  }
}
