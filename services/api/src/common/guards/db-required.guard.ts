import { Injectable, CanActivate, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';

/**
 * 数据库可用性守卫：当 ENABLE_DB=false 时返回 503 而不是崩溃。
 * 应用于需要数据库的端点（衣橱、推荐、记忆等）。
 */
@Injectable()
export class DbRequiredGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    if (process.env.ENABLE_DB === 'false') {
      throw new ServiceUnavailableException(
        '此功能需要数据库支持，请启用 PostgreSQL 后重试（设置 ENABLE_DB=true）',
      );
    }
    return true;
  }
}
