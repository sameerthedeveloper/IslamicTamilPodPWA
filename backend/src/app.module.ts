import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { CacheModule } from './common/cache/cache.module';
import { QueueModule } from './common/queue/queue.module';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { ScholarsModule } from './modules/scholars/scholars.module';
import { TopicsModule } from './modules/topics/topics.module';
import { SeriesModule } from './modules/series/series.module';
import { AudioModule } from './modules/audio/audio.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SearchModule } from './modules/search/search.module';
import { HomeModule } from './modules/home/home.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    PrismaModule,
    StorageModule,
    CacheModule,
    QueueModule,
    HealthModule,
    EpisodesModule,
    ScholarsModule,
    TopicsModule,
    SeriesModule,
    AudioModule,
    AuthModule,
    UserModule,
    SearchModule,
    HomeModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
