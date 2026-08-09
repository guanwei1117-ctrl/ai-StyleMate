import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';

/**
 * 可选鉴权守卫：有 JWT Token 则验证并注入 req.user，无 Token 也放行。
 *
 * 独立实现，不依赖 Passport 策略注册，因此即使 AuthModule 未加载也能工作。
 * 用于评分/风格分析等匿名可用但登录后关联账号的功能。
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'stylemate-dev-jwt-secret';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (request as any).user = null;
      return true;
    }

    try {
      const token = authHeader.slice(7);
      const payload = this.verifyJwt(token);
      (request as any).user = { sub: payload.sub, ...payload };
    } catch {
      (request as any).user = null;
    }

    return true;
  }

  private verifyJwt(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

    const crypto = require('crypto');
    const header = parts[0];
    const signature = parts[2];
    const expectedSignature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${parts[1]}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    return payload;
  }
}
