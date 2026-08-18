import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type LlmCallStatus = 'success' | 'failed' | 'timeout';

/**
 * LLM 调用日志表 —— 每次 LLMFactory.chat 调用后记录一条埋点。
 * 用于管理端统计 AI 调用次数 / 失败率 / 平均耗时 / 各 provider 占比。
 */
@Entity('llm_call_logs')
export class LlmCallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  provider: string;

  @Column({ type: 'enum', enum: ['success', 'failed', 'timeout'] })
  status: LlmCallStatus;

  @Column({ name: 'elapsed_ms', type: 'int' })
  elapsedMs: number;

  @Column({ name: 'has_image', type: 'boolean', default: false })
  hasImage: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Index()
  @Column({ name: 'user_id', type: 'text', nullable: true })
  userId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
