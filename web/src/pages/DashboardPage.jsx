/**
 * Dashboard Page - Professional Tailwind CSS 4 Design
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  LogOut,
  Shield,
  ChevronRight,
  Utensils,
  Activity,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
} from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const { admin, logout, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      title: "Bugungi sotuvlar", 
      value: "12,450,000", 
      unit: "UZS",
      change: "+12.5%",
      positive: true,
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      title: "Buyurtmalar", 
      value: "156", 
      unit: "ta",
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Mijozlar", 
      value: "2,847", 
      unit: "ta",
      change: "+5.1%",
      positive: true,
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Mahsulotlar", 
      value: "432", 
      unit: "ta",
      change: "-2.3%",
      positive: false,
      icon: Package,
      color: "from-orange-500 to-orange-600"
    },
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: true },
    { icon: Users, label: "Adminlar", path: "/admins" },
    { icon: ShoppingCart, label: "Buyurtmalar", path: "/orders" },
    { icon: Package, label: "Mahsulotlar", path: "/products" },
    { icon: BarChart3, label: "Hisobotlar", path: "/reports" },
    { icon: Settings, label: "Sozlamalar", path: "/settings" },
  ];

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
        {/* Logo */}
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

        {/* Navigation */}
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
              {item.active && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {admin?.first_name?.[0] || admin?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {admin?.first_name} {admin?.last_name}
                </p>
                <p className="text-white/50 text-sm truncate">@{admin?.username}</p>
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
                <h2 className="text-xl font-bold text-white">Dashboard</h2>
                <p className="text-white/50 text-sm">Xush kelibsiz, {admin?.first_name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
                <Calendar className="w-4 h-4 text-white/50" />
                <span className="text-white/70 text-sm">
                  {new Date().toLocaleDateString('uz-UZ', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.title}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                    stat.positive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-white/60 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white">
                  {stat.value} <span className="text-lg text-white/50">{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Quick Actions & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Tezkor harakatlar</h3>
                <Activity className="w-5 h-5 text-white/40" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/admins')}
                  className="p-4 bg-gradient-to-br from-primary-500/20 to-primary-600/20 hover:from-primary-500/30 hover:to-primary-600/30 border border-primary-500/30 rounded-xl transition-all duration-200 group"
                >
                  <Users className="w-8 h-8 text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white text-sm font-medium text-center">Adminlar</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 rounded-xl transition-all duration-200 group">
                  <ShoppingCart className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white text-sm font-medium text-center">Buyurtmalar</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 rounded-xl transition-all duration-200 group">
                  <Package className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white text-sm font-medium text-center">Mahsulotlar</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30 rounded-xl transition-all duration-200 group">
                  <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white text-sm font-medium text-center">Hisobotlar</p>
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Tizim ma'lumotlari</h3>
                <Shield className="w-5 h-5 text-white/40" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/60 text-sm">Admin ID</span>
                  <span className="text-white font-mono">#{admin?.adminId}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/60 text-sm">Username</span>
                  <span className="text-white">@{admin?.username}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-white/60 text-sm">2FA holati</span>
                  {admin?.telegram_id ? (
                    <span className="flex items-center gap-2 text-emerald-400">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      Yoqilgan
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      O'chirilgan
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">So'nggi faoliyat</h3>
              <button className="text-primary-400 text-sm hover:text-primary-300 transition-colors">
                Barchasini ko'rish
              </button>
            </div>
            <div className="text-center py-12 text-white/40">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Hozircha faoliyat mavjud emas</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-8 py-6 border-t border-white/10">
          <p className="text-center text-white/30 text-sm">
            © 2026 Gastro-Savdo-Insights. Barcha huquqlar himoyalangan.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default DashboardPage;
