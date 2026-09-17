import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 放过 OPTIONS 预检请求，让 CORS 中间件正常响应 200 + CORS 头
  canActivate(context) {
    const { method } = context.switchToHttp().getRequest();
    if (method === 'OPTIONS') return true;
    return super.canActivate(context);
  }
}
