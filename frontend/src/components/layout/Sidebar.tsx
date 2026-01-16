import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp, 
  Briefcase,
  Truck,
  Layers,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { 
    icon: Package, 
    label: 'Mahsulotlar', 
    path: '/products',
    submenu: [
      { label: 'TOP Daromadli', path: '/products/top-revenue' },
      { label: 'ABC Tahlili', path: '/products/abc-analysis' },
      { label: 'Market Basket', path: '/products/market-basket' },
      { label: 'To\'xtatilgan', path: '/products/discontinued' },
    ]
  },
  { 
    icon: Users, 
    label: 'Mijozlar', 
    path: '/customers',
    submenu: [
      { label: 'TOP by Country', path: '/customers/top-by-country' },
      { label: 'RFM Segmentatsiya', path: '/customers/rfm-segmentation' },
      { label: 'Retention', path: '/customers/retention' },
      { label: 'Chegirma Xulq-atvori', path: '/customers/discount-behavior' },
    ]
  },
  { 
    icon: Briefcase, 
    label: 'Xodimlar', 
    path: '/employees',
    submenu: [
      { label: 'Oylik Sotuvlar', path: '/employees/monthly-sales' },

    ]
  },
  { 
    icon: TrendingUp, 
    label: 'Sotuvlar', 
    path: '/sales',
    submenu: [
      { label: 'YoY O\'sish', path: '/sales/yoy-growth' },
      { label: 'Hafta Kunlari', path: '/sales/day-of-week' },
      { label: 'Chegirma Ta\'siri', path: '/sales/discount-impact' },
      { label: 'Territoriya', path: '/sales/territory' },
    ]
  },
  { 
    icon: Layers, 
    label: 'Kategoriyalar', 
    path: '/categories',
    submenu: [
      { label: 'Oylik O\'sish', path: '/categories/monthly-growth' },
      { label: 'Mamlakat Breakdown', path: '/categories/country-breakdown' },
    ]
  },
  { 
    icon: Layers, 
    label: 'Yetkazib Beruvchilar', 
    path: '/suppliers',
    submenu: [
      { label: 'Samaradorlik', path: '/suppliers/performance' },
      { label: 'Xatar Tahlili', path: '/suppliers/risk-analysis' },
    ]
  },
  { icon: Truck, label: 'Yuk Tashuvchilar', path: '/shipping/efficiency' },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border transition-transform duration-300 transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              GA
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Gastro Analytics</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] no-scrollbar">
          {MENU_ITEMS.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      expandedMenus.includes(item.label) 
                        ? "text-primary-600 bg-primary-50 dark:bg-primary-900/10" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {expandedMenus.includes(item.label) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedMenus.includes(item.label) && (
                    <div className="pl-10 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) => cn(
                            "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive 
                              ? "text-primary-600 bg-primary-50 dark:bg-primary-900/10" 
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/10" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
