import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateEpisodeDto, UpdateEpisodeDto } from './dtos';
import { slugify } from '@/common/utils/slugify';

@Injectable()
export class EpisodesService {
  constructor(private prisma: PrismaService) {}

  async create(createEpisodeDto: CreateEpisodeDto) {
    const { title, scholarId, seriesId, topics, ...rest } = createEpisodeDto;
    const slug = slugify(title);

    return this.prisma.episode.create({
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
  }

  async findAll(page = 1, limit = 20) {
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
    const { title, ...rest } = updateEpisodeDto;

    return this.prisma.episode.update({
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
  }

  async remove(id: number) {
    return this.prisma.episode.delete({ where: { id } });
  }
}
