import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WsModule } from './websocket/ws.module';
import { AuthModule } from './auth/auth.module';
import { PlantModule } from './plant/plant.module';
import { Plant } from './plant/entities/plant.entity';
import { HealthModule } from './health/health.module';
import { SensorModule } from './sensor/sensor.module';
import { QueueModule } from './queue/queue.module';
import { validationSchema } from './config/validation.schema';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      cache: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...databaseConfig(configService),
        entities: [Plant],
      }),
      inject: [ConfigService],
    }),

    // Redis and Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...redisConfig(configService),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('THROTTLE_TTL'),
        limit: configService.get('THROTTLE_LIMIT'),
      }),
      inject: [ConfigService],
    }),

    // Event Handling
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Feature Modules
    AuthModule,
    PlantModule,
    WsModule,
    HealthModule,
    SensorModule,
    QueueModule,
    TerminusModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}