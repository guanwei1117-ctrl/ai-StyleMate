import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AiRateLimiter {
  private readonly buckets = new Map<string, number[]>();

  constructor(
    private readonly maxRequests = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS || 10),
    private readonly windowMs = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  ) {}

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
