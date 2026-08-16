import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBodyProfile } from './entities/user-body-profile.entity';
import { UserStylePreference } from './entities/user-style-preference.entity';
import { UserLifestyleProfile } from './entities/user-lifestyle-profile.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserBodyProfile)
    private readonly bodyProfileRepo: Repository<UserBodyProfile>,
    @InjectRepository(UserStylePreference)
    private readonly stylePrefRepo: Repository<UserStylePreference>,
    @InjectRepository(UserLifestyleProfile)
    private readonly lifestyleProfileRepo: Repository<UserLifestyleProfile>,
  ) {}

  /** 将旧 userId 的数据迁移到新 userId（登录/注册时调用） */
  async migrateData(fromUserId: string, toUserId: string): Promise<void> {
    // 使用原生查询迁移所有关联表
    const tablesToUpdate = [
      'user_body_profiles',
      'user_style_preferences',
      'user_lifestyle_profiles',
      'wardrobe_items',
      'outfits',
      'outfit_feedbacks',
      'user_style_profiles',
      'user_current_intents',
      'user_memory_summaries',
      'feedback',
      'shopping_list_items',
    ];

    for (const table of tablesToUpdate) {
      try {
        await this.userRepo.manager.query(
          `UPDATE "${table}" SET user_id = $1 WHERE user_id = $2`,
          [toUserId, fromUserId],
        );
      } catch {
        // 表可能不存在（首次运行），忽略
      }
    }
    this.logger.log(`数据迁移完成: ${fromUserId} → ${toUserId}`);
  }

  async create(
    data: { id?: string; nickname?: string; phone?: string },
  ): Promise<User> {
    if (data.id) {
      const existing = await this.userRepo.findOne({ where: { id: data.id } });
      if (existing) return existing;
      const user = this.userRepo.create({
        id: data.id,
        nickname: data.nickname,
        phone: data.phone,
      });
      return this.userRepo.save(user);
    }
    const user = this.userRepo.create({
      nickname: data.nickname,
      phone: data.phone,
    });
    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  /** 设置用户密码（仅写入，不可读取） */
  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.userRepo.update(userId, { passwordHash } as any);
  }

  /** 读取密码哈希（仅供 auth 验证使用） */
  async getPasswordHash(userId: string): Promise<string | null> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash' as keyof User],
    });
    return (user as any)?.passwordHash ?? null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { phone } });
  }

  async updateBodyProfile(
    userId: string,
    data: Partial<UserBodyProfile>,
  ): Promise<UserBodyProfile> {
    let profile = await this.bodyProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.bodyProfileRepo.create({ userId, ...data });
    } else {
      Object.assign(profile, data);
    }
    return this.bodyProfileRepo.save(profile);
  }

  async updateStylePreferences(
    userId: string,
    data: Partial<UserStylePreference>,
  ): Promise<UserStylePreference> {
    let prefs = await this.stylePrefRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.stylePrefRepo.create({ userId, ...data });
    } else {
      Object.assign(prefs, data);
    }
    return this.stylePrefRepo.save(prefs);
  }

  async updateLifestyleProfile(
    userId: string,
    data: Partial<UserLifestyleProfile>,
  ): Promise<UserLifestyleProfile> {
    let profile = await this.lifestyleProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.lifestyleProfileRepo.create({ userId, ...data });
    } else {
      Object.assign(profile, data);
    }
    return this.lifestyleProfileRepo.save(profile);
  }

  async getUserProfile(userId: string) {
    const user = await this.findById(userId);
    const bodyProfile = await this.bodyProfileRepo.findOne({ where: { userId } });
    const stylePreference = await this.stylePrefRepo.findOne({ where: { userId } });
    const lifestyleProfile = await this.lifestyleProfileRepo.findOne({ where: { userId } });

    return {
      user,
      bodyProfile,
      stylePreference,
      lifestyleProfile,
    };
  }

  async getBodyProfile(userId: string): Promise<UserBodyProfile | null> {
    return this.bodyProfileRepo.findOne({ where: { userId } });
  }

  async getStylePreference(userId: string): Promise<UserStylePreference | null> {
    return this.stylePrefRepo.findOne({ where: { userId } });
  }

  async getLifestyleProfile(userId: string): Promise<UserLifestyleProfile | null> {
    return this.lifestyleProfileRepo.findOne({ where: { userId } });
  }
}
