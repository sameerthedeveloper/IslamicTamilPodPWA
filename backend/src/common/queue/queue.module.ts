import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import { AUDIO_PROCESSING_QUEUE, redisConnection } from './queue.constants';

export const AUDIO_QUEUE = 'AUDIO_QUEUE';

@Global()
@Module({
  providers: [
    {
      provide: AUDIO_QUEUE,
      useFactory: () => new Queue(AUDIO_PROCESSING_QUEUE, { connection: redisConnection() }),
    },
  ],
  exports: [AUDIO_QUEUE],
})
export class QueueModule {}
