import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, type?: 'episode' | 'scholar' | 'topic') {
    const searchWhere = { OR: [{ title: { contains: query, mode: 'insensitive' } }] };

    if (type === 'episode' || !type) {
      const episodes = await this.prisma.episode.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        include: { scholar: true },
      });

      if (type === 'episode') return episodes;
    }

    if (type === 'scholar' || !type) {
      const scholars = await this.prisma.scholar.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { biography: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      if (type === 'scholar') return scholars;
    }

    if (type === 'topic' || !type) {
      const topics = await this.prisma.topic.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 10,
      });

      if (type === 'topic') return topics;
    }

    // Return all if no type specified
    if (!type) {
      return {
        episodes: await this.prisma.episode.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
          include: { scholar: true },
        }),
        scholars: await this.prisma.scholar.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { biography: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        topics: await this.prisma.topic.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          take: 5,
        }),
      };
    }
  }
}
