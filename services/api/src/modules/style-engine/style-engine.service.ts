import { Injectable } from '@nestjs/common';
import { UserStyleDNA, StyleAnalysisReport, StyleMatchResult } from '@stylemate/shared';
import STYLE_DATABASE, { StyleDefinition } from './data/style-database';
import { analyzeAllStyles, matchUserToStyle } from './matcher/matcher.service';

@Injectable()
export class StyleEngineService {
  private readonly styles: StyleDefinition[] = STYLE_DATABASE;

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
}
