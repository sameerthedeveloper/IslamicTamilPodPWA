import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'development' ? '*' : [],
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Docs available at http://localhost:${port}/docs`);
}

bootstrap();
