import { Injectable } from '@nestjs/common';
import { AnalyzeStyleProfileRequestDto } from './dto/analyze-style-profile.dto';

@Injectable()
export class PromptBuilderService {
  buildStyleProfileSystemPrompt(): string {
    return `你是 StyleMate 的专业形象顾问，服务 16-25 岁年轻用户。你的任务是把用户照片、基础画像、自述想法和本地候选风格，整合成一个真实可执行的风格档案。

表达要求：
- 专业但年轻化，不油腻，不营销。
- 先给简洁结论，再展开原因。
- 可以明确指出"不适合"，但语气保持尊重，给替代方案。
- 不要声称识别了身份、年龄、种族或敏感属性；只分析穿搭相关视觉特征。
- 如果照片缺失，就说明该部分依据文字和基础画像判断。

必须只返回 JSON，不要 markdown，不要解释 JSON 外的文字。结构如下：
{
  "summary": "一句话核心结论",
  "visualAnalysis": {
    "face": "正脸照相关观察；没有照片则说明未提供",
    "body": "全身照/身材比例相关观察；没有照片则说明未提供",
    "confidence": 0.0
  },
  "intentAnalysis": {
    "likedKeywords": ["..."],
    "dislikedKeywords": ["..."],
    "desiredImpression": ["..."],
    "scenes": ["..."],
    "constraints": ["..."],
    "cleanedStatement": "把用户凌乱自述整理成适合推荐系统使用的一段话"
  },
  "recommendedStyles": [
    {
      "styleId": "候选风格 ID，只能来自候选列表",
      "score": 0,
      "reasons": ["为什么适合，2-4条"],
      "notices": ["需要注意或不适合的点，1-3条"]
    }
  ],
  "avoidanceAdvice": ["明确不建议的版型/元素/搭法"],
  "nextActions": ["下一步可执行建议"],
  "memoryMerge": {
    "suitableStyles": ["适合的风格 ID，仅限候选中的 styleId"],
    "likedStyles": ["用户主观喜欢的风格中文标签"],
    "dislikedStyles": ["用户不喜欢的风格中文标签"],
    "preferredColors": ["推荐的颜色，中文色名"],
    "dislikedColors": ["不建议的颜色"],
    "bodyConcerns": ["身材顾虑，如 显胯宽、腿型修饰"],
    "dressGoals": ["穿搭目标，如 显高、通勤得体"],
    "commonOccasions": ["日常场景，如 通勤、周末出街"],
    "avoidRules": [{"rule": "避免的穿搭规则", "source": "ai:style_analysis", "weight": 1}]
  }
}`;
  }

  buildStyleProfileUserPrompt(dto: AnalyzeStyleProfileRequestDto): string {
    const profile = dto.profile;
    const candidates = dto.candidates.slice(0, 12).map((candidate) => ({
      styleId: candidate.styleId,
      styleName: candidate.styleName,
      category: candidate.category,
      localScore: candidate.localScore,
      description: candidate.description,
      keyItems: candidate.keyItems,
      localReasons: candidate.matchReasons,
      dimension: candidate.dimension,
      dimensionLabel: candidate.dimensionLabel,
      pillars: candidate.pillars,
      breakdown: candidate.breakdown,
      philosophy: candidate.philosophy,
      difficulty: candidate.difficulty,
      silhouette: candidate.silhouette,
      colorPalette: candidate.colorPalette,
    }));

    return `用户填写信息如下，请把性别、身高体重、三围、职业、日常场景、自定义场景、城市气候、预算、目标、偏好和自述全部纳入判断：
${JSON.stringify(profile, null, 2)}

风格库候选如下。每个候选包含本地规则分数、三支柱分、风格维度、理念、难度、廓形、核心单品、颜色和本地匹配理由。请综合用户填写信息 + 候选风格库信息，重排和选择最适合的风格，不要编造不存在的 styleId：
${JSON.stringify(candidates, null, 2)}`;
  }

  /** 构建穿搭评分 User Message */
  buildUserMessage(occasion?: string): string {
    const occasionHint = occasion
      ? `\n穿搭场合：${occasion}`
      : '\n穿搭场合：日常通勤/出街';

    return `请分析这套穿搭。${occasionHint}

注意：你要像一个懂穿搭的朋友一样评价，直接、不废话、给真实建议。严格按照 JSON 格式输出结果。`;
  }
}
