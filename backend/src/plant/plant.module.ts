// plant.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantController } from './plant.controller';
import { PlantService } from './plant.service';
import { Plant } from './entities/plant.entity';
import { SensorReadingModule } from '../sensor-reading/sensor-reading.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plant]),
    SensorReadingModule, // Import related module for sensor readings
  ],
  controllers: [PlantController],
  providers: [PlantService],
  exports: [PlantService], // Export service for use in other modules
})
export class PlantModule {}