import { useState, useCallback, useEffect } from 'react';

interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (url: string, options?: RequestInit) => Promise<void>;
}

export function useApi<T>(): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    const abortController = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err);
      } else {
        setError(new Error('An unknown error occurred'));
      }
    } finally {
      setLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup function
      setData(null);
      setError(null);
      setLoading(false);
    };
  }, []);

  return {
    data,
    loading,
    error,
    fetchData
  };
}