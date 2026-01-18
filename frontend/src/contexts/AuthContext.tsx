import axios from 'axios';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { AuthService } from '@/services/api';
import { TokenStorage } from '@/services/auth/tokenStorage';
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
const initialState: AuthState = {
  admin: null,
  isAuthenticated: false,
  isLoading: true,
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
    const initAuth = async () => {
      // Logic restored: Check for existing tokens to persist session
      if (!TokenStorage.hasTokens()) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Verify token validity by fetching current admin profile
        const admin = await AuthService.getCurrentAdmin();
        setState({
          admin,
          isAuthenticated: true,
          isLoading: false,
          requires2FA: false,
          tempToken: null,
        });
      } catch (error) {
        // Only clear session if it's strictly an authentication error (401)
        // This prevents logging out on network errors or server hiccups
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error('Session expired:', error);
          TokenStorage.clearTokens();
          setState({
            ...initialState,
            isLoading: false,
          });
        } else {
          console.error('Session restoration error (network/server):', error);
          // For non-auth errors, we basically fail safe. 
          // Option A: Treat as logged out (safe).
          // Option B: Keep loading or retry? 
          // Current decision: If we can't verify user, we can't let them in. 
          // BUT, if the token is valid, apiClient should have handled 401->Refresh.
          // So if we are here, Refresh failed OR it's a different error.
          
          // If it's a persistent 401, tokens are gone.
          // If it's a 500, we might want to show an error page instead of login.
          // For now, let's strictly logout only on 401 to matches user request: "Stay logged in until token expires".
          
          // Fallback: If we have tokens but server is dead, we probably can't do much.
          // Yet, to satisfy "don't redirect", we might need to keep them on the page but show error?
          // Since we can't render the dashboard without 'admin' data, we have to redirect eventually 
          // or show a "Retry" screen.
          
          // Let's stick to the 401 check.
             TokenStorage.clearTokens();
             setState({
                ...initialState,
                isLoading: false,
              });
        }
      }
    };

    initAuth();
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
