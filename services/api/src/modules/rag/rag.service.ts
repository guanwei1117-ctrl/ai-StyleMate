import { Injectable, Logger } from '@nestjs/common';
import { RagRetrieverService, RetrieveOptions, RetrievedKnowledge } from './rag-retriever.service';

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

  constructor(private retriever: RagRetrieverService) {}

  /**
   * 根据上下文检索相关知识并格式化为 prompt 片段
   */
  async augmentWithContext(
    query: string,
    options?: RetrieveOptions,
  ): Promise<string> {
    const knowledge = await this.retriever.retrieve(query, options);

    if (knowledge.length === 0) {
      this.logger.debug(`RAG 未检索到相关知识 | query: ${query}`);
      return '';
    }

    this.logger.debug(
      `RAG 检索到 ${knowledge.length} 条知识 | query: ${query} | domains: ${options?.domains?.join(',') ?? 'all'}`,
    );

    return this.formatKnowledgeSection(knowledge);
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
  }

  /**
   * 组合知识检索 — 每日推荐场景
   */
  async augmentForRecommendation(context: {
    occasion?: string;
    weather?: string;
    styleTags?: string[];
  }): Promise<string> {
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