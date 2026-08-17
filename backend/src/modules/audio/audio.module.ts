import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';

// TODO: Phase 4 - Media pipeline
// - MinIO client integration
// - BullMQ job queue setup
// - FFmpeg audio processing
// - Signed URL generation

@Module({
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
