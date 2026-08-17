import 'reflect-metadata';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { StorageService } from '@/common/storage/storage.service';
import { AUDIO_PROCESSING_QUEUE, AudioProcessingJob, redisConnection } from '@/common/queue/queue.constants';

const run = promisify(execFile);
const prisma = new PrismaClient();
const storage = new StorageService();

// Runs as its own process (npm run start:worker) — never inside the API.
// Requires ffmpeg/ffprobe on PATH (installed in the Docker image).
async function processAudio(job: Job<AudioProcessingJob>) {
  const { episodeId, rawStorageKey } = job.data;
  const dir = await mkdtemp(join(tmpdir(), 'audio-'));
  const rawPath = join(dir, 'raw');
  const outPath = join(dir, 'out.mp3');

  try {
    await job.updateProgress(10);
    const stream = await storage.getObject(rawStorageKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    await writeFile(rawPath, Buffer.concat(chunks));

    await job.updateProgress(30);
    const settings = await prisma.systemSettings.findFirst();
    const bitrate = settings?.defaultBitrate ?? 128;

    const { stdout: probeOut } = await run('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      rawPath,
    ]);
    const duration = Math.round(parseFloat(probeOut.trim())) || null;

    await job.updateProgress(50);
    await run('ffmpeg', ['-y', '-i', rawPath, '-b:a', `${bitrate}k`, '-vn', outPath]);

    await job.updateProgress(80);
    const processed = await readFile(outPath);
    const finalKey = `episodes/${episodeId}/audio.mp3`;
    await storage.put(finalKey, processed, processed.length, 'audio/mpeg');
    await storage.remove(rawStorageKey).catch(() => {});

    await prisma.audioAsset.update({
      where: { episodeId },
      data: { storageKey: finalKey, format: 'mp3', bitrate, duration, fileSize: processed.length },
    });
    await prisma.episode.update({ where: { id: episodeId }, data: { status: 'READY' } });

    await job.updateProgress(100);
    return { episodeId, duration, bitrate };
  } catch (err) {
    await prisma.episode.update({ where: { id: episodeId }, data: { status: 'DRAFT' } }).catch(() => {});
    throw err;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

const worker = new Worker<AudioProcessingJob>(AUDIO_PROCESSING_QUEUE, processAudio, {
  connection: redisConnection(),
  concurrency: 2,
});

worker.on('completed', (job) => console.log(`[worker] job ${job.id} done`));
worker.on('failed', (job, err) => console.error(`[worker] job ${job?.id} failed:`, err.message));

console.log('Audio worker started, waiting for jobs...');

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
