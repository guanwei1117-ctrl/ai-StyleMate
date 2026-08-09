import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

interface CacheEntry<T = unknown> {
  data: T;
  createdAt: number;
}

/**
 * AI 响应缓存 —— 基于图片内容哈希的内存缓存
 *
 * 避免同一张照片重复调用 AI 模型，降低成本和延迟。
 * - TTL: 24 小时（默认）
 * - 最大条目数: 100
 * - 缓存 Key: SHA-256(imageBase64 前 1024 字符 + 请求类型标识)
 */
@Injectable()
export class AiResponseCache {
  private readonly logger = new Logger(AiResponseCache.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor() {
    this.maxEntries = 100;
    this.ttlMs = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * 获取缓存的 AI 响应
   * @returns 缓存的响应，未命中或过期返回 undefined
   */
  get<T = unknown>(imageBase64: string, context: string): T | undefined {
    const key = this.buildKey(imageBase64, context);
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    this.logger.log(`缓存命中 | key: ${key.slice(0, 16)}... | 已缓存 ${this.age(entry.createdAt)}`);
    return entry.data as T;
  }

  /**
   * 设置缓存
   */
  set<T = unknown>(imageBase64: string, context: string, data: T): void {
    const key = this.buildKey(imageBase64, context);

    // LRU 淘汰：超过最大条目数时删除最旧的
    if (this.cache.size >= this.maxEntries) {
      const oldest = this.findOldestKey();
      if (oldest) {
        this.cache.delete(oldest);
        this.logger.log(`缓存淘汰 | 移除: ${oldest.slice(0, 16)}...`);
      }
    }

    this.cache.set(key, { data, createdAt: Date.now() });
    this.logger.log(`缓存写入 | key: ${key.slice(0, 16)}... | 条目数: ${this.cache.size}`);
  }

  /** 清除指定 key 的缓存 */
  invalidate(imageBase64: string, context: string): void {
    const key = this.buildKey(imageBase64, context);
    this.cache.delete(key);
  }

  /** 清除所有缓存 */
  clear(): void {
    this.cache.clear();
    this.logger.log('缓存已清空');
  }

  /** 获取缓存条目数（用于监控） */
  get size(): number {
    return this.cache.size;
  }

  private buildKey(imageBase64: string, context: string): string {
    // 取图片前 1024 字符的哈希 + 上下文哈希
    const imageSample = imageBase64.slice(0, 1024);
    const hash = crypto
      .createHash('sha256')
      .update(`${imageSample}|${context}`)
      .digest('hex');
    return hash;
  }

  private findOldestKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    return oldestKey;
  }

  private age(createdAt: number): string {
    const minutes = Math.floor((Date.now() - createdAt) / 60000);
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    return `${hours}小时`;
  }
}
