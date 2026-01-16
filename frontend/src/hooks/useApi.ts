import { useState, useEffect, useCallback } from 'react';
import { AxiosError, AxiosRequestConfig } from 'axios';
import apiClient from '../services/api/apiClient';
import { ApiError } from '../types/api.types';

interface UseApiOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  url: string, 
  config?: AxiosRequestConfig, 
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<T>(url, config);
      // Backend returns structure like { success: true, data: ... } usually
      // But let's handle if it returns just data or wrapper.
      // Based on ApiTypes, it returns ApiResponse<T> where data is T or T[]
      // We will assume the caller expects the 'data' field content, 
      // OR we just return the whole body if it's not wrapped?
      // OpenAPI spec says: ApiResponse { success, message, data, count }
      // So we should probably extract 'data' here for convenience.
      
      // Let's check response structure at runtime slightly or just return response.data.data
      
      const responseData = response.data as any;
      const actualData = responseData.success !== undefined ? responseData.data : responseData;

      setData(actualData);
      onSuccess?.(actualData);
    } catch (err: any) {
      const axiosError = err as AxiosError<ApiError>;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        'An error occurred';
      
      setError(errorMessage);
      onError?.(axiosError.response?.data || { success: false, message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(config), enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useRequest<T>(
  apiCall: () => Promise<any>,
  deps: any[] = [],
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      // Handle potential response wrapper if apiCall returns AxiosResponse
      const responseData = (response as any).data !== undefined ? (response as any).data : response;
      const actualData = responseData.success !== undefined ? responseData.data : responseData;

      setData(actualData);
      onSuccess?.(actualData);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [...deps, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
