import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { CurrentUser } from '@/common/decorators';

@ApiTags('Home')
@Controller('api/v1/home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @Get()
  getHome(@Query() query?: any) {
    const userId = query?.userId;
    return this.homeService.getHomeData(userId);
  }
}
