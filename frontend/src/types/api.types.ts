/**
 * API Response Types
 */

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T; // Changed: data can be array or object, but usually T handles it
  count?: number; // Optional as not all endpoints return count
}

export type ApiSingleResponse<T> = ApiResponse<T>;

// Auth Types
// Auth Types are imported from auth.types.ts

// Error Handling
export interface ApiError {
  success: boolean;
  message: string;
  detail?: string | Record<string, any>;
}
