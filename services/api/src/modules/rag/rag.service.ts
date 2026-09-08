import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RagRetrieverService, RetrieveOptions, RetrievedKnowledge } from './rag-retriever.service';

// ============== 文本缓存（轻量、独立于 AiResponseCache）==============
//
// 设计动机：
// - 已有 AiResponseCache 是为"图片评分"设计的，key 形如 SHA256(imageBase64 + context)
// - RAG 是文本检索场景，复用 AiResponseCache 会污染其 key 语义
// - 同一组 (query, domains) 短时间内会重复调用（同一用户反复点"换一换"、并发请求等）
// - 缓存命中直接返回，省去 pgvector 查询 + embedding 调用的几十~几百 ms
//
// 配置：TTL 5 分钟（穿搭知识不像新闻，可以稍长但不必 24h）/ 最多 200 条 / LRU 淘汰
const RAG_CACHE_TTL_MS = 5 * 60 * 1000;
const RAG_CACHE_MAX_ENTRIES = 200;

interface RagCacheEntry {
  value: string;
  createdAt: number;
}

/**
 * RAG 服务 — 对外提供知识增强能力
 *
 * 各业务模块（Scoring、Recommendation 等）通过此服务
 * 获取与当前场景相关的穿搭知识，注入到 LLM prompt 中。
 *
 * 用法：
 *   const knowledge = await ragService.augmentWithContext('梨形身材穿搭', {
 *     domains: ['body_type'],
 *   });
 *   const prompt = `${basePrompt}\n\n## 参考知识\n${knowledge}`;
 */
