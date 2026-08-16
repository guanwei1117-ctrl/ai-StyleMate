import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

/**
 * 解析请求归属用户 ID（配合 OptionalAuthGuard 使用）：
 *
 * - 已登录（JWT 有效）→ 使用 token 的 sub 作为用户 ID；
 *   若客户端提供的 userId 与 sub 不一致，拒绝（防止越权）。
 * - 未登录 → 使用客户端提供的 userId（本地设备标识）。
 *
 * 该函数把"客户端 userId 可信"升级为"JWT 优先 + 归属校验"，
 * 同时保持匿名（未登录）用户的使用不受影响。
 */
export function resolveUserId(req: Request, provided?: string | null): string {
  const authed = (req as any).user?.sub as string | undefined;

  if (authed) {
    if (provided && provided !== authed) {
      throw new ForbiddenException('无权访问其他用户的数据');
    }
    return authed;
  }

  if (!provided) {
    throw new ForbiddenException('缺少用户标识');
  }
  return provided;
}

/** 仅返回已登录用户 ID，未登录返回 undefined（用于按资源 ID 的所有权校验） */
export function getAuthedUserId(req: Request): string | undefined {
  return (req as any).user?.sub as string | undefined;
}
