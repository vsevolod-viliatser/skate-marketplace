import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Get services
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Set custom logger
  app.useLogger(logger);

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS with configuration
  const corsOrigins = configService.get<string[]>('server.corsOrigins');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Serve static files for uploads
  const uploadPath =
    configService.get<string>('fileUpload.uploadPath') || 'uploads';
  app.useStaticAssets(join(__dirname, '..', uploadPath), {
    prefix: '/uploads/',
  });

  const port = configService.get<number>('server.port') || 3001;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
