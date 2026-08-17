import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeriesService } from './series.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Series')
@Controller('api/v1/series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() data: any) {
    return this.seriesService.create(data);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.seriesService.findAll(page, limit);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.seriesService.findAllAdmin(page, limit);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.seriesService.findBySlug(slug);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.seriesService.update(id, data);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seriesService.remove(id);
  }
}
