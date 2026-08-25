import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { KnowledgeChunk } from './entities/knowledge-chunk.entity';
import { EmbeddingService } from './embedding.service';

export interface RetrieveOptions {
  topK?: number;
  domains?: string[];
  tags?: string[];
}

export interface RetrievedKnowledge {
  id: string;
  content: string;
  title: string | null;
  domain: string;
  similarity: number;
  metadata: Record<string, any> | null;
}

/**
 * RAG 检索服务
 *
 * 核心功能：根据查询文本检索最相关的知识块。
 *
 * 检索策略：
 * 1. 将查询文本通过 EmbeddingService 转为向量
 * 2. 在 PostgreSQL 中使用 pgvector 的 cosine 距离检索
 * 3. 过滤领域和标签，返回 topK 结果
 *
 * 如果 pgvector 扩展未安装，回退到关键词匹配（基于 LIKE）。
 */
@Injectable()
export class RagRetrieverService {
  private readonly logger = new Logger(RagRetrieverService.name);
  private pgvectorAvailable: boolean | null = null;

  constructor(
    @InjectRepository(KnowledgeChunk)
    private chunkRepo: Repository<KnowledgeChunk>,
    private embeddingService: EmbeddingService,
    private dataSource: DataSource,
  ) {}

  /**
   * 检索相关知识块
   */
  async retrieve(query: string, options?: RetrieveOptions): Promise<RetrievedKnowledge[]> {
    const topK = options?.topK ?? 5;

    // 检查 pgvector 是否可用（首次调用时检测，缓存结果）
    if (this.pgvectorAvailable === null) {
      this.pgvectorAvailable = await this.checkPgVector();
    }

    if (this.pgvectorAvailable) {
      try {
        return await this.vectorSearch(query, topK, options);
      } catch (err) {
        this.logger.warn(`向量检索失败，回退关键词搜索: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 回退到关键词检索
    return this.keywordSearch(query, topK, options);
  }

  /**
   * 将检索到的知识块格式化为可注入 prompt 的文本
   */
  formatForPrompt(knowledge: RetrievedKnowledge[]): string {
    if (knowledge.length === 0) return '';

    return knowledge
      .map((k, i) => {
        const title = k.title ? `【${k.title}】` : '';
        return `[${i + 1}] ${title}${k.content}`;
      })
      .join('\n\n');
  }

  /**
   * 检索并格式化 — 便捷方法
   */
  async retrieveAndFormat(query: string, options?: RetrieveOptions): Promise<string> {
    const knowledge = await this.retrieve(query, options);
    return this.formatForPrompt(knowledge);
  }

  /**
   * 向量检索（pgvector）
   */
  private async vectorSearch(
    query: string,
    topK: number,
    options?: RetrieveOptions,
  ): Promise<RetrievedKnowledge[]> {
    const queryEmbedding = await this.embeddingService.embed(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    let sql = `
      SELECT
        id, content, title, domain, metadata,
        1 - (embedding::vector <=> :embedding::vector) AS similarity
      FROM knowledge_chunks
      WHERE embedding IS NOT NULL
    `;
    const params: any[] = [embeddingStr];
    let paramIdx = 2;

    if (options?.domains?.length) {
      sql += ` AND domain = ANY(:domains)`;
      params.push(options.domains);
    }

    if (options?.tags?.length) {
      sql += ` AND tags && :tags`;
      params.push(options.tags);
    }

    sql += ` ORDER BY embedding::vector <=> :embedding::vector LIMIT :topK`;
    params.push(topK);

    const results = await this.dataSource.query(sql, params);

    return results.map((r: any) => ({
      id: r.id,
      content: r.content,
      title: r.title,
      domain: r.domain,
      similarity: parseFloat(r.similarity),
      metadata: r.metadata,
    }));
  }

  /**
   * 关键词检索（pgvector 不可用时回退）
   */
  private async keywordSearch(
    query: string,
    topK: number,
    options?: RetrieveOptions,
  ): Promise<RetrievedKnowledge[]> {
    const queryBuilder = this.chunkRepo
      .createQueryBuilder('chunk')
      .where('chunk.content ILIKE :query', { query: `%${query}%` })
      .take(topK)
      .orderBy('chunk.createdAt', 'DESC');

    if (options?.domains?.length) {
      queryBuilder.andWhere('chunk.domain IN (:...domains)', { domains: options.domains });
    }

    if (options?.tags?.length) {
      queryBuilder.andWhere('chunk.tags && ARRAY[:...tags]', { tags: options.tags });
    }

    const chunks = await queryBuilder.getMany();

    // 关键词匹配的 similarity 使用简单评分（匹配即 1.0）
    return chunks.map((c) => ({
      id: c.id,
      content: c.content,
      title: c.title,
      domain: c.domain,
      similarity: 1.0,
      metadata: c.metadata,
    }));
  }

  /**
   * 检查 pgvector 扩展是否可用
   */
  private async checkPgVector(): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT extname FROM pg_extension WHERE extname = 'vector'`,
      );
      if (result.length === 0) {
        this.logger.warn('pgvector 扩展未安装，RAG 将使用关键词检索（精度较低）');
        this.logger.warn('安装方法: 在 PostgreSQL 中执行 `CREATE EXTENSION vector;`');
        return false;
      }
      this.logger.log('pgvector 扩展已安装，RAG 使用向量检索');
      return true;
    } catch (err) {
      this.logger.warn(`pgvector 检测失败: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }
}