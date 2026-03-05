// plant.api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface Plant {
  id: string;
  healthStatus: HealthStatus;
}

export interface PlantCreateDTO {
  healthStatus: HealthStatus;
}

export interface PlantUpdateDTO {
  healthStatus: HealthStatus;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: keyof Plant;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  healthStatus?: HealthStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Error handling
export class PlantApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: any
  ) {
    super(message);
    this.name = 'PlantApiError';
  }
}

// API Client
export class PlantApiClient {
  private client: AxiosInstance;
  private static retryLimit = 3;
  private static retryDelay = 1000;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;
    
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        if (error.response?.status === 401) {
          // Handle token refresh here if needed
          const refreshToken = localStorage.getItem('refreshToken');
          // Implement refresh token logic
        }

        throw new PlantApiError(
          error.response?.status || 500,
          error.message,
          error.response?.data
        );
      }
    );
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < PlantApiClient.retryLimit; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        await new Promise(resolve => 
          setTimeout(resolve, PlantApiClient.retryDelay * Math.pow(2, attempt))
        );
      }
    }
    
    throw lastError;
  }

  async getAllPlants(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<Plant>> {
    return this.retryOperation(async () => {
      const { data } = await this.client.get('/plants', {
        params: { ...filters, ...pagination, ...sort },
      });
      return data;
    });
  }

  async getPlantById(id: string): Promise<Plant> {
    return this.retryOperation(async () => {
      const { data } = await this.client.get(`/plants/${id}`);
      return data;
    });
  }

  async createPlant(plantData: PlantCreateDTO): Promise<Plant> {
    return this.retryOperation(async () => {
      const { data } = await this.client.post('/plants', plantData);
      return data;
    });
  }

  async updatePlant(id: string, plantData: PlantUpdateDTO): Promise<Plant> {
    return this.retryOperation(async () => {
      const { data } = await this.client.put(`/plants/${id}`, plantData);
      return data;
    });
  }

  async deletePlant(id: string): Promise<void> {
    return this.retryOperation(async () => {
      await this.client.delete(`/plants/${id}`);
    });
  }
}

// Export singleton instance
export const plantApi = new PlantApiClient();

// Hook for handling loading states (if using React)
export const useApiLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PlantApiError | null>(null);

  const withLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const error = err as PlantApiError;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, withLoading };
};