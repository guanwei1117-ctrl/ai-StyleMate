import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AiRateLimiter {
  private readonly buckets = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor() {
    this.maxRequests = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS || 5);
    this.windowMs = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  }

  /** 测试用工厂方法，便于注入自定义限流参数 */
  static forTesting(maxRequests: number, windowMs: number): AiRateLimiter {
    const limiter = Object.create(AiRateLimiter.prototype) as AiRateLimiter;
    Object.assign(limiter, { buckets: new Map(), maxRequests, windowMs });
    return limiter;
  }

  assertAllowed(key: string, now = Date.now()): void {
    const windowStart = now - this.windowMs;
    const recentRequests = (this.buckets.get(key) || []).filter((timestamp) => timestamp > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      this.buckets.set(key, recentRequests);
      throw new HttpException('AI 分析请求过于频繁，请稍后再试。', HttpStatus.TOO_MANY_REQUESTS);
    }

    recentRequests.push(now);
    this.buckets.set(key, recentRequests);
  }
}
