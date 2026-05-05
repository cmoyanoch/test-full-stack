import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getHttpCorsOptions } from './config/cors-config';
import { appLog } from './presentation/logging/structured-log';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors(getHttpCorsOptions());
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  appLog('log', 'Bootstrap', 'Backend listening', {
    port: Number(port),
    url: `http://localhost:${port}`,
  });
}

bootstrap();
