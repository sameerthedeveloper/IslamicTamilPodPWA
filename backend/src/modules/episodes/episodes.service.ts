import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';
import { CreateEpisodeDto, UpdateEpisodeDto } from './dtos';
import { slugify } from '@/common/utils/slugify';

const CACHE_PREFIX = 'episodes:';
const CACHE_TTL = 300; // 5min

@Injectable()
export class EpisodesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async create(createEpisodeDto: CreateEpisodeDto) {
    const { title, scholarId, seriesId, topics, ...rest } = createEpisodeDto;
    const slug = slugify(title);

    const created = await this.prisma.episode.create({
      data: {
        ...rest,
        title,
        slug,
        scholarId,
        seriesId,
        topics: topics
          ? {
              create: topics.map((topicName) => ({
                topic: {
                  connectOrCreate: {
                    where: { name: topicName },
                    create: { name: topicName },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        scholar: true,
        series: true,
        topics: { include: { topic: true } },
      },
    });
    await Promise.all([this.cache.invalidatePrefix(CACHE_PREFIX), this.cache.invalidatePrefix('home:')]);
    return created;
  }

  async findAll(page = 1, limit = 20) {
    page = Number(page) || 1;
    limit = Number(limit) || 20;

    const cacheKey = `${CACHE_PREFIX}list:${page}:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;

    const [episodes, total] = await Promise.all([
      this.prisma.episode.findMany({
        where: { status: 'PUBLISHED' },
        skip: offset,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          scholar: true,
          series: true,
          topics: { include: { topic: true } },
        },
      }),
      this.prisma.episode.count({ where: { status: 'PUBLISHED' } }),
    ]);

    const result = {
      data: episodes,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findAllAdmin(page = 1, limit = 50) {
    page = Number(page) || 1;
    limit = Number(limit) || 50;
    const offset = (page - 1) * limit;

    const [episodes, total] = await Promise.all([
      this.prisma.episode.findMany({
        skip: offset,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          scholar: true,
          series: true,
          topics: { include: { topic: true } },
        },
      }),
      this.prisma.episode.count(),
    ]);

    return {
      data: episodes,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.episode.findUnique({
      where: { id },
      include: {
        scholar: true,
        series: true,
        topics: { include: { topic: true } },
        audioAsset: true,
      },
    });
  }

  async update(id: number, updateEpisodeDto: UpdateEpisodeDto) {
    const { title, topics, ...rest } = updateEpisodeDto;

    if (rest.status === 'PUBLISHED') {
      const episode = await this.prisma.episode.findUnique({ where: { id } });
      if (episode) {
        const rights = await this.prisma.rights.findFirst({
          where: { scholarId: episode.scholarId },
          orderBy: { updatedAt: 'desc' },
        });
        if (rights && (rights.status === 'EXPIRED' || rights.status === 'REVOKED')) {
          throw new BadRequestException(
            `Cannot publish: rights for this scholar are ${rights.status}`,
          );
        }
      }
    }

    const updated = await this.prisma.episode.update({
      where: { id },
      data: {
        ...rest,
        ...(title && { title, slug: slugify(title) }),
      },
      include: {
        scholar: true,
        series: true,
        topics: { include: { topic: true } },
      },
    });
    await Promise.all([this.cache.invalidatePrefix(CACHE_PREFIX), this.cache.invalidatePrefix('home:')]);
    return updated;
  }

  async remove(id: number) {
    const removed = await this.prisma.episode.delete({ where: { id } });
    await Promise.all([this.cache.invalidatePrefix(CACHE_PREFIX), this.cache.invalidatePrefix('home:')]);
    return removed;
  }
}
