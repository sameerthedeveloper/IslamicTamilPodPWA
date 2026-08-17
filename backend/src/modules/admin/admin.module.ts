import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { RightsController } from './rights.controller';
import { FeaturedController } from './featured.controller';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [AdminController, RightsController, FeaturedController, SettingsController],
})
export class AdminModule {}
