
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { AuthService } from '@/services/api';

import type { Admin, LoginRequest, LoginResponse, TokenResponse } from '@/types';

// Auth state interface
interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempToken: string | null;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  verify2FA: (otpCode: string) => Promise<TokenResponse>;
  logout: () => Promise<void>;
  clearTempToken: () => void;
}

// Initial state
const dummyAdmin: Admin = {
  adminId: 1,
  username: "demo",
  first_name: "Demo",
  last_name: "User",
  telegram_id: "0",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const initialState: AuthState = {
  admin: dummyAdmin,
  isAuthenticated: true,
  isLoading: false,
  requires2FA: false,
  tempToken: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider
 * Manages authentication state across the application
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check authentication status on mount
  useEffect(() => {
    // Authentication bypassed for demo purposes
  }, []);

  // Login handler
  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await AuthService.login(credentials);

    if (response.requires_2fa && response.temp_token) {
      // 2FA required
      setState((prev) => ({
        ...prev,
        requires2FA: true,
        tempToken: response.temp_token!,
      }));
    } else if (response.access_token && response.admin) {
      // Direct login success
      setState({
        admin: response.admin,
        isAuthenticated: true,
        isLoading: false,
        requires2FA: false,
        tempToken: null,
      });
    }

    return response;
  }, []);

  // 2FA verification handler
  const verify2FA = useCallback(async (otpCode: string): Promise<TokenResponse> => {
    if (!state.tempToken) {
      throw new Error('No temp token available');
    }

    const response = await AuthService.verify2FA({
      temp_token: state.tempToken,
      otp_code: otpCode,
    });

    setState({
      admin: response.admin,
      isAuthenticated: true,
      isLoading: false,
      requires2FA: false,
      tempToken: null,
    });

    return response;
  }, [state.tempToken]);

  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    await AuthService.logout();
    setState({
      ...initialState,
      isLoading: false,
    });
  }, []);

  // Clear temp token (cancel 2FA)
  const clearTempToken = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      requires2FA: false,
      tempToken: null,
    }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    verify2FA,
    logout,
    clearTempToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
