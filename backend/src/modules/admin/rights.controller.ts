import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '@/common/prisma/prisma.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Admin')
@Controller('api/v1/admin/rights')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class RightsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.rights.findMany({
      include: { scholar: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Post()
  create(@Body() data: any) {
    return this.prisma.rights.create({
      data: {
        owner: data.owner,
        scholarId: data.scholarId,
        status: data.status ?? 'PENDING',
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
      },
      include: { scholar: true },
    });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.prisma.rights.update({
      where: { id },
      data: {
        ...(data.owner !== undefined && { owner: data.owner }),
        ...(data.scholarId !== undefined && { scholarId: data.scholarId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.licenseExpiry !== undefined && {
          licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        }),
      },
      include: { scholar: true },
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.rights.delete({ where: { id } });
  }
}
