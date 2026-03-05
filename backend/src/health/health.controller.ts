// src/health/types/health.types.ts
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentUsed: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
}

// src/health/dto/health-response.dto.ts
export class HealthResponseDto implements HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentUsed: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
}

// src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthCheckResult } from './types/health.types';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const [dbStatus, memoryStatus, uptimeStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkUptime(),
    ]);

    const isHealthy =
      dbStatus.database.status === 'connected' &&
      memoryStatus.memory.percentUsed < 90; // 90% threshold

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: uptimeStatus.uptime,
      memory: memoryStatus.memory,
      database: dbStatus.database,
    };
  }

  private async checkDatabase(): Promise<Pick<HealthCheckResult, 'database'>> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      return {
        database: {
          status: 'connected',
          latency: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        database: {
          status: 'disconnected',
          latency: -1,
        },
      };
    }
  }

  private async checkMemory(): Promise<Pick<HealthCheckResult, 'memory'>> {
    const used = process.memoryUsage().heapUsed;
    const total = process.memoryUsage().heapTotal;
    
    return {
      memory: {
        used: Math.round(used / 1024 / 1024), // MB
        total: Math.round(total / 1024 / 1024), // MB
        percentUsed: Math.round((used / total) * 100),
      },
    };
  }

  private async checkUptime(): Promise<Pick<HealthCheckResult, 'uptime'>> {
    return {
      uptime: process.uptime(),
    };
  }
}

// src/health/health.controller.ts
import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('Health Check')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'System is healthy', type: HealthResponseDto })
  @ApiResponse({ status: 503, description: 'System is unhealthy', type: HealthResponseDto })
  async checkHealth(): Promise<HealthResponseDto> {
    const health = await this.healthService.checkHealth();
    
    if (health.status === 'unhealthy') {
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }
    
    return health;
  }
}

// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}