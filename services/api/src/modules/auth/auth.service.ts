import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /** 注册：phone + password → JWT */
  async register(phone: string, password: string, nickname?: string) {
    const existing = await this.userService.findByPhone(phone);
    if (existing) throw new ConflictException('该手机号已注册');

    const passwordHash = this.hashPassword(password);
    const user = await this.userService.create({
      phone,
      nickname: nickname || `用户${phone.slice(-4)}`,
    });
    await this.userService.setPasswordHash(user.id, passwordHash);

    return this.issueToken(user.id);
  }

  /** 登录：phone + password → JWT */
  async login(phone: string, password: string) {
    const user = await this.userService.findByPhone(phone);
    if (!user) throw new UnauthorizedException('手机号未注册');

    const storedHash = await this.userService.getPasswordHash(user.id);
    if (!storedHash) {
      throw new UnauthorizedException('密码未设置，请先注册');
    }
    if (!this.verifyPassword(password, storedHash)) {
      throw new UnauthorizedException('密码错误');
    }

    return this.issueToken(user.id);
  }

  /** 验证 JWT payload */
  async validateUser(payload: { sub: string }): Promise<{ id: string }> {
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('用户不存在');
    return { id: user.id };
  }

  private issueToken(userId: string) {
    return {
      accessToken: this.jwtService.sign({ sub: userId }),
      userId,
    };
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
  }
}
