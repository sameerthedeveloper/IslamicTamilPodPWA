import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '@/common/prisma/prisma.service';
import { StorageService } from '@/common/storage/storage.service';
import { AUDIO_QUEUE } from '@/common/queue/queue.module';
import { AudioProcessingJob } from '@/common/queue/queue.constants';

@Injectable()
export class AudioService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    @Inject(AUDIO_QUEUE) private audioQueue: Queue<AudioProcessingJob>,
  ) {}

  // Upload is fast: store the raw file, mark the episode PROCESSING, and hand
  // off transcode/duration extraction to the worker via BullMQ. The API
  // process never runs ffmpeg itself.
  async uploadForEpisode(episodeId: number, file: any) {
    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode) throw new NotFoundException('Episode not found');

    const ext = (file.originalname.split('.').pop() || 'mp3').toLowerCase();
    const rawStorageKey = `episodes/${episodeId}/raw-${Date.now()}.${ext}`;

    await this.storage.put(rawStorageKey, file.buffer, file.size, file.mimetype);

    const audioAsset = await this.prisma.audioAsset.upsert({
      where: { episodeId },
      create: { episodeId, storageKey: rawStorageKey, format: ext, fileSize: file.size },
      update: { storageKey: rawStorageKey, format: ext, fileSize: file.size },
    });

    await this.prisma.episode.update({
      where: { id: episodeId },
      data: { status: 'PROCESSING' },
    });

    const job = await this.audioQueue.add('process', {
      episodeId,
      rawStorageKey,
      originalFilename: file.originalname,
    });

    return { audioAsset, jobId: job.id };
  }

  async jobStatus(jobId: string) {
    const job = await this.audioQueue.getJob(jobId);
    if (!job) throw new NotFoundException('Job not found');
    const state = await job.getState();
    return { id: job.id, state, progress: job.progress, returnvalue: job.returnvalue };
  }
}
