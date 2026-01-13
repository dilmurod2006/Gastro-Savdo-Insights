/**
 * Analytics API Service
 * 20 ta analytics endpoint uchun API service
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ANALYTICS_URL = `${API_BASE_URL}/api/v1/analytics`;

// Axios instance
const api = axios.create({
  baseURL: ANALYTICS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

/**
 * Product Analytics API
 */
export const productApi = {
  // 1. Top revenue products
  getTopRevenue: (limit = 5) => api.get('/products/top-revenue', { params: { limit } }),
  
  // 7. Market basket analysis
  getMarketBasket: (minOccurrences = 10, limit = 20) => 
    api.get('/products/market-basket', { params: { min_occurrences: minOccurrences, limit } }),
  
  // 16. ABC Analysis
  getAbcAnalysis: () => api.get('/products/abc-analysis'),
  
  // 12. Discontinued products
  getDiscontinued: () => api.get('/products/discontinued-analysis'),
};

/**
 * Employee Analytics API
 */
export const employeeApi = {
  // 2. Monthly sales by employee
  getMonthlySales: () => api.get('/employees/monthly-sales'),
  
  // 8. Employee hierarchy
  getHierarchy: () => api.get('/employees/hierarchy'),
};

/**
 * Customer Analytics API
 */
export const customerApi = {
  // 3. Top customers by country
  getTopByCountry: () => api.get('/customers/top-by-country'),
  
  // 5. RFM Segmentation
  getRfmSegmentation: (referenceDate = '2008-05-06') => 
    api.get('/customers/rfm-segmentation', { params: { reference_date: referenceDate } }),
  
  // 13. Retention analysis
  getRetention: () => api.get('/customers/retention-analysis'),
  
  // 18. Discount behavior
  getDiscountBehavior: (limit = 20) => 
    api.get('/customers/discount-behavior', { params: { limit } }),
};

/**
 * Category Analytics API
 */
export const categoryApi = {
  // 4. Monthly growth
  getMonthlyGrowth: () => api.get('/categories/monthly-growth'),
  
  // 10. Country breakdown (PIVOT)
  getCountryBreakdown: () => api.get('/categories/country-breakdown'),
};

/**
 * Supplier Analytics API
 */
export const supplierApi = {
  // 6. Supplier performance
  getPerformance: (minOrders = 10) => 
    api.get('/suppliers/performance', { params: { min_orders: minOrders } }),
  
  // 19. Risk analysis
  getRiskAnalysis: () => api.get('/suppliers/risk-analysis'),
};

/**
 * Shipping Analytics API
 */
export const shippingApi = {
  // 9. Shipper efficiency
  getEfficiency: () => api.get('/shipping/efficiency'),
};

/**
 * Sales Analytics API
 */
export const salesApi = {
  // 11. Year over Year growth
  getYoyGrowth: () => api.get('/sales/yoy-growth'),
  
  // 17. Day of week patterns
  getDayPatterns: () => api.get('/sales/day-of-week-patterns'),
  
  // 15. Discount impact
  getDiscountImpact: (limit = 20) => 
    api.get('/sales/discount-impact', { params: { limit } }),
  
  // 14. Territory performance
  getTerritoryPerformance: () => api.get('/sales/territory-performance'),
};

/**
 * Dashboard API
 */
export const dashboardApi = {
  // 20. Business KPIs
  getKpis: () => api.get('/dashboard/business-kpis'),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

export default {
  product: productApi,
  employee: employeeApi,
  customer: customerApi,
  category: categoryApi,
  supplier: supplierApi,
  shipping: shippingApi,
  sales: salesApi,
  dashboard: dashboardApi,
};
