/**
 * 引导式 AI 对话测评 Skill
 *
 * 通过自然对话逐步了解用户穿搭偏好（风格/雷区/预算/舒适度/场景/目标/接受度），
 * 支持结合上下文追问与用户纠正，信息足够后总结出第一人称画像自述。
 */

export interface StyleChatBasicInfo {
  /** 性别表达（中文标签） */
  gender?: string;
  /** 身高 cm */
  height?: number | null;
  /** 体重 kg */
  weight?: number | null;
  /** 年龄段（中文标签） */
  ageGroup?: string | null;
  /** 职业（中文标签） */
  occupation?: string | null;
  /** 城市 */
  city?: string | null;
}

export interface StyleChatTurn {
  role: 'assistant' | 'user';
  content: string;
}

export interface StyleChatInput {
  /** 第一步填写的用户基础信息 */
  basicInfo: StyleChatBasicInfo;
  /** 已有对话历史（不含最新一条用户消息） */
  history: StyleChatTurn[];
  /** 最新一条用户消息（首轮为空，触发 AI 开场） */
  userMessage?: string;
  /** 用户主动要求结束对话（生成总结） */
  forceFinalize?: boolean;
}

export interface StyleChatResult {
  /** AI 的回复（问题或总结话语） */
  reply: string;
  /** 是否已收集足够信息 */
  done: boolean;
  /** 第一人称完整自述（done 时提供，供下游风格匹配使用） */
  statement?: string;
  /** 喜好关键词 */
  likedKeywords?: string[];
  /** 排斥/雷区关键词 */
  dislikedKeywords?: string[];
  /** 使用场景 */
  scenes?: string[];
}
