import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { ScholarsModule } from './modules/scholars/scholars.module';
import { TopicsModule } from './modules/topics/topics.module';
import { SeriesModule } from './modules/series/series.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SearchModule } from './modules/search/search.module';
import { HomeModule } from './modules/home/home.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    EpisodesModule,
    ScholarsModule,
    TopicsModule,
    SeriesModule,
    AuthModule,
    UserModule,
    SearchModule,
    HomeModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
