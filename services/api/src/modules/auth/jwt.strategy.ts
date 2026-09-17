import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'stylemate-dev-jwt-secret',
    });
    // 启动时打印一次，便于排查 secret 不一致
    const usingFallback = !process.env.JWT_SECRET;
    this.logger.log(
      `JwtStrategy 初始化完成，secret 来源: ${usingFallback ? 'fallback(stylemate-dev-jwt-secret)' : 'env(JWT_SECRET)'}`,
    );
  }

  async validate(payload: { sub: string }) {
    // 调试日志：每个请求的 token 解析结果
    this.logger.debug(`validate() payload.sub = ${payload?.sub}`);
    try {
      const user = await this.authService.validateUser(payload);
      this.logger.debug(
        `validate() 通过 user=${user.id} role=${user.role} phone=${user.phone}`,
      );
      return user;
    } catch (err) {
      this.logger.warn(
        `validate() 失败 sub=${payload?.sub} 原因: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }
  }
}
