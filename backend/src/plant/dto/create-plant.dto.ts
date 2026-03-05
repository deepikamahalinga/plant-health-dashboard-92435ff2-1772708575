import { z } from 'zod';

/**
 * Enum representing possible plant health status values
 */
export enum PlantHealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning', 
  CRITICAL = 'critical'
}

/**
 * Zod schema for creating a new plant
 */
export const CreatePlantDtoSchema = z.object({
  /**
   * Current health status of the plant
   * @example "healthy"
   */
  healthStatus: z.nativeEnum(PlantHealthStatus, {
    required_error: "Health status is required",
    invalid_type_error: "Health status must be one of: healthy, warning, critical"
  })
});

/**
 * DTO Type for creating a new plant
 */
export type CreatePlantDto = z.infer<typeof CreatePlantDtoSchema>;