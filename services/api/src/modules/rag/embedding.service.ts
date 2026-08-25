import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Embedding 服务
 *
 * 将文本转换为向量嵌入，用于 RAG 检索。
 *
 * 策略：
 * 1. 首选 OpenAI text-embedding-3-small（1536 维，性价比高）
 * 2. 如果 OpenAI 不可用，回退到简单哈希嵌入（仅用于开发/降级）
 *
 * 未来可扩展：
 * - 本地 BGE 模型（通过 ONNX Runtime）
 * - 通义千问 embedding API（国内直连）
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openaiApiKey: string | undefined;
  private readonly openaiBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openaiBaseUrl = this.configService.get<string>('OPENAI_BASE_URL') || 'https://api.openai.com/v1';
  }

  /**
   * 将单段文本转为向量
   */
  async embed(text: string): Promise<number[]> {
    // 尝试 OpenAI embedding
    if (this.openaiApiKey) {
      try {
        return await this.openaiEmbed(text);
      } catch (err) {
        this.logger.warn(`OpenAI embedding 失败，回退本地: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 回退到本地简单嵌入（开发/降级用）
    return this.fallbackEmbed(text);
  }

  /**
   * 批量将文本转为向量
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    // 尝试 OpenAI batch embedding
    if (this.openaiApiKey) {
      try {
        return await this.openaiEmbedBatch(texts);
      } catch (err) {
        this.logger.warn(`OpenAI batch embedding 失败，回退本地: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 回退
    return texts.map((t) => this.fallbackEmbed(t));
  }

  /**
   * 通过 OpenAI API 生成 embedding
   */
  private async openaiEmbed(text: string): Promise<number[]> {
    const url = `${this.openaiBaseUrl}/embeddings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embedding API 返回 ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as any;
    return data.data[0].embedding as number[];
  }

  /**
   * 批量 OpenAI embedding
   */
  private async openaiEmbedBatch(texts: string[]): Promise<number[][]> {
    const url = `${this.openaiBaseUrl}/embeddings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI batch embedding API 返回 ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as any;
    // 按输入顺序排序
    data.data.sort((a: any, b: any) => a.index - b.index);
    return data.data.map((d: any) => d.embedding as number[]);
  }

  /**
   * 本地回退 embedding — 基于字符哈希的简单向量
   *
   * 仅用于开发和降级场景，不保证语义准确性。
   * 生成固定 256 维向量，通过余弦相似度仍可做基础排序。
   */
  private fallbackEmbed(text: string): number[] {
    const dims = 256;
    const vector: number[] = new Array(dims).fill(0);

    // 基于字符的简单哈希
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const idx = i % dims;
      vector[idx] += (code % 100) / 100;
    }

    // 归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < dims; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }
}