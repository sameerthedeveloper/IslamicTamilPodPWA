import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
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

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() {
    return this.scholarsService.findAllAdmin();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.scholarsService.findBySlug(slug);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.scholarsService.update(id, data);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scholarsService.remove(id);
  }
}
