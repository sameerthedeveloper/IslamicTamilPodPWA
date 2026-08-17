import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '@/common/prisma/prisma.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Admin')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const [episodeCount, scholarCount, userCount, storageAgg, recentEpisodes] =
      await Promise.all([
        this.prisma.episode.count(),
        this.prisma.scholar.count(),
        this.prisma.user.count(),
        this.prisma.audioAsset.aggregate({ _sum: { fileSize: true } }),
        this.prisma.episode.findMany({
          take: 10,
          orderBy: { updatedAt: 'desc' },
          include: { scholar: true },
        }),
      ]);

    return {
      episodes: episodeCount,
      scholars: scholarCount,
      users: userCount,
      storageBytes: storageAgg._sum.fileSize ?? 0,
      recentActivity: recentEpisodes.map((e) => ({
        id: e.id,
        title: e.title,
        scholar: e.scholar?.name,
        status: e.status,
        updatedAt: e.updatedAt,
      })),
    };
  }

  @Get('users')
  async users() {
    const [users, lastActive] = await Promise.all([
      this.prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listeningHistory.groupBy({
        by: ['userId'],
        _max: { listenedAt: true },
      }),
    ]);

    const lastActiveMap = new Map(
      lastActive.map((row) => [row.userId, row._max.listenedAt]),
    );

    return users.map((u) => ({
      ...u,
      lastActiveAt: lastActiveMap.get(u.id) ?? null,
    }));
  }
}
