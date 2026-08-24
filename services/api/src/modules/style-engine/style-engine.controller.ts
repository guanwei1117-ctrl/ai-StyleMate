import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StyleEngineService, ScoringSnapshotDto } from './style-engine.service';
import { UserStyleDNA } from '@stylemate/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('风格引擎')
@Controller('style-engine')
export class StyleEngineController {
  constructor(private readonly styleEngine: StyleEngineService) {}

  @Get('styles')
  @ApiOperation({ summary: '获取所有风格列表' })
  getAllStyles() {
    return this.styleEngine.getAllStyles();
  }

  @Get('styles/categories')
  @ApiOperation({ summary: '按分类获取风格' })
  getStylesByCategory() {
    return this.styleEngine.getStylesByCategory();
  }

  @Get('styles/:id')
  @ApiOperation({ summary: '获取风格详情' })
  getStyleById(@Param('id') id: string) {
    const style = this.styleEngine.getStyleById(id);
    if (!style) {
      return { code: 404, message: '风格不存在' };
    }
    return style;
  }

  @Post('analyze')
  @ApiOperation({ summary: '分析用户风格 DNA，返回完整匹配报告' })
  analyze(@Body() body: { dna: UserStyleDNA }) {
    return this.styleEngine.analyzeUserDNA(body.dna);
  }

  @Post('match/:styleId')
  @ApiOperation({ summary: '用户 DNA vs 指定风格' })
  matchSingle(@Param('styleId') styleId: string, @Body() body: { dna: UserStyleDNA }) {
    const result = this.styleEngine.matchSingleStyle(body.dna, styleId);
    if (!result) {
      return { code: 404, message: '风格不存在' };
    }
    return result;
  }

  @Post('snapshot')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '保存前端评分快照到后端记忆' })
  async saveSnapshot(@Body() body: ScoringSnapshotDto) {
    return this.styleEngine.saveSnapshot(body);
  }
}
