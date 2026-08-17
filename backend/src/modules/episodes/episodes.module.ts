import { Module } from '@nestjs/common';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [EpisodesController],
  providers: [EpisodesService, PrismaService],
})
export class EpisodesModule {}