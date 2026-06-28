import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { WardrobeService } from '../wardrobe/wardrobe.service';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly userService: UserService,
    private readonly wardrobeService: WardrobeService,
  ) {}

  /**
   * 生成穿搭推荐
   * MVP 阶段使用规则引擎 + LLM API 的架构预留
   */
  async generateOutfitRecommendation(userId: string, occasion?: string) {
    // 获取用户画像
    const profile = await this.userService.getUserProfile(userId);

    // 获取衣橱物品
    const wardrobeItems = await this.wardrobeService.getUserItems(userId);

    // TODO: 调用 LLM API 生成推荐
    // 当前返回模拟数据
    return {
      message: '推荐服务已就绪',
      userProfile: {
        bodyShape: profile.bodyProfile?.bodyShape || 'unknown',
        skinTone: profile.bodyProfile?.skinTone || 'unknown',
        preferredStyles: profile.stylePreference?.preferredStyles || [],
      },
      wardrobeCount: wardrobeItems.length,
      occasion: occasion || 'daily_commute',
      // AI 推荐结果将在集成 LLM API 后返回
      outfits: [],
      reasoning: '即将接入 AI 推荐引擎，敬请期待。',
    };
  }

  /**
   * 分析衣橱缺口
   */
  async analyzeWardrobeGaps(userId: string) {
    const items = await this.wardrobeService.getUserItems(userId);

    const categoryCount: Record<string, number> = {};
    items.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const essentials = {
      top: 3,
      bottom: 3,
      outerwear: 2,
      dress: 1,
      shoes: 3,
      accessory: 2,
    };

    const gaps = Object.entries(essentials)
      .filter(([cat, min]) => (categoryCount[cat] || 0) < min)
      .map(([cat, min]) => ({
        category: cat,
        current: categoryCount[cat] || 0,
        recommended: min,
        missing: min - (categoryCount[cat] || 0),
      }));

    return { gaps, totalItems: items.length };
  }
}
