import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AudioService } from './audio.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

// TODO: Phase 4 - Audio endpoints
// - GET /api/v1/audio/:episodeId/stream (signed URL)
// - POST /api/v1/admin/audio/upload (file upload + BullMQ job)
// - DELETE /api/v1/admin/audio/:id (remove from storage)

@ApiTags('Audio')
@Controller('api/v1/audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}
}
