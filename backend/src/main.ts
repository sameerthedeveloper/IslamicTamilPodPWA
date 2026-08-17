import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS — explicit origin whitelist, comma-separated in CORS_ORIGINS.
  // Dev falls back to "*" only when CORS_ORIGINS is unset.
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: corsOrigins ?? (process.env.NODE_ENV === 'development' ? '*' : []),
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Tamil Islamic Audio API')
    .setDescription('Backend API for Islamic audio content platform')
    .setVersion('1.0.0-alpha')
    .addBearerAuth()
    .addTag('Episodes')
    .addTag('Scholars')
    .addTag('Topics')
    .addTag('Series')
    .addTag('Auth')
    .addTag('User')
    .addTag('Search')
    .addTag('Home')
    .addTag('Admin')
    .addTag('Audio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Docs available at http://localhost:${port}/docs`);
}

bootstrap();
