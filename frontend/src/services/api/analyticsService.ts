import axios from 'axios';
import type { ApiResponse, ApiSingleResponse } from '@/types';
import {
  BusinessKPI,
  TopRevenueProduct,
  ABCAnalysisProduct,
  MarketBasketItem,
  DiscontinuedProduct,
  TopCustomerByCountry,
  RFMCustomer,
  RetentionCustomer,
  DiscountBehaviorCustomer,
  EmployeeMonthlySales,
  EmployeeHierarchy,
  YoYGrowth,
  DayOfWeekPattern,
  DiscountImpact,
  TerritoryPerformance,
  CategoryMonthlyGrowth,
  CategoryCountryBreakdown,
  SupplierPerformance,
  SupplierRisk,
  ShipperEfficiency,
} from '@/types';

const API_BASE_URL = 'https://api.gastro-analytics.uz';

// Create Axios Instance
const apiInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/analytics`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Analytics Service
 */
export const analyticsService = {
  // ==================== DASHBOARD ====================
  getBusinessKPIs: async (): Promise<ApiSingleResponse<BusinessKPI>> => {
    const response = await apiInstance.get('/dashboard/business-kpis');
    // Map Uzbek backend keys to English frontend interface
    let rawData: any = response.data.data || response.data; // Handle potential wrapper
    
    // Backend returns a List[Dict], so we need the first item
    if (Array.isArray(rawData) && rawData.length > 0) {
      rawData = rawData[0];
    }
    
    // Helper to safely get value
    const getVal = (key: string, defaultVal: number = 0) => rawData[key] !== undefined ? rawData[key] : defaultVal;

    const mappedData: BusinessKPI = {
      // Sales
      total_orders: getVal('jami_buyurtmalar'),
      active_customers: getVal('faol_mijozlar'),
      total_revenue: getVal('jami_daromad'),
      freight_costs: getVal('jami_yuk_xarajati'),
      avg_order_value: getVal('ortacha_buyurtma_qiymati'),

      // Products
      total_products: getVal('jami_mahsulotlar'),
      discontinued_products: getVal('toxtatilgan_mahsulotlar'),
      number_of_categories: getVal('kategoriyalar_soni'),
      number_of_suppliers: getVal('yetkazib_beruvchilar_soni'),

      // Employees
      avg_orders_per_employee: getVal('ortacha_buyurtma_per_xodim'),

      // Shipping
      avg_shipping_days: getVal('ortacha_yetkazish_kunlari'),
      on_time_delivery_rate: getVal('vaqtida_yetkazish_foizi'),

      // Trends
      latest_month_revenue: getVal('oxirgi_oy_daromadi'),
    };

    return {
      success: true,
      message: 'Dashboard data fetched successfully',
      data: mappedData
    };
  },

  // ==================== PRODUCTS ====================
  getTopRevenueProducts: async (limit: number = 10): Promise<ApiResponse<TopRevenueProduct>> => {
    const response = await apiInstance.get(`/products/top-revenue?limit=${limit}`);
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    // Calculate total revenue for percentage
    const totalRevenue = dataList.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.total_revenue) || 0), 0);

    const mappedData = dataList.map((item: any, index: number) => {
      const revenue = parseFloat(item.total_revenue) || 0;
      return {
        rank: index + 1,
        product_id: item.product_id || 0,
        product_name: item.product_name || 'Unknown',
        category_name: item.category_name || '',
        supplier_name: item.supplier_name || '',
        quantity_sold: parseInt(item.total_quantity_sold) || 0,
        total_revenue: revenue,
        order_count: item.total_orders || 0,
        revenue_percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      };
    });

    return {
      success: true,
      message: 'Top revenue products retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  getABCAnalysis: async (): Promise<ApiResponse<ABCAnalysisProduct>> => {
    const response = await apiInstance.get('/products/abc-analysis');
    return response.data;
  },

  getMarketBasket: async (
    minOccurrences: number = 5,
    limit: number = 20
  ): Promise<ApiResponse<MarketBasketItem>> => {
    const response = await apiInstance.get(
      `/products/market-basket?min_occurrences=${minOccurrences}&limit=${limit}`
    );
    return response.data;
  },

  getDiscontinuedAnalysis: async (): Promise<ApiResponse<DiscontinuedProduct>> => {
    const response = await apiInstance.get('/products/discontinued-analysis');
    return response.data;
  },

  // ==================== CUSTOMERS ====================
  getTopByCountry: async (): Promise<ApiResponse<TopCustomerByCountry>> => {
    const response = await apiInstance.get('/customers/top-by-country');
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const mappedData = dataList.map((item: any) => {
      const totalSpent = parseFloat(item.total_spent) || 0;
      const orderCount = item.order_count || 0;
      
      return {
        country: item.country,
        total_revenue: totalSpent,
        customer_count: 1, // API returns top customer per country
        total_orders: orderCount,
        avg_order_value: orderCount > 0 ? totalSpent / orderCount : 0,
        // Legacy fields
        top_customer: item.company_name,
        total_amount_spent: totalSpent,
        order_count: orderCount,
        running_total: parseFloat(item.running_total) || 0,
        percentage_of_country: parseFloat(item.percent_of_country) || 0
      };
    });

    return {
      success: true,
      message: 'Top customers by country retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  getRFMSegmentation: async (referenceDate?: string): Promise<ApiResponse<RFMCustomer>> => {
    const params = referenceDate ? `?reference_date=${referenceDate}` : '';
    const response = await apiInstance.get(`/customers/rfm-segmentation${params}`);
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const mappedData = dataList.map((item: any) => ({
      customer_id: item.cust_id?.toString(),
      company_name: item.company_name,
      country: item.country || 'N/A',
      recency_days: item.recency || 0,
      frequency: item.frequency || 0,
      monetary: parseFloat(item.monetary) || 0,
      r_score: item.r_score || 0,
      f_score: item.f_score || 0,
      m_score: item.m_score || 0,
      segment: item.customer_segment || 'Unknown',
      rfm_score: item.rfm_segment || `${item.r_score}${item.f_score}${item.m_score}`,
      recency: item.recency
    }));

    return {
      success: true,
      message: 'RFM segmentation retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  getRetentionAnalysis: async (): Promise<ApiResponse<RetentionCustomer>> => {
    const response = await apiInstance.get('/customers/retention-analysis');
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const mappedData = dataList.map((item: any) => {
      // Map buyer_type from API to frontend format
      const buyerType = item.buyer_type || '';
      let mappedBuyerType: 'one_time' | 'repeat' = 'one_time';
      if (buyerType.includes('Frequent') || buyerType.includes('Regular')) {
        mappedBuyerType = 'repeat';
      } else if (item.total_orders > 1) {
        mappedBuyerType = 'repeat';
      }

      return {
        customer_id: item.cust_id?.toString(),
        company_name: item.company_name,
        country: item.country || 'N/A',
        first_order_date: item.first_order_date,
        last_order_date: item.last_order_date,
        lifespan_days: item.customer_lifespan_days || 0,
        total_orders: item.total_orders || 0,
        total_revenue: 0, // Not provided by API, calculate if needed
        buyer_type: mappedBuyerType,
        avg_days_between_orders: parseFloat(item.avg_days_between_orders) || 0,
        original_buyer_type: item.buyer_type // Keep original for display
      };
    });

    return {
      success: true,
      message: 'Retention analysis retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  getDiscountBehavior: async (limit: number = 50): Promise<ApiResponse<DiscountBehaviorCustomer>> => {
    const response = await apiInstance.get(`/customers/discount-behavior?limit=${limit}`);
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const mappedData = dataList.map((item: any) => ({
      customer_id: item.cust_id?.toString(),
      company_name: item.company_name,
      country: item.country,
      total_orders: item.total_orders,
      orders_with_discount: item.discounted_line_items, // Best approximation from available fields
      total_discount_value: item.total_discount_received,
      discount_percentage: item.avg_discount_percent,
      behavior_segment: item.discount_behavior || 'Unknown',
      
      // Legacy/Optional fields
      total_discounts: item.total_discount_received,
      avg_discount_percentage: item.avg_discount_percent,
      percentage_discounted_items: item.discounted_items_percent,
      overall_discount_impact: item.overall_discount_impact
    }));

    return {
      success: true,
      message: 'Discount behavior analysis retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  // ==================== EMPLOYEES ====================
  getEmployeeMonthlySales: async (): Promise<ApiResponse<EmployeeMonthlySales>> => {
    const response = await apiInstance.get('/employees/monthly-sales');
    return response.data;
  },

  getEmployeeHierarchy: async (): Promise<ApiResponse<EmployeeHierarchy>> => {
    const response = await apiInstance.get('/employees/hierarchy');
    return response.data;
  },

  // ==================== SALES ====================
  getYoYGrowth: async (): Promise<ApiResponse<YoYGrowth>> => {
    const response = await apiInstance.get('/sales/yoy-growth');
    return response.data;
  },

  getDayOfWeekPatterns: async (): Promise<ApiResponse<DayOfWeekPattern>> => {
    const response = await apiInstance.get('/sales/day-of-week-patterns');
    return response.data;
  },

  getDiscountImpact: async (limit: number = 20): Promise<ApiResponse<DiscountImpact>> => {
    const response = await apiInstance.get(`/sales/discount-impact?limit=${limit}`);
    return response.data;
  },

  getTerritoryPerformance: async (): Promise<ApiResponse<TerritoryPerformance>> => {
    const response = await apiInstance.get('/sales/territory-performance');
    return response.data;
  },

  // ==================== CATEGORIES ====================
  getCategoryMonthlyGrowth: async (): Promise<ApiResponse<CategoryMonthlyGrowth>> => {
    const response = await apiInstance.get('/categories/monthly-growth');
    return response.data;
  },

  getCategoryCountryBreakdown: async (): Promise<ApiResponse<CategoryCountryBreakdown>> => {
    const response = await apiInstance.get('/categories/country-breakdown');
    return response.data;
  },

  // ==================== SUPPLIERS ====================
  getSupplierPerformance: async (minOrders: number = 10): Promise<ApiResponse<SupplierPerformance>> => {
    const response = await apiInstance.get(`/suppliers/performance?min_orders=${minOrders}`);
    return response.data;
  },

  getSupplierRiskAnalysis: async (threshold: number = 0.3): Promise<ApiResponse<SupplierRisk>> => {
    const response = await apiInstance.get(`/suppliers/risk-analysis?threshold=${threshold}`);
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const mappedData = dataList.map((item: any) => {
      // Parse risk level from string strictly
      let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
      const riskStr = (item.risk_assessment || '').toUpperCase();
      if (riskStr.includes('HIGH')) riskLevel = 'High';
      else if (riskStr.includes('MEDIUM')) riskLevel = 'Medium';
      
      return {
        supplier_id: item.supplier_id || 0,
        company_name: item.supplier_name || 'Unknown',
        risk_level: riskLevel,
        risk_factors: [item.risk_assessment], // Use full string as a factor
        dependency_score: (item.revenue_share_percent || 0) / 100,
        product_count: item.product_count || 0,
        
        // Fill missing required fields with defaults
        single_supplier_products: 0, 
        revenue_share: item.revenue_share_percent,
        category_count: 1 // Since it's grouped by category
      };
    });

    return {
      success: true,
      message: 'Supplier risk analysis retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  // ==================== SHIPPING ====================
  getShippingEfficiency: async (): Promise<ApiResponse<ShipperEfficiency>> => {
    const response = await apiInstance.get('/shipping/efficiency');
    return response.data;
  },

  // ==================== HEALTH ====================
  checkHealth: async (): Promise<{ status: string }> => {
    const response = await apiInstance.get('/health');
    return response.data;
  },
};

export default analyticsService;
