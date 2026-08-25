import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * RolesGuard —— 基于 request.user.role 校验管理员权限。
 * 默认要求 role === 'admin'。
 *
 * 在 Controller 上用 @UseGuards(JwtAuthGuard, RolesGuard) 即可。
 * JwtAuthGuard 先执行，把 user 注入 request；RolesGuard 再校验 role。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; role?: string } | undefined;

    if (!user) {
      throw new ForbiddenException('未认证');
    }
    if (user.role !== 'admin') {
      throw new ForbiddenException('需要管理员权限');
    }
    return true;
  }
}
