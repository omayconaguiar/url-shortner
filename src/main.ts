import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {PrismaService} from './prisma/prisma.service';
import {SwaggerDocumentBuilder} from './swagger';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = new SwaggerDocumentBuilder(app);
  document.setupSwagger();

  app.get(PrismaService);

  await app.listen(process.env.PORT || 3000);
  console.log(`URL Shortener API running on port ${process.env.PORT || 3000}`);
}

bootstrap();
