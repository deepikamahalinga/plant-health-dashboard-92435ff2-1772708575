import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { ZodValidationPipe } from 'nestjs-zod';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { PrismaService } from './shared/services/prisma.service';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { RateLimiterGuard } from './shared/guards/rate-limiter.guard';
import { WebsocketAdapter } from './shared/adapters/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  const port = configService.get('PORT') || 3000;

  // Enable shutdown hooks
  prismaService.enableShutdownHooks(app);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // WebSocket adapter
  app.useWebSocketAdapter(new WebsocketAdapter(app));

  // Security
  app.use(helmet());
  app.use(compression());
  
  // Request logging
  app.use(morgan('combined'));

  // Validation & transformation
  app.useGlobalPipes(
    new ZodValidationPipe(),
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global guards
  app.useGlobalGuards(new RateLimiterGuard());

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Request limits
  app.use(compression());
  app.use(helmet());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Plant Monitoring API')
    .setDescription('API documentation for plant monitoring system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start server
  await app.listen(port);
  Logger.log(`Application running on port ${port}`, 'Bootstrap');

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      Logger.log(`Received ${signal}, starting graceful shutdown`, 'Bootstrap');
      await app.close();
      process.exit(0);
    });
  });
}

bootstrap().catch(err => {
  Logger.error('Failed to start application', err, 'Bootstrap');
  process.exit(1);
});