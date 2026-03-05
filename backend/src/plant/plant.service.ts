import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Plant, HealthStatus } from '@prisma/client';

// Custom types for better type safety
export type CreatePlantDto = {
  id?: string; // Optional since UUID might be auto-generated
  healthStatus: HealthStatus;
};

export type UpdatePlantDto = Partial<CreatePlantDto>;

export type PlantFilters = {
  healthStatus?: HealthStatus;
  fromDate?: Date;
  toDate?: Date;
};

export type PaginationParams = {
  skip?: number;
  take?: number;
};

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: PlantFilters, pagination?: PaginationParams): Promise<Plant[]> {
    const where: Prisma.PlantWhereInput = {};
    
    // Apply filters if provided
    if (filters?.healthStatus) {
      where.healthStatus = filters.healthStatus;
    }

    return this.prisma.plant.findMany({
      where,
      include: {
        sensorReadings: true, // Include related sensor readings
      },
      skip: pagination?.skip || 0,
      take: pagination?.take || 50,
    });
  }

  async findById(id: string): Promise<Plant> {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: {
        sensorReadings: true,
      },
    });

    if (!plant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }

    return plant;
  }

  async create(data: CreatePlantDto): Promise<Plant> {
    return this.prisma.plant.create({
      data,
      include: {
        sensorReadings: true,
      },
    });
  }

  async update(id: string, data: UpdatePlantDto): Promise<Plant> {
    try {
      return await this.prisma.plant.update({
        where: { id },
        data,
        include: {
          sensorReadings: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record not found error
          throw new NotFoundException(`Plant with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<Plant> {
    try {
      return await this.prisma.plant.delete({
        where: { id },
        include: {
          sensorReadings: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Plant with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  // Helper method to check if plant exists
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.plant.count({
      where: { id },
    });
    return count > 0;
  }
}