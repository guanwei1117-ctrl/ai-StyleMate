/**
 * 结构化穿搭分析 System Prompt
 *
 * M16：可选注入教练模式上下文（如果调用方传入 coachMode）
 */
export function buildStructuredOutfitPrompt(
  occasion?: string,
  knowledge?: string,
  coachMode?: string,
): string {
  const occasionHint = occasion ? `\n穿搭场合：${occasion}` : '\n穿搭场合：日常通勤/出街';

  // M16：教练模式补充说明
  const coachHint =
    coachMode && coachMode !== 'mixed'
      ? `\n## 用户教练模式：${coachMode === 'shopping' ? '购物顾问' : coachMode === 'occasion' ? '场合顾问' : '搭配教练'}
- improvements 必须根据模式调整：
  ${coachMode === 'shopping' ? '- 重点给"下次可以补什么单品"的建议' : ''}
  ${coachMode === 'occasion' ? '- 重点给"什么场合更合适"的建议' : ''}
  ${coachMode === 'combination' ? '- 重点给"搭配原理"（颜色/版型/风格呼应）的解释' : ''}`
      : '';

  return `你是 StyleMate 的专业穿搭分析师。请对这张穿搭照片进行结构化分析。${occasionHint}
${knowledge ? '\n' + knowledge + '\n' : ''}
${coachHint}
分析要求：
1. items：识别照片中每件衣物，type 从 top / bottom / outerwear / dress / shoes / accessory 中选。
   每件衣物给出名称、颜色、风格标签、适合季节、正式程度(1-5)、百搭程度(1-10)。
2. body_suggestions：针对用户身材的穿搭建议（2-4条，如"提高腰线""避免过宽上衣"）。
3. style_tags：这套穿搭的整体风格标签（2-5个，如"通勤""温柔""简约"）。
4. problems：当前搭配存在的问题（1-3条，如"上下装比例略平"）。
5. improvements：具体改良建议（2-4条，如"换成浅口鞋""增加腰带"）。

必须只返回 JSON，不要 markdown，不要任何额外文字。结构如下：
{
  "items": [
    {
      "type": "top",
      "name": "白色针织上衣",
      "color": "white",
      "style": ["clean", "soft", "commute"],
      "season": ["spring", "autumn"],
      "formality": 3,
      "matchability": 8
    }
  ],
  "body_suggestions": ["提高腰线", "避免过宽上衣"],
  "style_tags": ["通勤", "温柔", "简约"],
  "problems": ["上下装比例略平", "鞋子风格不够统一"],
  "improvements": ["换成浅口鞋", "增加腰带"]
}`;
}
