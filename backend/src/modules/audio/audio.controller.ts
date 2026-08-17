import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AudioService } from './audio.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Audio')
@Controller('api/v1/audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('admin/upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: any,
    @Body('episodeId', ParseIntPipe) episodeId: number,
  ) {
    return this.audioService.uploadForEpisode(episodeId, file);
  }

  @Get('admin/jobs/:jobId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  jobStatus(@Param('jobId') jobId: string) {
    return this.audioService.jobStatus(jobId);
  }
}
