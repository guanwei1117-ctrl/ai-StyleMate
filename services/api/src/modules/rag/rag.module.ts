import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { KnowledgeChunk } from './entities/knowledge-chunk.entity';
import { EmbeddingService } from './embedding.service';
import { RagRetrieverService } from './rag-retriever.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * RAG 模块 — 检索增强生成
 *
 * 提供：
 * - EmbeddingService: 文本向量化
 * - RagRetrieverService: 向量检索
 * - KnowledgeBaseService: 知识库 CRUD
 * - RagService: 场景化知识增强（对外暴露的主服务）
 *
 * 使用 @Global() 全局导出，避免各模块重复 import。
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgeDocument, KnowledgeChunk]),
    AuthModule,
  ],
  controllers: [RagController],
  providers: [
    EmbeddingService,
    RagRetrieverService,
    KnowledgeBaseService,
    RagService,
  ],
  exports: [
    RagService,
    RagRetrieverService,
    KnowledgeBaseService,
    EmbeddingService,
  ],
})
export class RagModule {}