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
 *
 * 开发环境：可通过 ADMIN_PHONES 环境变量设置多个管理员手机号（逗号分隔），
 * 即使数据库中 role 未设置也能通过校验。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; role?: string; phone?: string } | undefined;

    if (!user) {
      throw new ForbiddenException('未认证');
    }

    // 方式一：数据库 role 字段校验
    if (user.role === 'admin') {
      return true;
    }

    // 方式二（开发环境）：环境变量 ADMIN_PHONES 中配置的手机号
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map((p) => p.trim()).filter(Boolean);
    if (adminPhones.length > 0 && user.phone && adminPhones.includes(user.phone)) {
      return true;
    }

    throw new ForbiddenException('需要管理员权限');
  }
}
