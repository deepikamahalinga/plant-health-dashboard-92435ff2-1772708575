import { z } from 'zod';

export const UpdatePlantDto = z.object({
  healthStatus: z
    .enum(['healthy', 'warning', 'critical'])
    .optional()
    .describe('Current health status of the plant'),
});

export type UpdatePlantDto = z.infer<typeof UpdatePlantDto>;