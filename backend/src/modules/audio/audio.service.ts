import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AudioService {
  constructor(private prisma: PrismaService) {}

  // TODO: Phase 4 - Implement audio storage + streaming
  // - Upload audio file to MinIO
  // - Queue FFmpeg processing job
  // - Generate signed download URL
  // - Stream audio with range requests
}
