/**
 * Login Page - Professional Tailwind CSS 4 Design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Shield, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Utensils
} from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  const { login, verify2FA, isAuthenticated } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.requires2FA) {
        setRequires2FA(true);
        setTempToken(result.tempToken);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login xatosi yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verify2FA(tempToken, otpCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || '2FA tasdiqlash xatosi');
    } finally {
      setLoading(false);
    }
  };

  // 2FA Verification Form
  if (requires2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative w-full max-w-md animate-fade-in">
          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Tasdiqlash kodi</h1>
              <p className="text-white/80 mt-2 text-sm">
                Telegram orqali yuborilgan 6 xonali kodni kiriting
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    OTP Kod
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      required
                      disabled={loading}
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl font-mono tracking-[0.5em] placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/50 text-center">
                    Kod 5 daqiqa ichida amal qiladi
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Tekshirilmoqda...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Tasdiqlash
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setRequires2FA(false);
                  setOtpCode('');
                  setError('');
                }}
                className="w-full mt-4 py-3 text-white/70 hover:text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Orqaga qaytish
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Gastro-Savdo-Insights</h1>
            <p className="text-white/80 mt-2">Admin paneliga kirish</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Foydalanuvchi nomi
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Parol
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Kirish...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Kirish
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-white/40 text-sm">
                2FA yoqilgan bo'lsa, Telegram orqali tasdiqlash kodi yuboriladi
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-white/30 text-sm mt-6">
          © 2026 Gastro-Savdo-Insights
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
