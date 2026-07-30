/**
 * 衣物识别 AI Skill
 *
 * 输入单件衣物图片，返回结构化标签：
 * 品类、颜色、材质、风格、季节、厚薄、正式程度、百搭程度、适合场合等。
 *
 * 该 skill 只负责调用 LLM 并解析结果，不涉及数据库持久化。
 * 持久化由 WardrobeService 负责。
 */

export interface GarmentRecognitionInput {
  /** 图片 base64，可为纯 base64 或 data URI */
  imageBase64: string;
}

export interface GarmentRecognitionResult {
  category: string;
  subCategory: string;
  color: string;
  colorHex: string;
  pattern: string;
  material: string;
  season: string[];
  styleTags: string[];
  occasionTags: string[];
  /** 1-5 正式程度 */
  formalityScore: number;
  /** 1-5 厚薄/保暖 */
  warmthScore: number;
  /** 1-10 百搭程度 */
  matchabilityScore: number;
  /** 是否容易显胖或压身高 */
  fitRisk: string;
  /** 可搭配颜色 */
  matchColors: string[];
  /** 可搭配品类 */
  matchCategories: string[];
  aiSummary: string;
}
