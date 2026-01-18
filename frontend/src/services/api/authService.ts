import apiClient from './apiClient';
import { TokenStorage } from '../auth/tokenStorage';
import { API_CONFIG } from '@/config';
import type {
  LoginRequest,
  LoginResponse,
  TwoFactorVerifyRequest,
  TokenResponse,
  Admin,
  CreateAdminRequest,
} from '@/types';

const { ENDPOINTS } = API_CONFIG;

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const AuthService = {
  /**
   * Login with username and password
   * May return requires_2fa if 2FA is enabled
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // If direct login (no 2FA), store tokens
    if (response.data.access_token && response.data.refresh_token) {
      TokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    }
    
    return response.data;
  },

  /**
   * Verify 2FA OTP code
   */
  verify2FA: async (data: TwoFactorVerifyRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>(
      ENDPOINTS.AUTH.VERIFY_2FA,
      data
    );
    
    TokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>(ENDPOINTS.AUTH.REFRESH);
    TokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },

  /**
   * Get current authenticated admin
   */
  getCurrentAdmin: async (): Promise<Admin> => {
    const response = await apiClient.get<Admin>(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Logout current admin
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      TokenStorage.clearTokens();
    }
  },

  /**
   * Check if current session is valid
   */
  checkSession: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get(ENDPOINTS.AUTH.CHECK_SESSION);
      return response.data?.valid ?? false;
    } catch {
      return false;
    }
  },

  /**
   * Get all admins (admin only)
   */
  getAllAdmins: async (): Promise<Admin[]> => {
    const response = await apiClient.get<Admin[]>(ENDPOINTS.AUTH.ADMINS);
    return response.data;
  },

  /**
   * Create new admin (admin only)
   */
  createAdmin: async (adminData: CreateAdminRequest): Promise<Admin> => {
    const response = await apiClient.post<Admin>(ENDPOINTS.AUTH.ADMINS, adminData);
    return response.data;
  },

  /**
   * Delete admin by ID (admin only)
   */
  deleteAdmin: async (adminId: number): Promise<void> => {
    await apiClient.delete(`${ENDPOINTS.AUTH.ADMINS}/${adminId}`);
  },
};
