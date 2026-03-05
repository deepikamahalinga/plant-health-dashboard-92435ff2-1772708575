import { PrismaClient, Plant, HealthStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './logger'; // Assume we have a logger utility

const prisma = new PrismaClient();
const logger = new Logger('database-seed');

// Types
type SeedOptions = {
  clearExisting?: boolean;
};

// Sample data
const SAMPLE_PLANTS: Omit<Plant, 'id'>[] = [
  { healthStatus: 'healthy' },
  { healthStatus: 'warning' },
  { healthStatus: 'critical' },
  { healthStatus: 'healthy' },
  { healthStatus: 'warning' },
];

// Main seed function
export async function seedDatabase(options: SeedOptions = {}): Promise<void> {
  try {
    logger.info('Starting database seed...');

    // Clear existing data if requested
    if (options.clearExisting) {
      logger.info('Clearing existing data...');
      await clearExistingData();
    }

    // Seed plants
    logger.info('Seeding plants...');
    const plants = await seedPlants();
    logger.info(`Created ${plants.length} plants`);

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
async function clearExistingData(): Promise<void> {
  try {
    await prisma.sensorReading.deleteMany();
    await prisma.plant.deleteMany();
    logger.info('Existing data cleared');
  } catch (error) {
    logger.error('Error clearing existing data:', error);
    throw error;
  }
}

async function seedPlants(): Promise<Plant[]> {
  const plants: Plant[] = [];

  try {
    for (const plantData of SAMPLE_PLANTS) {
      const plant = await prisma.plant.create({
        data: {
          id: uuidv4(),
          ...plantData,
        },
      });
      plants.push(plant);
    }
    return plants;
  } catch (error) {
    logger.error('Error seeding plants:', error);
    throw error;
  }
}

// Execute seed if running directly
if (require.main === module) {
  seedDatabase({ clearExisting: true })
    .then(() => {
      logger.info('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed:', error);
      process.exit(1);
    });
}