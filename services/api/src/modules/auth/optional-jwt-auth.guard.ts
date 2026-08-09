import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 可选 JWT 认证守卫 — 不强制要求登录
 *
 * 如果请求带有有效 JWT，则提取用户信息到 request.user；
 * 如果没有 JWT 或令牌无效，不阻断请求，request.user 为 undefined。
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 直接调用父类，但 handleRequest 会吞掉异常
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // 不抛异常，user 可能为 null
    return user || null;
  }
}
