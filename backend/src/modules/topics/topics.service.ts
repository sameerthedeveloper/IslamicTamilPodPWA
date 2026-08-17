import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string }) {
    return this.prisma.topic.create({ data });
  }

  async findAll() {
    return this.prisma.topic.findMany({
      include: { episodes: { take: 1 } },
    });
  }
}