@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  /**
   * 文本缓存：key = SHA256(query + JSON.stringify(options))
   * 独立于 AiResponseCache（图片语义），专门服务"重复文本查询"场景
   */
  private readonly textCache = new Map<string, RagCacheEntry>();

  constructor(private retriever: RagRetrieverService) {}

  /**
   * 文本缓存包装：相同 (query, options) 5 分钟内直接返回缓存，避免重复 pgvector + embedding
   * - 缓存空结果（"未命中"也是稳定结果，5 分钟内同样直接短路）
   * - LRU 淘汰：超过 max 时删除最旧条目
   */
  private async withCache(
    query: string,
    options: RetrieveOptions | undefined,
    loader: () => Promise<string>,
  ): Promise<string> {
    const key = this.buildCacheKey(query, options);
    const hit = this.textCache.get(key);

    if (hit && Date.now() - hit.createdAt < RAG_CACHE_TTL_MS) {
      this.logger.debug(`RAG 缓存命中 | key: ${key.slice(0, 16)}... | 已缓存 ${Math.floor((Date.now() - hit.createdAt) / 1000)}s`);
      // LRU touch：刷新位置（Map 保持插入顺序，删除后重新插入即更新为最新）
      this.textCache.delete(key);
      this.textCache.set(key, hit);
      return hit.value;
    }

    if (hit) {
      // 过期清理
      this.textCache.delete(key);
    }

    const value = await loader();

    // LRU 淘汰
    if (this.textCache.size >= RAG_CACHE_MAX_ENTRIES) {
      const oldestKey = this.textCache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.textCache.delete(oldestKey);
        this.logger.debug(`RAG 缓存淘汰 | 移除: ${oldestKey.slice(0, 16)}...`);
      }
    }

    this.textCache.set(key, { value, createdAt: Date.now() });
    return value;
  }

  private buildCacheKey(query: string, options: RetrieveOptions | undefined): string {
    // options 内含 domains/tags/topK，key 必须包含这些才能区分不同检索域
    const optionsKey = options ? JSON.stringify({
      domains: (options.domains ?? []).slice().sort(),
      tags: (options.tags ?? []).slice().sort(),
      topK: options.topK ?? 5,
    }) : '';
    return crypto.createHash('sha256').update(`${query}|${optionsKey}`).digest('hex');
  }

  /** 清除所有 RAG 文本缓存（管理后台用） */
  clearCache(): void {
    this.textCache.clear();
    this.logger.log('RAG 文本缓存已清空');
  }

  /** 当前缓存条目数（监控用） */
  get cacheSize(): number {
    return this.textCache.size;
  }

  /**
   * 根据上下文检索相关知识并格式化为 prompt 片段
   */
  async augmentWithContext(
    query: string,
    options?: RetrieveOptions,
  ): Promise<string> {
    return this.withCache(query, options, async () => {
      const knowledge = await this.retriever.retrieve(query, options);

      if (knowledge.length === 0) {
        this.logger.debug(`RAG 未检索到相关知识 | query: ${query}`);
        return '';
      }

      this.logger.debug(
        `RAG 检索到 ${knowledge.length} 条知识 | query: ${query} | domains: ${options?.domains?.join(',') ?? 'all'}`,
      );

      return this.formatKnowledgeSection(knowledge);
    });
  }

  /**
   * 检索原始知识块（不格式化，返回结构化数据）
   */
  async retrieve(query: string, options?: RetrieveOptions): Promise<RetrievedKnowledge[]> {
    return this.retriever.retrieve(query, options);
  }

  /**
   * 检索并格式化知识块为文本段落
   */
  async retrieveAndFormat(query: string, options?: RetrieveOptions): Promise<string> {
    return this.retriever.retrieveAndFormat(query, options);
  }

  /**
   * 组合多领域知识检索 — 穿搭评分场景
   *
   * 同时检索：体型搭配 + 色彩理论 + 场合着装 + 风格百科
   */
  async augmentForOutfitScoring(context: {
    bodyShape?: string;
    occasion?: string;
    styleTags?: string[];
    skinTone?: string;
  }): Promise<string> {
    return this.withCache(`outfit_scoring|${JSON.stringify(context)}`, undefined, async () => {
      const queries: Array<{ query: string; options: RetrieveOptions }> = [];

      if (context.bodyShape) {
        queries.push({
          query: `${context.bodyShape} 体型穿搭搭配技巧`,
          options: { domains: ['body_type'], topK: 3 },
        });
      }

      if (context.occasion) {
        queries.push({
          query: `${context.occasion} 场合着装穿搭`,
          options: { domains: ['occasion'], topK: 2 },
        });
      }

      if (context.skinTone) {
        queries.push({
          query: `${context.skinTone} 肤色 适合颜色搭配`,
          options: { domains: ['color_theory'], topK: 2 },
        });
      }

      if (context.styleTags?.length) {
        queries.push({
          query: `${context.styleTags.join(' ')} 风格穿搭指南`,
          options: { domains: ['style_encyclopedia'], topK: 2 },
        });
      }

      return this.multiQueryRetrieve(queries);
    });
  }

  /**
   * 组合知识检索 — 风格分析场景
   */
  async augmentForStyleAnalysis(context: {
    faceShape?: string;
    bodyShape?: string;
    skinTone?: string;
    temperament?: string;
  }): Promise<string> {
    return this.withCache(`style_analysis|${JSON.stringify(context)}`, undefined, async () => {
      const queries: Array<{ query: string; options: RetrieveOptions }> = [];

      if (context.bodyShape) {
        queries.push({
          query: `${context.bodyShape} 体型适合风格`,
          options: { domains: ['body_type'], topK: 3 },
        });
      }

      if (context.skinTone) {
        queries.push({
          query: `${context.skinTone} 肤色季型色彩分析`,
          options: { domains: ['color_theory'], topK: 3 },
        });
      }

      if (context.temperament) {
        queries.push({
          query: `${context.temperament} 气质穿搭风格`,
          options: { domains: ['style_encyclopedia'], topK: 3 },
        });
      }

      return this.multiQueryRetrieve(queries);
    });
  }

  /**
   * 组合知识检索 — 每日推荐场景
   */
  async augmentForRecommendation(context: {
    occasion?: string;
    weather?: string;
    styleTags?: string[];
  }): Promise<string> {
    return this.withCache(`recommendation|${JSON.stringify(context)}`, undefined, async () => {
      const queries: Array<{ query: string; options: RetrieveOptions }> = [];

      if (context.occasion) {
        queries.push({
          query: `${context.occasion} 场合穿搭推荐`,
          options: { domains: ['occasion'], topK: 3 },
        });
      }

      if (context.weather) {
        queries.push({
          query: `${context.weather} 天气穿搭`,
          options: { domains: ['material', 'occasion'], topK: 2 },
        });
      }

      if (context.styleTags?.length) {
        queries.push({
          query: `${context.styleTags.join(' ')} 风格核心单品`,
          options: { domains: ['style_encyclopedia'], topK: 3 },
        });
      }

      return this.multiQueryRetrieve(queries);
    });
  }

  /**
   * 多查询检索并去重，格式化为知识段落
   */
  private async multiQueryRetrieve(
    queries: Array<{ query: string; options: RetrieveOptions }>,
  ): Promise<string> {
    if (queries.length === 0) return '';

    const allKnowledge: RetrievedKnowledge[] = [];
    const seenIds = new Set<string>();

    for (const { query, options } of queries) {
      const results = await this.retriever.retrieve(query, options);
      for (const r of results) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id);
          allKnowledge.push(r);
        }
      }
    }

    if (allKnowledge.length === 0) return '';

    this.logger.debug(`多查询 RAG 检索到 ${allKnowledge.length} 条去重知识`);

    return this.formatKnowledgeSection(allKnowledge);
  }

  /**
   * 格式化知识块为 prompt 注入段落
   */
  private formatKnowledgeSection(knowledge: RetrievedKnowledge[]): string {
    const lines = knowledge.map((k, i) => {
      const title = k.title ? `【${k.title}】` : '';
      return `[${i + 1}] ${title}${k.content}`;
    });

    return `## 参考知识（RAG 检索）\n${lines.join('\n\n')}`;
  }
}