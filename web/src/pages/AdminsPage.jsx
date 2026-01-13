/**
 * Admins Page - Professional Tailwind CSS 4 Design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { adminApi } from '../services/api';
import {
  Users,
  Plus,
  Trash2,
  X,
  User,
  Lock,
  Shield,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Search,
  CheckCircle,
  Utensils,
  Menu,
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

function AdminsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, admin: currentAdmin, logout, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    telegram_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAll();
      setAdmins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await adminApi.create(formData);
      setShowModal(false);
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        telegram_id: '',
      });
      setSuccess('Admin muvaffaqiyatli yaratildi!');
      setTimeout(() => setSuccess(''), 3000);
      loadAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (adminId) => {
    try {
      await adminApi.delete(adminId);
      setDeleteConfirm(null);
      setSuccess('Admin muvaffaqiyatli o\'chirildi!');
      setTimeout(() => setSuccess(''), 3000);
      loadAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredAdmins = admins.filter(admin => 
    admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Adminlar", path: "/admins", active: true },
    { icon: ShoppingCart, label: "Buyurtmalar", path: "/orders" },
    { icon: Package, label: "Mahsulotlar", path: "/products" },
    { icon: BarChart3, label: "Hisobotlar", path: "/reports" },
    { icon: Settings, label: "Sozlamalar", path: "/settings" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-800/50 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Gastro-Savdo</h1>
              <p className="text-xs text-white/50">Insights Panel</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="absolute top-6 right-4 lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {currentAdmin?.first_name?.[0] || currentAdmin?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {currentAdmin?.first_name} {currentAdmin?.last_name}
                </p>
                <p className="text-white/50 text-sm truncate">@{currentAdmin?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white/60 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">Adminlar boshqaruvi</h2>
                <p className="text-white/50 text-sm">{filteredAdmins.length} ta admin</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Yangi admin</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-300">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300">{success}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Adminlarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Admins Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Adminlar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAdmins.map((admin, index) => (
                <div
                  key={admin.adminId || admin.admin_id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {admin.first_name?.[0] || admin.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          {admin.first_name} {admin.last_name}
                          {(admin.adminId || admin.admin_id) === (currentAdmin?.adminId || currentAdmin?.admin_id) && (
                            <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                              Siz
                            </span>
                          )}
                        </h3>
                        <p className="text-white/50 text-sm">@{admin.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">ID</span>
                      <span className="text-white font-mono">#{admin.adminId || admin.admin_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">2FA holati</span>
                      {admin.telegram_id ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                          Yoqilgan
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-white/40">
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                          O'chirilgan
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Yaratilgan</span>
                      <span className="text-white/70">
                        {admin.created_at 
                          ? new Date(admin.created_at).toLocaleDateString('uz-UZ')
                          : '-'
                        }
                      </span>
                    </div>
                  </div>

                  {(admin.adminId || admin.admin_id) !== (currentAdmin?.adminId || currentAdmin?.admin_id) && (
                    <button
                      onClick={() => setDeleteConfirm(admin.adminId || admin.admin_id)}
                      className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      O'chirish
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Yangi admin qo'shish</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    minLength={3}
                    placeholder="admin_username"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Parol *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    placeholder="Kamida 6 belgi"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Ism
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Ism"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Familiya
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Familiya"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Telegram ID (2FA uchun)
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="telegram_id"
                    value={formData.telegram_id}
                    onChange={handleInputChange}
                    placeholder="123456789"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="mt-2 text-xs text-white/40">
                  2FA yoqish uchun Telegram chat ID kiriting
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Yaratish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Adminni o'chirish
            </h3>
            <p className="text-white/60 text-center mb-6">
              Haqiqatan ham bu adminni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminsPage;
