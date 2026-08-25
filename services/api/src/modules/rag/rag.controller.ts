import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KnowledgeBaseService, CreateDocumentInput } from './knowledge-base.service';
import { RagRetrieverService } from './rag-retriever.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../admin/roles.guard';
import { ALL_SEEDS, SEEDS_BY_DOMAIN } from './seed';

/**
 * RAG 知识库管理 API
 *
 * - 管理端操作（增删改查文档）需要 JWT + admin 角色
 * - 检索测试接口公开（方便调试）
 */
@Controller()
export class RagController {
  constructor(
    private knowledgeBaseService: KnowledgeBaseService,
    private retrieverService: RagRetrieverService,
  ) {}

  // ==================== 管理端：文档 CRUD ====================

  @Get('admin/rag/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async listDocuments(@Query('domain') domain?: string) {
    return this.knowledgeBaseService.listDocuments(domain);
  }

  @Get('admin/rag/documents/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDocument(@Param('id') id: string) {
    return this.knowledgeBaseService.getDocument(id);
  }

  @Post('admin/rag/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createDocument(@Body() body: CreateDocumentInput) {
    return this.knowledgeBaseService.createDocument(body);
  }

  @Delete('admin/rag/documents/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(@Param('id') id: string) {
    await this.knowledgeBaseService.deleteDocument(id);
  }

  @Patch('admin/rag/documents/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async toggleDocument(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.knowledgeBaseService.toggleDocument(id, enabled);
  }

  @Post('admin/rag/documents/:id/reindex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async reindexDocument(@Param('id') id: string) {
    await this.knowledgeBaseService.reindexDocument(id);
    return { message: '重新索引完成' };
  }

  // ==================== 管理端：统计 ====================

  @Get('admin/rag/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStats() {
    return this.knowledgeBaseService.getStats();
  }

  // ==================== 管理端：种子数据导入 ====================

  /**
   * 批量导入所有种子数据（色彩理论/体型搭配/场合着装/风格百科）
   * 已存在的同名文档会自动跳过，支持重复调用。
   */
  @Post('admin/rag/seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async seedAll() {
    const created = await this.knowledgeBaseService.batchCreateDocuments(ALL_SEEDS);
    return {
      message: '种子数据导入完成',
      created,
      total: ALL_SEEDS.length,
      skipped: ALL_SEEDS.length - created,
    };
  }

  /**
   * 按领域导入种子数据
   * 支持的领域：color_theory / body_type / occasion / style_encyclopedia
   */
  @Post('admin/rag/seed/:domain')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async seedByDomain(@Param('domain') domain: string) {
    const seeds = SEEDS_BY_DOMAIN[domain];
    if (!seeds) {
      return {
        message: `未知领域: ${domain}`,
        availableDomains: Object.keys(SEEDS_BY_DOMAIN),
      };
    }
    const created = await this.knowledgeBaseService.batchCreateDocuments(seeds);
    return {
      message: `领域 ${domain} 种子数据导入完成`,
      domain,
      created,
      total: seeds.length,
      skipped: seeds.length - created,
    };
  }

  // ==================== 检索测试（开发调试用） ====================

  @Post('rag/search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() body: { query: string; domains?: string[]; topK?: number }) {
    const results = await this.retrieverService.retrieve(body.query, {
      domains: body.domains,
      topK: body.topK,
    });
    return { query: body.query, count: results.length, results };
  }
}