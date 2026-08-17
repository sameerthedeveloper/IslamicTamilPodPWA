import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';

const CACHE_TTL = 300; // 5min

@Injectable()
export class HomeService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getHomeData(userId?: number) {
    // Only the anonymous/no-user response is cacheable — per-user
    // continueListening would otherwise leak between users.
    const cacheKey = 'home:anonymous';
    if (!userId) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const [recentEpisodes, featuredEpisodes, topScholars, topics] = await Promise.all([
      this.prisma.episode.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        include: { scholar: true },
      }),
      this.prisma.featured.findMany({
        orderBy: { position: 'asc' },
        take: 5,
      }),
      this.prisma.scholar.findMany({
        where: { status: 'ACTIVE' },
        take: 6,
        include: { episodes: { take: 1 } },
      }),
      this.prisma.topic.findMany({ take: 8 }),
    ]);

    const listeningHistory = userId
      ? await this.prisma.listeningHistory.findMany({
          where: { userId },
          orderBy: { listenedAt: 'desc' },
          take: 5,
          include: { episode: { include: { scholar: true } } },
        })
      : [];

    const result = {
      sections: {
        continueListening: listeningHistory,
        recentEpisodes,
        featuredEpisodes,
        topScholars,
        topics,
      },
    };

    if (!userId) await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }
}
