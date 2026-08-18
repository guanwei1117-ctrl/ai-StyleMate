import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 知识块 — RAG 检索的最小单位
 *
 * 每个 chunk 包含一段知识文本及其向量嵌入，
 * 通过 cosine 相似度检索最相关的知识片段。
 *
 * 向量存储策略：
 * - 使用 PostgreSQL pgvector 扩展
 * - embedding 字段存储为 vector(1536) 类型（OpenAI text-embedding-3-small）
 * - 通过 HNSW 索引加速近似最近邻搜索
 *
 * 注意：TypeORM 原生不支持 vector 类型，
 * 通过 raw query 进行向量检索。
 */
@Entity('knowledge_chunks')
export class KnowledgeChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 所属文档 ID */
  @Index()
  @Column({ name: 'document_id', type: 'varchar' })
  documentId: string;

  /** 知识块序号（文档内排序） */
  @Column({ name: 'chunk_index', type: 'int', default: 0 })
  chunkIndex: number;

  /** 知识块文本内容 */
  @Column('text')
  content: string;

  /**
   * 向量嵌入（1536 维 float 数组）
   * TypeORM 映射为 TEXT，实际通过 pgvector 的 vector 类型存储
   * 查询时使用 raw query: `ORDER BY embedding <=> :embedding`
   */
  @Column('text', { name: 'embedding', nullable: true })
  embedding: string | null;

  /** 知识领域：color_theory / body_type / occasion / style_encyclopedia / material */
  @Index()
  @Column({ type: 'varchar' })
  domain: string;

  /** 知识块标题/摘要（用于展示） */
  @Column({ type: 'varchar', nullable: true })
  title: string;

  /** 标签，用于分类过滤 */
  @Column('simple-array', { nullable: true })
  tags: string[];

  /** 元数据 */
  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'c