import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TokenResponse } from '@/types';

import { TokenStorage } from '@/services/auth/tokenStorage';

const BASE_URL = 'https://api.gastro-analytics.uz/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = TokenStorage.getRefreshToken();
        // If no refresh token, fail immediately
        if (!refreshToken) {
           throw new Error('No refresh token available');
        }

        // Spec: POST /auth/refresh
        const response = await axios.post<TokenResponse>(
          `${BASE_URL}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
          } 
        );
        
        const { access_token, refresh_token } = response.data;
        // Update tokens - refresh_token might be optional if simple access token renewal
        TokenStorage.setTokens(access_token, refresh_token);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        TokenStorage.clearTokens();
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
