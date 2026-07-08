/**
 * LLM Provider 抽象接口
 * 所有 AI Provider（Claude、OpenAI 等）必须实现此接口
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** 可选：图片 base64 数据（仅 user 消息可用） */
  imageBase64?: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  /** Provider 名称，用于日志和 fallback 标识 */
  readonly name: string;

  /** 是否支持图片/视觉分析 */
  readonly supportsVision: boolean;

  /**
   * 发送聊天请求
   * @param messages 消息列表
   * @param options 可选配置
   */
  chat(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse>;

  /**
   * 检查 Provider 是否可用
   * 用于 fallback 前的可用性检测
   */
  isAvailable(): Promise<boolean>;
}
