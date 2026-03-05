// plant.types.ts

import { z } from 'zod'; // For validation schemas

/**
 * Enum representing possible plant health statuses
 * @enum {string}
 */
export enum PlantHealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning', 
  CRITICAL = 'critical'
}

/**
 * Represents a sensor reading associated with a plant
 */
export interface SensorReading {
  id: string;
  plantId: string;
  timestamp: Date;
  value: number;
  sensorType: string;
}

/**
 * Main Plant entity interface
 * @interface Plant
 */
export interface Plant {
  /** Unique identifier */
  id: string;
  
  /** Current health status */
  healthStatus: PlantHealthStatus;
  
  /** Associated sensor readings */
  sensorReadings?: SensorReading[];
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * DTO for creating a new plant
 * @interface CreatePlantDto
 */
export interface CreatePlantDto {
  healthStatus: PlantHealthStatus;
}

/**
 * DTO for updating an existing plant
 * @type UpdatePlantDto
 */
export type UpdatePlantDto = Partial<CreatePlantDto>;

/**
 * Filter parameters for querying plants
 * @interface PlantFilterParams
 */
export interface PlantFilterParams {
  healthStatus?: PlantHealthStatus;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Pagination parameters
 * @interface PaginationParams
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Sort parameters
 * @interface SortParams
 */
export interface SortParams {
  field: keyof Plant;
  direction: 'asc' | 'desc';
}

/**
 * API response wrapper with metadata
 * @interface ApiResponse
 */
export interface ApiResponse<T> {
  data: T;
  metadata: {
    timestamp: Date;
    statusCode: number;
    page?: number;
    totalPages?: number;
    totalItems?: number;
  }
}

/**
 * Zod validation schema for Plant entity
 */
export const PlantSchema = z.object({
  id: z.string().uuid(),
  healthStatus: z.nativeEnum(PlantHealthStatus),
  createdAt: z.date(),
  updatedAt: z.date()
});

/**
 * Zod validation schema for CreatePlantDto
 */
export const CreatePlantDtoSchema = z.object({
  healthStatus: z.nativeEnum(PlantHealthStatus)
});

/**
 * Zod validation schema for UpdatePlantDto
 */
export const UpdatePlantDtoSchema = CreatePlantDtoSchema.partial();

/**
 * Utility type for paginated response
 */
export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}>;

/**
 * Type alias for Plant list response
 */
export type PlantListResponse = PaginatedResponse<Plant>;

/**
 * Type alias for single Plant response
 */
export type PlantResponse = ApiResponse<Plant>;