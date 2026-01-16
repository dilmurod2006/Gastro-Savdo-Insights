import {
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  TrendingUp,
  FolderOpen,
  Factory,
  Truck,
  type LucideIcon,
} from 'lucide-react';

// API Base URL
export const API_BASE_URL = 'https://api.gastro-analytics.uz';

// Sidebar Width
export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

// Default Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
];

// Gradient Presets
export const GRADIENTS = {
  blue: ['#3b82f6', '#1d4ed8'],
  green: ['#10b981', '#059669'],
  purple: ['#8b5cf6', '#6366f1'],
  orange: ['#f59e0b', '#d97706'],
  red: ['#ef4444', '#dc2626'],
  teal: ['#14b8a6', '#0d9488'],
};

// Menu Items Interface
interface MenuItem {
  id: string;
  label: string;
  labelUz: string;
  icon: LucideIcon;
  path?: string;
  children?: Omit<MenuItem, 'children'>[];
}

// Sidebar Menu Structure
export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelUz: 'Bosh Sahifa',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'products',
    label: 'Products',
    labelUz: 'Mahsulotlar',
    icon: Package,
    children: [
      { id: 'top-revenue', label: 'TOP Revenue', labelUz: 'TOP Daromadli', icon: Package, path: '/products/top-revenue' },
      { id: 'abc-analysis', label: 'ABC Analysis', labelUz: 'ABC Tahlili', icon: Package, path: '/products/abc-analysis' },
      { id: 'market-basket', label: 'Market Basket', labelUz: 'Market Basket', icon: Package, path: '/products/market-basket' },
      { id: 'discontinued', label: 'Discontinued', labelUz: "To'xtatilgan", icon: Package, path: '/products/discontinued' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    labelUz: 'Mijozlar',
    icon: Users,
    children: [
      { id: 'top-by-country', label: 'Top by Country', labelUz: 'TOP by Country', icon: Users, path: '/customers/top-by-country' },
      { id: 'rfm-segmentation', label: 'RFM Segmentation', labelUz: 'RFM Segmentatsiya', icon: Users, path: '/customers/rfm-segmentation' },
      { id: 'retention', label: 'Retention', labelUz: 'Retention', icon: Users, path: '/customers/retention' },
      { id: 'discount-behavior', label: 'Discount Behavior', labelUz: 'Chegirma Xulq-atvori', icon: Users, path: '/customers/discount-behavior' },
    ],
  },
  {
    id: 'employees',
    label: 'Employees',
    labelUz: 'Xodimlar',
    icon: UserCog,
    children: [
      { id: 'monthly-sales', label: 'Monthly Sales', labelUz: 'Oylik Sotuvlar', icon: UserCog, path: '/employees/monthly-sales' },
      { id: 'hierarchy', label: 'Hierarchy', labelUz: 'Ierarxiya', icon: UserCog, path: '/employees/hierarchy' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    labelUz: 'Sotuvlar',
    icon: TrendingUp,
    children: [
      { id: 'yoy-growth', label: 'YoY Growth', labelUz: "YoY O'sish", icon: TrendingUp, path: '/sales/yoy-growth' },
      { id: 'day-of-week', label: 'Day of Week', labelUz: 'Hafta Kunlari', icon: TrendingUp, path: '/sales/day-of-week' },
      { id: 'discount-impact', label: 'Discount Impact', labelUz: "Chegirma Ta'siri", icon: TrendingUp, path: '/sales/discount-impact' },
      { id: 'territory', label: 'Territory', labelUz: 'Territoriya', icon: TrendingUp, path: '/sales/territory' },
    ],
  },
  {
    id: 'categories',
    label: 'Categories',
    labelUz: 'Kategoriyalar',
    icon: FolderOpen,
    children: [
      { id: 'monthly-growth', label: 'Monthly Growth', labelUz: "Oylik O'sish", icon: FolderOpen, path: '/categories/monthly-growth' },
      { id: 'country-breakdown', label: 'Country Breakdown', labelUz: 'Mamlakat Breakdown', icon: FolderOpen, path: '/categories/country-breakdown' },
    ],
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    labelUz: 'Yetkazib Beruvchilar',
    icon: Factory,
    children: [
      { id: 'performance', label: 'Performance', labelUz: 'Samaradorlik', icon: Factory, path: '/suppliers/performance' },
      { id: 'risk-analysis', label: 'Risk Analysis', labelUz: 'Xatar Tahlili', icon: Factory, path: '/suppliers/risk-analysis' },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping',
    labelUz: 'Yuk Tashuvchilar',
    icon: Truck,
    children: [
      { id: 'efficiency', label: 'Efficiency', labelUz: 'Efficiency', icon: Truck, path: '/shipping/efficiency' },
    ],
  },
];

// RFM Segments
export const RFM_SEGMENTS = [
  { name: 'Champions', color: '#10b981', description: 'Eng yaxshi mijozlar' },
  { name: 'Loyal Customers', color: '#3b82f6', description: 'Sodiq mijozlar' },
  { name: 'Potential Loyalist', color: '#8b5cf6', description: 'Potentsial sodiq' },
  { name: 'New Customers', color: '#6366f1', description: 'Yangi mijozlar' },
  { name: 'Promising', color: '#14b8a6', description: 'Istiqbolli' },
  { name: 'Need Attention', color: '#f59e0b', description: 'E\'tibor kerak' },
  { name: 'At Risk', color: '#f97316', description: 'Xavf ostida' },
  { name: 'Hibernating', color: '#ef4444', description: 'Uyquda' },
  { name: 'Lost', color: '#dc2626', description: 'Yo\'qotilgan' },
];

// ABC Categories
export const ABC_CATEGORIES = [
  { category: 'A', color: '#10b981', label: 'High Value', threshold: 80 },
  { category: 'B', color: '#f59e0b', label: 'Medium Value', threshold: 95 },
  { category: 'C', color: '#ef4444', label: 'Low Value', threshold: 100 },
];

// Day of Week Labels
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
