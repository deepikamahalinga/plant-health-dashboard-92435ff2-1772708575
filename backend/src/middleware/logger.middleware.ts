// middleware/request-logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithId extends Request {
  id: string;
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    // Add request ID for tracing
    req.id = uuidv4();
    
    // Capture timestamp when request starts
    const startTime = Date.now();
    
    // Log request details
    this.logRequest(req);

    // Handle response logging after request is complete
    res.on('finish', () => {
      this.logResponse(req, res, startTime);
    });

    next();
  }

  private logRequest(req: RequestWithId): void {
    const message = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Incoming Request: ${JSON.stringify(message)}`);
    } else {
      this.logger.log(`Incoming Request: ${JSON.stringify(message)}`);
    }
  }

  private logResponse(req: RequestWithId, res: Response, startTime: number): void {
    const responseTime = Date.now() - startTime;
    
    const message = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      this.logger.error(`Server Error: ${JSON.stringify(message)}`);
    } else if (res.statusCode >= 400) {
      this.logger.warn(`Client Error: ${JSON.stringify(message)}`);
    } else {
      this.logger.log(`Request Completed: ${JSON.stringify(message)}`);
    }
  }
}

// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes('*');
  }
}

// logging.config.ts
export const loggingConfig = {
  development: {
    level: 'debug',
    prettyPrint: true,
  },
  production: {
    level: 'info',
    prettyPrint: false,
  },
  test: {
    level: 'warn',
    prettyPrint: false,
  },
};

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Configure global logging
  const logger = new Logger('Application');

  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  await app.listen(3000);
}
bootstrap();