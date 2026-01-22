import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages';
import {
  TopRevenuePage,
  ABCAnalysisPage,
  MarketBasketPage,
  DiscontinuedPage,
} from '@/pages/products';
import {
  TopByCountryPage,
  RFMSegmentationPage,
  RetentionPage,
  DiscountBehaviorPage,
} from '@/pages/customers';
import {
  MonthlySalesPage,

} from '@/pages/employees';
import {
  YoYGrowthPage,
  DayOfWeekPage,
  DiscountImpactPage,
  TerritoryPage,
} from '@/pages/sales';
import {
  MonthlyGrowthPage,
  CountryBreakdownPage,
} from '@/pages/categories';
import {
  PerformancePage,
  RiskAnalysisPage,
} from '@/pages/suppliers';
import { EfficiencyPage } from '@/pages/shipping';
import { MainLayout } from '@/components/layout';
import { ProtectedRoute } from './ProtectedRoute';


/**
 * Layout wrapper for protected routes
 */
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
}

/**
 * Application Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Protected routes with MainLayout
  {
    element: <ProtectedLayout />,
    children: [
      // Dashboard
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      // Products
      {
        path: '/products/top-revenue',
        element: <TopRevenuePage />,
      },
      {
        path: '/products/abc-analysis',
        element: <ABCAnalysisPage />,
      },
      {
        path: '/products/market-basket',
        element: <MarketBasketPage />,
      },
      {
        path: '/products/discontinued',
        element: <DiscontinuedPage />,
      },
      // Customers
      {
        path: '/customers/top-by-country',
        element: <TopByCountryPage />,
      },
      {
        path: '/customers/rfm-segmentation',
        element: <RFMSegmentationPage />,
      },
      {
        path: '/customers/retention',
        element: <RetentionPage />,
      },
      {
        path: '/customers/discount-behavior',
        element: <DiscountBehaviorPage />,
      },
      // Employees
      {
        path: '/employees/monthly-sales',
        element: <MonthlySalesPage />,
      },

      // Sales
      {
        path: '/sales/yoy-growth',
        element: <YoYGrowthPage />,
      },
      {
        path: '/sales/day-of-week',
        element: <DayOfWeekPage />,
      },
      {
        path: '/sales/discount-impact',
        element: <DiscountImpactPage />,
      },
      {
        path: '/sales/territory',
        element: <TerritoryPage />,
      },
      // Categories
      {
        path: '/categories/monthly-growth',
        element: <MonthlyGrowthPage />,
      },
      {
        path: '/categories/country-breakdown',
        element: <CountryBreakdownPage />,
      },
      // Suppliers
      {
        path: '/suppliers/performance',
        element: <PerformancePage />,
      },
      {
        path: '/suppliers/risk-analysis',
        element: <RiskAnalysisPage />,
      },
      // Shipping
      {
        path: '/shipping/efficiency',
        element: <EfficiencyPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
