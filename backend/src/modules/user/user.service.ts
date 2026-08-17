import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getHistory(userId: number, limit = 20) {
    return this.prisma.listeningHistory.findMany({
      where: { userId },
      include: { episode: { include: { scholar: true } } },
      orderBy: { listenedAt: 'desc' },
      take: limit,
    });
  }

  async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: { episode: { include: { scholar: true } } },
    });
  }

  async addBookmark(userId: number, episodeId: number) {
    return this.prisma.bookmark.create({
      data: { userId, episodeId },
      include: { episode: true },
    });
  }

  async removeBookmark(userId: number, episodeId: number) {
    return this.prisma.bookmark.deleteMany({
      where: { userId, episodeId },
    });
  }

  async getListeningProgress(userId: number) {
    return this.prisma.listeningProgress.findMany({
      where: { userId },
      include: { episode: { include: { scholar: true } } },
    });
  }

  async updateListeningProgress(
    userId: number,
    episodeId: number,
    positionSeconds: number,
    durationSeconds: number,
  ) {
    return this.prisma.listeningProgress.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: {
        userId,
        episodeId,
        positionSeconds,
        durationSeconds,
      },
      update: {
        positionSeconds,
        durationSeconds,
        lastPlayedAt: new Date(),
        completed: positionSeconds >= durationSeconds * 0.9,
      },
    });
  }
}
