import { Injectable, Logger } from '@nestjs/common';
import { UserStyleDNA, StyleAnalysisReport, StyleMatchResult } from '@stylemate/shared';
import STYLE_DATABASE, { StyleDefinition } from './data/style-database';
import { analyzeAllStyles, matchUserToStyle } from './matcher/matcher.service';
import { MemoryService } from '../memory/memory.service';

export interface ScoringSnapshotDto {
  userId: string;
  timestamp: string;
  userProfile: {
    bodyShape: string;
    ageGroup: string | null;
    occupation: string | null;
    budget: string | null;
    climate: string | null;
    interests: string[];
    priorities: string[];
    dressingGoals: string[];
    styleOpenness: number | null;
  };
  matchResults: StyleMatchResult[];
}

@Injectable()
export class StyleEngineService {
  private readonly logger = new Logger(StyleEngineService.name);
  private readonly styles: StyleDefinition[] = STYLE_DATABASE;

  constructor(private readonly memoryService?: MemoryService) {}

  /** 获取所有风格列表（简要信息） */
  getAllStyles() {
    return this.styles.map((s) => ({
      id: s.id,
      name: s.name,
      alias: s.alias,
      category: s.category,
      description: s.description,
      philosophy: s.philosophy,
      difficulty: s.difficulty,
      silhouette: s.silhouette,
      keyItems: s.keyItems.slice(0, 5),
      colorPalette: s.colorPalette,
    }));
  }

  /** 获取单个风格详情 */
  getStyleById(id: string) {
    const style = this.styles.find((s) => s.id === id);
    if (!style) return null;
    return style;
  }

  /** 获取按分类分组的风格列表 */
  getStylesByCategory() {
    const grouped: Record<string, typeof this.styles> = {};
    this.styles.forEach((s) => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    return grouped;
  }

  /** 分析用户风格 DNA，返回完整报告 */
  analyzeUserDNA(dna: UserStyleDNA): StyleAnalysisReport {
    return analyzeAllStyles(dna, this.styles);
  }

  /** 用户 DNA vs 单个风格 */
  matchSingleStyle(dna: UserStyleDNA, styleId: string): StyleMatchResult | null {
    const style = this.styles.find((s) => s.id === styleId);
    if (!style) return null;
    return matchUserToStyle(dna, style);
  }

  /**
   * 保存前端评分快照到后端记忆
   * 将前端评分结果同步到 MemoryService.updateStyleProfile()
   */
  async saveSnapshot(dto: ScoringSnapshotDto): Promise<{ success: boolean }> {
    if (!this.memoryService) {
      this.logger.warn('MemoryService 未注入，跳过快照保存');
      return { success: false };
    }

    const profile = dto.userProfile;
    const topStyles = dto.matchResults
      .filter((r) => r.score >= 65)
      .slice(0, 5)
      .map((r) => r.styleName);

    await this.memoryService.updateStyleProfile(dto.userId, {
      bodyType: profile.bodyShape || undefined,
      heightRange: undefined,
      skinTone: undefined,
      faceStyle: undefined,
      suitableStyles: topStyles,
      likedStyles: topStyles,
      dressGoals: profile.dressingGoals,
      bodyConcerns: undefined,
      commonOccasions: undefined,
    });

    this.logger.log(`用户 ${dto.userId} 评分快照已同步（${topStyles.length} 种风格）`);
    return { success: true };
  }
}
