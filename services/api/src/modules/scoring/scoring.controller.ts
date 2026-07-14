import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { EvaluateOutfitRequestDto } from './dto/evaluate-outfit.dto';
import { AnalyzeStyleProfileRequestDto } from './dto/analyze-style-profile.dto';
import { getBloggerById, bloggerRegistry } from './bloggers/blogger-profiles';
import { EvaluateOutfitResponse, ApiResponse as ApiResponseType } from '@stylemate/shared';

@ApiTags('AI 穿搭评分')
@Controller('scoring')
export class ScoringController {
  private readonly logger = new Logger(ScoringController.name);

  constructor(private readonly scoringService: ScoringService) {}

  @Post('evaluate')
  @ApiOperation({ summary: '对穿搭照片进行 AI 多维度评分' })
  @ApiResponse({
    status: 200,
    description: '返回 8 维度评分结果 + 品项评价 + 改良建议',
  })
  async evaluateOutfit(
    @Body() dto: EvaluateOutfitRequestDto,
  ): Promise<ApiResponseType<EvaluateOutfitResponse>> {
    this.logger.log(`收到评分请求 | 博主: ${dto.bloggerId}`);

    const result = await this.scoringService.evaluateOutfit(
      dto.imageBase64,
      dto.bloggerId,
      dto.userContext,
    );

    return {
      code: 200,
      message: '评分完成',
      data: result,
    };
  }

  @Post('style-profile')
  @ApiOperation({ summary: '对用户风格测评进行 AI 视觉与语言综合分析' })
  @ApiResponse({
    status: 200,
    description: '返回 AI 风格结论、视觉分析、意图提取和风格重排结果',
  })
  async analyzeStyleProfile(
    @Body() dto: AnalyzeStyleProfileRequestDto,
  ): Promise<ApiResponseType<unknown>> {
    this.logger.log(`收到风格档案 AI 分析请求 | 候选: ${dto.candidates?.length ?? 0}`);

    const result = await this.scoringService.analyzeStyleProfile(dto);

    return {
      code: 200,
      message: 'AI 风格分析完成',
      data: result,
    };
  }

  @Get('bloggers')
  @ApiOperation({ summary: '获取可用的穿搭博主列表' })
  @ApiResponse({
    status: 200,
    description: '返回所有博主人格档案（不含内部评分权重）',
  })
  async getBloggers(): Promise<
    ApiResponseType<
      Array<{
        id: string;
        name: string;
        platform: string;
        avatarUrl?: string;
        styleSignature: string;
        description: string;
      }>
    >
  > {
    const bloggers = bloggerRegistry.map((b) => ({
      id: b.id,
      name: b.name,
      platform: b.platform,
      avatarUrl: b.avatarUrl,
      styleSignature: b.styleSignature,
      description: b.description,
    }));

    return {
      code: 200,
      message: 'ok',
      data: bloggers,
    };
  }
}
