import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key).catch(() => null);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds).catch(() => {});
  }

  // Invalidate everything under a prefix, e.g. "episodes:" on publish/update.
  async invalidatePrefix(prefix: string) {
    const keys = await this.redis.keys(`${prefix}*`).catch(() => []);
    if (keys.length) await this.redis.del(...keys).catch(() => {});
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
