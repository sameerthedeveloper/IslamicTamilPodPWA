export const AUDIO_PROCESSING_QUEUE = 'audio-processing';

export function redisConnection() {
  const url = new URL(process.env.REDIS_URL || 'redis://redis:6379');
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    ...(url.password && { password: url.password }),
  };
}

export interface AudioProcessingJob {
  episodeId: number;
  rawStorageKey: string;
  originalFilename: string;
}
