import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

@ApiTags('Topics')
@Controller('api/v1/topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() data: any) {
    return this.topicsService.create(data);
  }

  @Get()
  findAll() {
    return this.topicsService.findAll();
  }
}
