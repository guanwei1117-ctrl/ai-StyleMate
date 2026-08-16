import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSyncEntry } from './sync-entry.entity';

const VALID_KEYS = new Set(['weekPlan', 'styleProfile']);

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(UserSyncEntry)
    private readonly entryRepo: Repository<UserSyncEntry>,
  ) {}

  private assertKey(key: string): void {
    if (!VALID_KEYS.has(key)) {
      throw new Error(`不支持的同步键: ${key}`);
    }
  }

  async getEntry(
    userId: string,
    key: string,
  ): Promise<{ key: string; value: unknown; updatedAt: string } | null> {
    this.assertKey(key);
    const entry = await this.entryRepo.findOne({ where: { userId, key } });
    if (!entry) return null;
    try {
      return {
        key: entry.key,
        value: JSON.parse(entry.value),
        updatedAt: entry.clientUpdatedAt,
      };
    } catch {
      this.logger.warn(`同步条目解析失败 | userId: ${userId} | key: ${key}`);
      return null;
    }
  }

  async putEntry(
    userId: string,
    key: string,
    value: unknown,
    updatedAt: string,
  ): Promise<{ key: string; value: unknown; updatedAt: string }> {
    this.assertKey(key);

    const existing = await this.entryRepo.findOne({ where: { userId, key } });
    // 旧数据不覆盖新数据（防多设备并发写回旧版本）
    if (existing && existing.clientUpdatedAt > updatedAt) {
      this.logger.log(
        `忽略过期写入 | userId: ${userId} | key: ${key} | 服务端 ${existing.clientUpdatedAt} > 客户端 ${updatedAt}`,
      );
      return {
        key,
        value: JSON.parse(existing.value),
        updatedAt: existing.clientUpdatedAt,
      };
    }

    if (existing) {
      existing.value = JSON.stringify(value);
      existing.clientUpdatedAt = updatedAt;
      await this.entryRepo.save(existing);
    } else {
      const entry = this.entryRepo.create({
        userId,
        key,
        value: JSON.stringify(value),
        clientUpdatedAt: updatedAt,
      });
      await this.entryRepo.save(entry);
    }

    this.logger.log(`同步写入 | userId: ${userId} | key: ${key} | updatedAt: ${updatedAt}`);
    return { key, value, updatedAt };
  }
}
