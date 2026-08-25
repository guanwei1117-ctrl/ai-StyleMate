import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { KnowledgeChunk } from './entities/knowledge-chunk.entity';
import { EmbeddingService } from './embedding.service';

export interface CreateDocumentInput {
  title: string;
  domain: string;
  source?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  /** 完整文档内容，将自动分块 */
  content: string;
  /** 每块最大字符数，默认 500 */
  chunkSize?: number;
  /** 块之间重叠字符数，默认 50 */
  chunkOverlap?: number;
}

export interface DocumentWithChunks extends KnowledgeDocument {
  chunkCount: number;
}

/**
 * 知识库管理服务
 *
 * 负责知识文档和知识块的 CRUD、分块、向量化。
 */
@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectRepository(KnowledgeDocument)
    private docRepo: Repository<KnowledgeDocument>,
    @InjectRepository(KnowledgeChunk)
    private chunkRepo: Repository<KnowledgeChunk>,
    private embeddingService: EmbeddingService,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建知识文档并自动分块 + 向量化
   */
  async createDocument(input: CreateDocumentInput): Promise<KnowledgeDocument> {
    const chunkSize = input.chunkSize ?? 500;
    const chunkOverlap = input.chunkOverlap ?? 50;

    // 1. 创建文档记录
    const doc = this.docRepo.create({
      title: input.title,
      domain: input.domain,
      source: input.source,
      tags: input.tags,
      metadata: input.metadata,
    });
    const savedDoc = await this.docRepo.save(doc);

    // 2. 分块
    const chunks = this.splitIntoChunks(input.content, chunkSize, chunkOverlap);
    this.logger.log(`文档 "${input.title}" 分为 ${chunks.length} 块`);

    // 3. 批量向量化
    const embeddings = await this.embeddingService.embedBatch(chunks);

    // 4. 保存知识块
    const chunkEntities: KnowledgeChunk[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const embeddingStr = embeddings[i] ? `[${embeddings[i].join(',')}]` : null;
      const chunk = this.chunkRepo.create({
        documentId: savedDoc.id,
        chunkIndex: i,
        content: chunks[i],
        embedding: embeddingStr,
        domain: input.domain,
        title: input.title,
        tags: input.tags,
        metadata: { ...input.metadata, chunkIndex: i, totalChunks: chunks.length },
      });
      chunkEntities.push(chunk);
    }
    await this.chunkRepo.save(chunkEntities);

    this.logger.log(`文档 "${input.title}" 创建完成，${chunkEntities.length} 块已向量化`);
    return savedDoc;
  }

  /**
   * 批量创建知识文档（用于种子数据导入）
   */
  async batchCreateDocuments(inputs: CreateDocumentInput[]): Promise<number> {
    let created = 0;
    for (const input of inputs) {
      try {
        // 检查是否已存在同名文档
        const existing = await this.docRepo.findOne({ where: { title: input.title } });
        if (existing) {
          this.logger.log(`文档 "${input.title}" 已存在，跳过`);
          continue;
        }
        await this.createDocument(input);
        created++;
      } catch (err) {
        this.logger.error(`创建文档 "${input.title}" 失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    this.logger.log(`批量导入完成：新增 ${created}/${inputs.length} 篇文档`);
    return created;
  }

  /**
   * 列出所有文档（含知识块数量）
   */
  async listDocuments(domain?: string): Promise<DocumentWithChunks[]> {
    const queryBuilder = this.docRepo
      .createQueryBuilder('doc')
      .leftJoin('knowledge_chunks', 'chunk', 'chunk.document_id = doc.id')
      .select('doc.*')
      .addSelect('COUNT(chunk.id)', 'chunkCount')
      .groupBy('doc.id')
      .orderBy('doc.createdAt', 'DESC');

    if (domain) {
      queryBuilder.where('doc.domain = :domain', { domain });
    }

    const results = await queryBuilder.getRawMany();
    return results.map((r) => ({
      ...r,
      chunkCount: parseInt(r.chunkCount, 10) || 0,
    }));
  }

  /**
   * 获取文档详情
   */
  async getDocument(id: string): Promise<{ document: KnowledgeDocument; chunks: KnowledgeChunk[] }> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('文档不存在');

    const chunks = await this.chunkRepo.find({
      where: { documentId: id },
      order: { chunkIndex: 'ASC' },
    });

    return { document: doc, chunks };
  }

  /**
   * 删除文档（连同知识块）
   */
  async deleteDocument(id: string): Promise<void> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('文档不存在');

    await this.chunkRepo.delete({ documentId: id });
    await this.docRepo.delete({ id });
    this.logger.log(`文档 "${doc.title}" 已删除`);
  }

  /**
   * 启用/停用文档
   */
  async toggleDocument(id: string, enabled: boolean): Promise<KnowledgeDocument> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('文档不存在');
    doc.enabled = enabled;
    return this.docRepo.save(doc);
  }

  /**
   * 重新向量化文档（embedding 模型升级后调用）
   */
  async reindexDocument(id: string): Promise<void> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('文档不存在');

    const chunks = await this.chunkRepo.find({
      where: { documentId: id },
      order: { chunkIndex: 'ASC' },
    });

    this.logger.log(`重新索引文档 "${doc.title}"（${chunks.length} 块）`);

    const texts = chunks.map((c) => c.content);
    const embeddings = await this.embeddingService.embedBatch(texts);

    for (let i = 0; i < chunks.length; i++) {
      const embeddingStr = embeddings[i] ? `[${embeddings[i].join(',')}]` : null;
      chunks[i].embedding = embeddingStr;
    }

    await this.chunkRepo.save(chunks);
    doc.version += 1;
    await this.docRepo.save(doc);

    this.logger.log(`文档 "${doc.title}" 重新索引完成`);
  }

  /**
   * 获取知识库统计信息
   */
  async getStats(): Promise<{
    totalDocuments: number;
    enabledDocuments: number;
    totalChunks: number;
    byDomain: Record<string, { documents: number; chunks: number }>;
  }> {
    const docs = await this.docRepo.find();
    const chunks = await this.chunkRepo.find();

    const byDomain: Record<string, { documents: number; chunks: number }> = {};
    for (const doc of docs) {
      if (!byDomain[doc.domain]) byDomain[doc.domain] = { documents: 0, chunks: 0 };
      byDomain[doc.domain].documents++;
    }
    for (const chunk of chunks) {
      if (!byDomain[chunk.domain]) byDomain[chunk.domain] = { documents: 0, chunks: 0 };
      byDomain[chunk.domain].chunks++;
    }

    return {
      totalDocuments: docs.length,
      enabledDocuments: docs.filter((d) => d.enabled).length,
      totalChunks: chunks.length,
      byDomain,
    };
  }

  /**
   * 将文本按固定大小分块（带重叠）
   */
  private splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;

      // 尽量在句号/换行处切分
      if (end < text.length) {
        const lastSentence = Math.max(
          text.lastIndexOf('。', end),
          text.lastIndexOf('\n', end),
          text.lastIndexOf('；', end),
          text.lastIndexOf('！', end),
          text.lastIndexOf('？', end),
        );
        if (lastSentence > start + chunkSize * 0.5) {
          end = lastSentence + 1;
        }
      }

      chunks.push(text.slice(start, end).trim());
      start = end - overlap;
      if (start >= text.length) break;
    }

    return chunks.filter((c) => c.length > 0);
  }
}