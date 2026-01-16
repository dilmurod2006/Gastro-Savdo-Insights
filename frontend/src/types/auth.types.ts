// Admin model
export interface Admin {
  adminId: number;
  username: string;
  first_name: string;
  last_name: string;
  telegram_id: string;
  created_at: string;
  updated_at: string;
}

// Login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Login response - can be 2FA required or direct login
export interface LoginResponse {
  requires_2fa?: boolean;
  temp_token?: string;
  access_token?: string;
  refresh_token?: string;
  admin?: Admin;
  message?: string;
}

// 2FA Verify request
export interface TwoFactorVerifyRequest {
  temp_token: string;
  otp_code: string;
}

// Token response (for 2FA verify and refresh)
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  admin: Admin;
}

// Validation error
export interface ValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

// Session check response
export interface SessionCheckResponse {
  valid: boolean;
  admin?: Admin;
}

// Create admin request
export interface CreateAdminRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  telegram_id?: string;
}
