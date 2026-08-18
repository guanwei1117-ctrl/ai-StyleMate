import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 知识文档 — RAG 知识库的文档级单位
 *
 * 一个文档包含多个知识块（KnowledgeChunk），
 * 文档级用于管理、分类和版本控制。
 */
@Entity('knowledge_documents')
export class KnowledgeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 文档标题 */
  @Column({ type: 'varchar' })
  title: string;

  /** 知识领域：color_theory / body_type / occasion / style_encyclopedia / material */
  @Index()
  @Column({ type: 'varchar' })
  domain: string;

  /** 文档来源描述（如 "色彩理论手册"、"风格百科"） */
  @Column({ type: 'varchar', nullable: true })
  source: string;

  /** 文档版本号 */
  @Column({ type: 'int', default: 1 })
  version: number;

  /** 是否启用（停用的文档不会被检索到） */
  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  /** 文档标签，用于过滤 */
  @Column('simple-array', { nullable: true })
  tags: string[];

  /** 元数据（JSON 灵活扩展） */
  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}