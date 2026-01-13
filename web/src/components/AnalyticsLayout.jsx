/**
 * Professional Dashboard Layout
 * Collapsible Sidebar, Header va Main Content
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  UserCircle,
  FolderTree,
  Truck,
  TrendingUp,
  Building2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/analytics',
  },
  {
    title: 'Mahsulotlar',
    icon: Package,
    path: '/analytics/products',
    badge: 4,
  },
  {
    title: 'Xodimlar',
    icon: UserCircle,
    path: '/analytics/employees',
    badge: 2,
  },
  {
    title: 'Mijozlar',
    icon: Users,
    path: '/analytics/customers',
    badge: 3,
  },
  {
    title: 'Kategoriyalar',
    icon: FolderTree,
    path: '/analytics/categories',
    badge: 3,
  },
  {
    title: 'Yetkazib beruvchilar',
    icon: Building2,
    path: '/analytics/suppliers',
    badge: 2,
  },
  {
    title: 'Yetkazib berish',
    icon: Truck,
    path: '/analytics/shipping',
    badge: 1,
  },
  {
    title: 'Sotuvlar',
    icon: TrendingUp,
    path: '/analytics/sales',
    badge: 4,
  },
];

// Sidebar Component
function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-slate-900 to-slate-800
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0 shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          w-72
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-700 ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Gastro Savdo</h1>
              <p className="text-slate-400 text-xs">Analytics Dashboard</p>
            </div>
          </div>
          
          {/* Collapsed Logo */}
          <div className={`hidden ${isCollapsed ? 'lg:flex' : 'lg:hidden'} items-center justify-center`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          <p className={`text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
            Analytics
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={isCollapsed ? item.title : ''}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group relative
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between'}
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:gap-0' : ''}`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                  <span className={`font-medium whitespace-nowrap ${isCollapsed ? 'lg:hidden' : ''}`}>{item.title}</span>
                </div>
                {item.badge && !isCollapsed && (
                  <span className={`
                    px-2 py-0.5 text-xs font-semibold rounded-full lg:block
                    ${isCollapsed ? 'hidden' : ''}
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-700 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                    {item.title}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500 rounded-full">{item.badge}</span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Toggle Button - Desktop only */}
        <div className="hidden lg:block absolute bottom-20 left-0 right-0 px-3">
          <button
            onClick={onToggleCollapse}
            className={`
              w-full flex items-center justify-center gap-2 py-2 rounded-xl
              bg-slate-800/60 hover:bg-slate-700 border border-slate-700/50
              text-slate-400 hover:text-white
              transition-all duration-300 group
            `}
          >
            <div className={`
              flex items-center justify-center w-7 h-7 rounded-lg 
              bg-slate-700/50 group-hover:bg-blue-500/20 
              transition-all duration-300
              ${isCollapsed ? '' : 'group-hover:translate-x-[-2px]'}
            `}>
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              ) : (
                <ChevronLeft className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
          </button>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 ${isCollapsed ? 'lg:justify-center lg:p-2' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-white font-medium text-sm truncate">Admin</p>
              <p className="text-slate-400 text-xs truncate">Super Admin</p>
            </div>
            <button className={`text-slate-400 hover:text-red-400 transition-colors ${isCollapsed ? 'lg:hidden' : ''}`}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Header Component
function Header({ onMenuClick, isCollapsed }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 shadow-sm">
      {/* Left side - Menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Page title area - can be customized */}
      <div className="ml-2 lg:ml-0">
        <h2 className="text-lg font-semibold text-slate-800">Analytics Dashboard</h2>
      </div>
    </header>
  );
}

// Main Layout Component
export default function AnalyticsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Persist collapse state in localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      
      {/* Main Content Area */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
        `}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} isCollapsed={isCollapsed} />
        
        <main className="p-4 lg:p-6 xl:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
