import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  private redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const checks: Record<string, boolean> = { db: false, redis: false };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.db = true;
    } catch {}

    try {
      await this.redis.connect();
      await this.redis.ping();
      checks.redis = true;
    } catch {
    } finally {
      this.redis.disconnect();
    }

    const healthy = checks.db && checks.redis;
    if (!healthy) throw new ServiceUnavailableException({ status: 'error', checks });

    return { status: 'ok', checks };
  }
}
