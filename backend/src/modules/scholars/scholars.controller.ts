import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScholarsService } from './scholars.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Scholars')
@Controller('api/v1/scholars')
export class ScholarsController {
  constructor(private readonly scholarsService: ScholarsService) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() data: any) {
    return this.scholarsService.create(data);
  }

  @Get()
  findAll() {
    return this.scholarsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.scholarsService.findBySlug(slug);
  }
}
