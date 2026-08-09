import { Controller, Post, Get, Body, Logger, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { ScoringService } from './scoring.service';
import { EvaluateOutfitRequestDto } from './dto/evaluate-outfit.dto';
import { AnalyzeStyleProfileRequestDto } from './dto/analyze-style-profile.dto';
import { EvaluateOutfitResponse, ApiResponse as ApiResponseType } from '@stylemate/shared';
import { validateImageDataUrl } from './image-data-url.validator';
import { AiRateLimiter } from './ai-rate-limiter';

@ApiTags('AI 穿搭评分')
@Controller('scoring')
export class ScoringController {
  private readonly logger = new Logger(ScoringController.name);

  constructor(
    private readonly scoringService: ScoringService,
    private readonly aiRateLimiter: AiRateLimiter,
  ) {}

  @Post('evaluate')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '对穿搭照片进行 AI 多维度评分' })
  @ApiResponse({
    status: 200,
    description: '返回 8 维度评分结果 + 品项评价 + 改良建议',
  })
  async evaluateOutfit(
    @Body() dto: EvaluateOutfitRequestDto,
    @Req() req: Request,
  ): Promise<ApiResponseType<EvaluateOutfitResponse>> {
    this.assertAiRequestAllowed(req);
    validateImageDataUrl(dto.imageBase64, 'imageBase64');

    // 优先使用已认证用户的 sub，其次使用客户端传入的 userId
    const userId = (req as any).user?.sub ?? dto.userId;
    this.logger.log(`收到评分请求 | 含图片: 是 | userId: ${userId ?? '匿名'}`);

    const result = await this.scoringService.evaluateOutfit(
      dto.imageBase64,
      dto.userContext,
      userId,
    );

    return {
      code: 200,
      message: '评分完成',
      data: result,
    };
  }

  @Post('style-profile')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '对用户风格测评进行 AI 视觉与语言综合分析' })
  @ApiResponse({
    status: 200,
    description: '返回 AI 风格结论、视觉分析、意图提取和风格重排结果',
  })
  async analyzeStyleProfile(
    @Body() dto: AnalyzeStyleProfileRequestDto,
    @Req() req: Request,
  ): Promise<ApiResponseType<unknown>> {
    this.assertAiRequestAllowed(req);
    if (dto.faceImageBase64) validateImageDataUrl(dto.faceImageBase64, 'faceImageBase64');
    if (dto.fullBodyImageBase64) validateImageDataUrl(dto.fullBodyImageBase64, 'fullBodyImageBase64');
    this.logger.log(`收到风格档案 AI 分析请求 | 候选: ${dto.candidates?.length ?? 0}`);

    const result = await this.scoringService.analyzeStyleProfile(dto);

    return {
      code: 200,
      message: 'AI 风格分析完成',
      data: result,
    };
  }

  private assertAiRequestAllowed(req: Request): void {
    const forwardedFor = req.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
    const key = forwardedIp?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
    this.aiRateLimiter.assertAllowed(key);
  }
}

