import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * 资源所有权守卫：验证当前登录用户是否是所请求资源的拥有者。
 * 必须在 JwtAuthGuard 之后使用（依赖 req.user.sub）。
 *
 * 检查优先级：
 * 1. req.body.userId
 * 2. req.query.userId
 * 3. req.params.userId
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authenticatedUserId = request.user?.sub;

    if (!authenticatedUserId) {
      throw new ForbiddenException('未登录，无权访问此资源');
    }

    // 从请求的多个位置查找资源 userId
    const resourceUserId =
      request.body?.userId ??
      request.query?.userId ??
      request.params?.userId;

    if (!resourceUserId) {
      // 请求中没有指定 userId，允许通过（由 controller 自行处理）
      return true;
    }

    if (authenticatedUserId !== resourceUserId) {
      throw new ForbiddenException('无权访问其他用户的资源');
    }

    return true;
  }
}
