import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';

const CACHE_KEY = 'topics:list';
const CACHE_TTL = 900; // 15min

@Injectable()
export class TopicsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async create(data: { name: string }) {
    const created = await this.prisma.topic.create({ data });
    await this.cache.invalidatePrefix('topics:');
    return created;
  }

  async findAll() {
    const cached = await this.cache.get(CACHE_KEY);
    if (cached) return cached;

    const topics = await this.prisma.topic.findMany({
      include: { episodes: { take: 1 } },
    });
    await this.cache.set(CACHE_KEY, topics, CACHE_TTL);
    return topics;
  }
}
