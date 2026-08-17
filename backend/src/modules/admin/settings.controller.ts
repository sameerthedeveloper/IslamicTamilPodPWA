import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '@/common/prisma/prisma.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Admin')
@Controller('api/v1/admin/settings')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  private async getOrCreate() {
    const existing = await this.prisma.systemSettings.findFirst();
    if (existing) return existing;
    return this.prisma.systemSettings.create({ data: {} });
  }

  @Get()
  async get() {
    return this.getOrCreate();
  }

  @Patch()
  async update(@Body() data: any) {
    const settings = await this.getOrCreate();
    return this.prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        ...(data.siteName !== undefined && { siteName: data.siteName }),
        ...(data.siteDescription !== undefined && { siteDescription: data.siteDescription }),
        ...(data.defaultBitrate !== undefined && { defaultBitrate: data.defaultBitrate }),
        ...(data.maxUploadSize !== undefined && { maxUploadSize: data.maxUploadSize }),
      },
    });
  }
}
