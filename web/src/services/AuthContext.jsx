/**
 * Auth Context
 * Autentifikatsiya holatini boshqarish
 * HTTP-only cookie bilan ishlaydi
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Ilova yuklanganda sessiyani tekshirish
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // HTTP-only cookie orqali sessiyani tekshirish
        const session = await authApi.checkSession();
        
        if (session.authenticated && session.admin) {
          setAdmin(session.admin);
          setIsAuthenticated(true);
        } else {
          // Sessiya yo'q yoki yaroqsiz
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Xatolik - sessiya yo'q deb hisoblash
        console.error('Sessiya tekshirishda xatolik:', error);
        setAdmin(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login qilish
   */
  const login = async (username, password) => {
    const result = await authApi.login(username, password);
    
    if (result.requires_2fa) {
      // 2FA talab qilinadi
      return { requires2FA: true, tempToken: result.temp_token };
    }
    
    // 2FA o'chirilgan - sessiya cookie'da saqlandi
    setAdmin(result.admin);
    setIsAuthenticated(true);
    
    return { requires2FA: false };
  };

  /**
   * 2FA tasdiqlash
   */
  const verify2FA = async (tempToken, otpCode) => {
    const result = await authApi.verify2FA(tempToken, otpCode);
    
    // Sessiya cookie'da saqlandi
    setAdmin(result.admin);
    setIsAuthenticated(true);
    
    return result;
  };

  /**
   * Logout qilish
   */
  const logout = async () => {
    try {
      // Backend cookie'larni tozalaydi
      await authApi.logout();
    } catch (error) {
      console.error('Logout xatolik:', error);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    verify2FA,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  }
  return context;
}

export default AuthContext;
