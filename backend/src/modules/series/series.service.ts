import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { slugify } from '@/common/utils/slugify';

@Injectable()
export class SeriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.series.create({
      data: {
        ...data,
        slug: slugify(data.title),
      },
      include: { scholar: true, episodes: true },
    });
  }

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [series, total] = await Promise.all([
      this.prisma.series.findMany({
        where: { status: 'PUBLISHED' },
        skip: offset,
        take: limit,
        include: { scholar: true, episodes: { take: 1 } },
      }),
      this.prisma.series.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return {
      data: series,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.series.findUnique({
      where: { slug },
      include: { scholar: true, episodes: true },
    });
  }
}
