// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.gastro-analytics.uz',
  API_VERSION: '/api/v1',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      VERIFY_2FA: '/auth/2fa-verify',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      LOGOUT: '/auth/logout',
      CHECK_SESSION: '/auth/check-session',
      ADMINS: '/auth/admins',
    },
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};
