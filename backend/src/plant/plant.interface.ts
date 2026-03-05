/**
 * Enum representing possible plant health status values
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
  // Other sensor fields would go here
}

/**
 * Represents a monitored plant or crop in the system
 * @interface Plant
 */
export interface Plant {
  /**
   * Unique identifier for the plant
   * @format uuid
   */
  id: string;

  /**
   * Current health status of the plant
   */
  healthStatus: PlantHealthStatus;

  /**
   * Associated sensor readings for this plant
   */
  sensorReadings?: SensorReading[];
}

/**
 * Represents the data required to create a new plant
 */
export type CreatePlantDto = Omit<Plant, 'id' | 'sensorReadings'>;

/**
 * Represents the data that can be updated for an existing plant
 */
export type UpdatePlantDto = Partial<CreatePlantDto>;

/**
 * Represents the response structure when querying plants
 */
export interface PlantResponse extends Plant {
  sensorReadings: SensorReading[];
}

/**
 * Represents query parameters for filtering plants
 */
export interface PlantQueryParams {
  healthStatus?: PlantHealthStatus;
  startDate?: Date;
  endDate?: Date;
}