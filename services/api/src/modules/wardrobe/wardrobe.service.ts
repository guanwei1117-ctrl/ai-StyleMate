import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WardrobeItem } from './entities/wardrobe-item.entity';
import { Outfit } from './entities/outfit.entity';
import { GarmentRecognitionSkill } from '../ai-skills/garment-recognition/garment-recognition.skill';
import { GarmentRecognitionResult } from '../ai-skills/garment-recognition/garment-recognition.dto';

@Injectable()
export class WardrobeService {
  private readonly logger = new Logger(WardrobeService.name);

  constructor(
    @InjectRepository(WardrobeItem)
    private readonly itemRepo: Repository<WardrobeItem>,
    @InjectRepository(Outfit)
    private readonly outfitRepo: Repository<Outfit>,
    private readonly garmentRecognitionSkill: GarmentRecognitionSkill,
  ) {}

  /**
   * AI 识别衣物并直接落库
   *
   * @param userId 用户 ID
   * @param imageBase64 衣物图片 base64
   * @param imageUrls 可选：图片 URL 列表（用于前端展示）
   * @returns 创建好的 WardrobeItem
   */
  async recognizeAndAddItem(
    userId: string,
    imageBase64: string,
    imageUrls?: string[],
  ): Promise<{ item: WardrobeItem; recognition: GarmentRecognitionResult }> {
    this.logger.log(`开始 AI 识别衣物 | userId: ${userId}`);
    const recognition = await this.garmentRecognitionSkill.recognize({ imageBase64 });

    const item = this.itemRepo.create({
      userId,
      category: recognition.category as WardrobeItem['category'],
      subCategory: recognition.subCategory,
      color: recognition.color,
      pattern: recognition.pattern,
      material: recognition.material,
      season: recognition.season,
      imageUrls: imageUrls ?? [],
      styleTags: recognition.styleTags,
      occasionTags: recognition.occasionTags,
      formalityScore: recognition.formalityScore,
      warmthScore: recognition.warmthScore,
      matchabilityScore: recognition.matchabilityScore,
      fitRisk: recognition.fitRisk,
      matchColors: recognition.matchColors,
      matchCategories: recognition.matchCategories,
      aiSummary: recognition.aiSummary,
      aiTags: {
        recognized: true,
        matchColors: recognition.matchColors,
        matchCategories: recognition.matchCategories,
      },
    });

    const saved = await this.itemRepo.save(item);
    this.logger.log(`衣物识别并落库完成 | itemId: ${saved.id}`);
    return { item: saved, recognition };
  }

  // ---------- 衣物管理 ----------
  async addItem(data: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const item = this.itemRepo.create(data);
    return this.itemRepo.save(item);
  }

  async getUserItems(userId: string, category?: string, subCategory?: string): Promise<WardrobeItem[]> {
    const where: Record<string, unknown> = { userId };
    if (category) where.category = category;
    if (subCategory) where.subCategory = subCategory;
    return this.itemRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getItemById(id: string, userId?: string): Promise<WardrobeItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('衣物不存在');
    // 归属校验：登录用户只能访问自己的衣物
    if (userId && item.userId !== userId) {
      throw new NotFoundException('衣物不存在');
    }
    return item;
  }

  async updateItem(id: string, data: Partial<WardrobeItem>, userId?: string): Promise<WardrobeItem> {
    const item = await this.getItemById(id, userId);
    Object.assign(item, data);
    return this.itemRepo.save(item);
  }

  async deleteItem(id: string, userId?: string): Promise<void> {
    const item = await this.getItemById(id, userId);
    await this.itemRepo.remove(item);
  }

  // ---------- 搭配管理 ----------
  async createOutfit(data: Partial<Outfit>): Promise<Outfit> {
    const outfit = this.outfitRepo.create(data);
    return this.outfitRepo.save(outfit);
  }

  async getUserOutfits(userId: string): Promise<Outfit[]> {
    return this.outfitRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOutfitById(id: string, userId?: string): Promise<Outfit> {
    const outfit = await this.outfitRepo.findOne({ where: { id } });
    if (!outfit) throw new NotFoundException('搭配不存在');
    // 归属校验：登录用户只能访问自己的搭配
    if (userId && outfit.userId !== userId) {
      throw new NotFoundException('搭配不存在');
    }
    return outfit;
  }

  async deleteOutfit(id: string, userId?: string): Promise<void> {
    const outfit = await this.getOutfitById(id, userId);
    await this.outfitRepo.remove(outfit);
  }
}
