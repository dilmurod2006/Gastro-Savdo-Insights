/**
 * API Service
 * Backend bilan aloqa qilish uchun servis
 * HTTP-only cookie bilan ishlaydi
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * API so'rov yuborish uchun helper funksiya
 * HTTP-only cookie'lar avtomatik yuboriladi
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // HTTP-only cookie'larni yuborish
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API xatosi');
  }

  return response.json();
}

/**
 * Auth API metodlari
 */
export const authApi = {
  /**
   * Login qilish
   * @param {string} username - Foydalanuvchi nomi
   * @param {string} password - Parol
   * @returns {Promise<Object>} - Login natijasi
   */
  login: async (username, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * 2FA tasdiqlash
   * @param {string} tempToken - Vaqtinchalik token
   * @param {string} otpCode - OTP kod
   * @returns {Promise<Object>} - Tokenlar
   */
  verify2FA: async (tempToken, otpCode) => {
    return apiRequest('/auth/2fa-verify', {
      method: 'POST',
      body: JSON.stringify({ temp_token: tempToken, otp_code: otpCode }),
    });
  },

  /**
   * Token yangilash (cookie'dan)
   * @returns {Promise<Object>} - Yangi access token
   */
  refreshToken: async () => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },

  /**
   * Sessiyani tekshirish
   * @returns {Promise<Object>} - Sessiya holati
   */
  checkSession: async () => {
    return apiRequest('/auth/check-session', {
      method: 'GET',
    });
  },

  /**
   * Joriy admin ma'lumotlarini olish
   * @returns {Promise<Object>} - Admin ma'lumotlari
   */
  getCurrentAdmin: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Logout
   * @returns {Promise<Object>}
   */
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

/**
 * Admin CRUD API metodlari
 */
export const adminApi = {
  /**
   * Barcha adminlarni olish
   * @returns {Promise<Array>} - Adminlar ro'yxati
   */
  getAll: async () => {
    return apiRequest('/auth/admins', {
      method: 'GET',
    });
  },

  /**
   * Yangi admin yaratish
   * @param {Object} adminData - Admin ma'lumotlari
   * @returns {Promise<Object>} - Yaratilgan admin
   */
  create: async (adminData) => {
    return apiRequest('/auth/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },

  /**
   * Admin o'chirish
   * @param {number} adminId - Admin ID
   * @returns {Promise<Object>}
   */
  delete: async (adminId) => {
    return apiRequest(`/auth/admins/${adminId}`, {
      method: 'DELETE',
    });
  },
};

export default apiRequest;
