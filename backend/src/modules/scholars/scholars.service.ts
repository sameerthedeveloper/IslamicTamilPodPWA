import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { slugify } from '@/common/utils/slugify';

@Injectable()
export class ScholarsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; biography?: string; image?: string }) {
    return this.prisma.scholar.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        biography: data.biography,
        image: data.image,
      },
    });
  }

  async findAll() {
    return this.prisma.scholar.findMany({
      where: { status: 'ACTIVE' },
      include: { episodes: { take: 3 } },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.scholar.findUnique({
      where: { slug },
      include: { episodes: true, series: true },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.scholar.update({
      where: { id },
      data,
    });
  }
}
