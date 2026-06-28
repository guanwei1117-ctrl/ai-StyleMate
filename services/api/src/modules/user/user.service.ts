import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBodyProfile } from './entities/user-body-profile.entity';
import { UserStylePreference } from './entities/user-style-preference.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserBodyProfile)
    private readonly bodyProfileRepo: Repository<UserBodyProfile>,
    @InjectRepository(UserStylePreference)
    private readonly stylePrefRepo: Repository<UserStylePreference>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
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

  async getUserProfile(userId: string) {
    const user = await this.findById(userId);
    const bodyProfile = await this.bodyProfileRepo.findOne({ where: { userId } });
    const stylePreference = await this.stylePrefRepo.findOne({ where: { userId } });

    return {
      user,
      bodyProfile,
      stylePreference,
    };
  }
}
