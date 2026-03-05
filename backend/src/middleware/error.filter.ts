// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '@nestjs/common';

// Custom error response interface
interface IErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
  correlationId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Prepare default error response
    const errorResponse: IErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      path: request.url,
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id'],
    };

    // Handle different types of errors
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse.statusCode = status;
      errorResponse.error = HttpStatus[status];
      
      if (typeof exceptionResponse === 'object') {
        errorResponse.message = (exceptionResponse as any).message || exception.message;
      } else {
        errorResponse.message = exception.message;
      }
    } else if (exception instanceof Error) {
      errorResponse.message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error'
        : exception.message;
      
      // Log detailed error in development
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error({
          error: exception.message,
          stack: exception.stack,
          path: request.url,
          method: request.method,
          correlationId: errorResponse.correlationId,
        });
      }
    }

    // Log error (you can customize logging based on severity)
    this.logger.error({
      statusCode: errorResponse.statusCode,
      path: errorResponse.path,
      message: errorResponse.message,
      correlationId: errorResponse.correlationId,
      timestamp: errorResponse.timestamp,
    });

    httpAdapter.reply(response, errorResponse, errorResponse.statusCode);
  }
}

// src/common/exceptions/custom-exceptions.ts
export class ValidationException extends HttpException {
  constructor(message: string | string[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Validation Error',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(resource: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource} not found`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

// src/main.ts - Setup
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get HTTP adapter host
  const httpAdapterHost = app.get(HttpAdapterHost);
  
  // Apply global error filter
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(3000);
}
bootstrap();

// Usage example in a controller
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    // Example of throwing custom exception
    if (!id) {
      throw new ValidationException('User ID is required');
    }
    
    // Example of throwing not found exception
    throw new NotFoundException('User');
  }
}