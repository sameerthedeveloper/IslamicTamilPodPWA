import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Admin')
@Controller('api/v1/admin/featured')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class FeaturedController {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  @Get()
  async findAll() {
    const featured = await this.prisma.featured.findMany({
      orderBy: { position: 'asc' },
    });
    const episodes = await this.prisma.episode.findMany({
      where: { id: { in: featured.map((f) => f.episodeId) } },
      include: { scholar: true },
    });
    const episodeMap = new Map(episodes.map((e) => [e.id, e]));
    return featured.map((f) => ({ ...f, episode: episodeMap.get(f.episodeId) ?? null }));
  }

  @Post()
  async create(@Body() data: any) {
    const maxPosition = await this.prisma.featured.aggregate({
      _max: { position: true },
    });
    const created = await this.prisma.featured.create({
      data: {
        episodeId: data.episodeId,
        position: data.position ?? (maxPosition._max.position ?? -1) + 1,
        featuredUntil: data.featuredUntil ? new Date(data.featuredUntil) : null,
      },
    });
    await this.cache.invalidatePrefix('home:');
    return created;
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    const updated = await this.prisma.featured.update({
      where: { id },
      data: {
        ...(data.position !== undefined && { position: data.position }),
        ...(data.featuredUntil !== undefined && {
          featuredUntil: data.featuredUntil ? new Date(data.featuredUntil) : null,
        }),
      },
    });
    await this.cache.invalidatePrefix('home:');
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const removed = await this.prisma.featured.delete({ where: { id } });
    await this.cache.invalidatePrefix('home:');
    return removed;
  }
}
