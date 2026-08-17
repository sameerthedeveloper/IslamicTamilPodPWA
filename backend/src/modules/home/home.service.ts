import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getHomeData(userId?: number) {
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

    return {
      sections: {
        continueListening: listeningHistory,
        recentEpisodes,
        featuredEpisodes,
        topScholars,
        topics,
      },
    };
  }
}
