import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WardrobeItem } from './entities/wardrobe-item.entity';
import { Outfit } from './entities/outfit.entity';

@Injectable()
export class WardrobeService {
  constructor(
    @InjectRepository(WardrobeItem)
    private readonly itemRepo: Repository<WardrobeItem>,
    @InjectRepository(Outfit)
    private readonly outfitRepo: Repository<Outfit>,
  ) {}

  // ---------- 衣物管理 ----------
  async addItem(data: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const item = this.itemRepo.create(data);
    return this.itemRepo.save(item);
  }

  async getUserItems(userId: string, category?: string): Promise<WardrobeItem[]> {
    const where: Record<string, unknown> = { userId };
    if (category) where.category = category;
    return this.itemRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getItemById(id: string): Promise<WardrobeItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('衣物不存在');
    return item;
  }

  async updateItem(id: string, data: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const item = await this.getItemById(id);
    Object.assign(item, data);
    return this.itemRepo.save(item);
  }

  async deleteItem(id: string): Promise<void> {
    const item = await this.getItemById(id);
    await this.itemRepo.remove(item);
  }

  async incrementWearCount(id: string): Promise<void> {
    await this.itemRepo.increment({ id }, 'wearCount', 1);
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

  async getOutfitById(id: string): Promise<Outfit> {
    const outfit = await this.outfitRepo.findOne({ where: { id } });
    if (!outfit) throw new NotFoundException('搭配不存在');
    return outfit;
  }

  async deleteOutfit(id: string): Promise<void> {
    const outfit = await this.getOutfitById(id);
    await this.outfitRepo.remove(outfit);
  }
}
