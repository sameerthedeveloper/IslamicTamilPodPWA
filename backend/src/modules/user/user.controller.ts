import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { CurrentUser } from '@/common/decorators';

@ApiTags('User')
@Controller('api/v1/me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('history')
  getHistory(@CurrentUser() user: any, @Body('limit') limit = 20) {
    return this.userService.getHistory(user.id, limit);
  }

  @Get('bookmarks')
  getBookmarks(@CurrentUser() user: any) {
    return this.userService.getBookmarks(user.id);
  }

  @Post('bookmarks/:episodeId')
  addBookmark(
    @CurrentUser() user: any,
    @Param('episodeId', ParseIntPipe) episodeId: number,
  ) {
    return this.userService.addBookmark(user.id, episodeId);
  }

  @Delete('bookmarks/:episodeId')
  removeBookmark(
    @CurrentUser() user: any,
    @Param('episodeId', ParseIntPipe) episodeId: number,
  ) {
    return this.userService.removeBookmark(user.id, episodeId);
  }

  @Get('listening')
  getListeningProgress(@CurrentUser() user: any) {
    return this.userService.getListeningProgress(user.id);
  }

  @Patch('listening/:episodeId')
  updateListeningProgress(
    @CurrentUser() user: any,
    @Param('episodeId', ParseIntPipe) episodeId: number,
    @Body() body: { positionSeconds: number; durationSeconds: number },
  ) {
    return this.userService.updateListeningProgress(
      user.id,
      episodeId,
      body.positionSeconds,
      body.durationSeconds,
    );
  }
}
