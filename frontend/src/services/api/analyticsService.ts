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
  CategoryMonthlySales,
  CategoryCountryBreakdown,
  SupplierPerformance,
  SupplierRisk,
  ShipperEfficiency,
  RecentActivity
} from '@/types/analytics.types';

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
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    // Calculate total revenue for percentage
    const totalRevenue = dataList.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.total_revenue) || 0), 0);

    const mappedData = dataList.map((item: any) => {
      const revenue = parseFloat(item.total_revenue) || 0;
      return {
        product_id: item.product_id || 0,
        product_name: item.product_name || 'Unknown',
        category_name: item.category_name || '',
        total_revenue: revenue,
        revenue_rank: item.revenue_rank || 0,
        cumulative_revenue: parseFloat(item.cumulative_revenue) || 0,
        revenue_percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
        cumulative_percentage: parseFloat(item.cumulative_percent) || 0,
        abc_category: item.abc_category || 'C'
      };
    });

    return {
      success: true,
      message: 'ABC analysis retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  getMarketBasket: async (
    minOccurrences: number = 5,
    limit: number = 20
  ): Promise<ApiResponse<MarketBasketItem>> => {
    const response = await apiInstance.get(
      `/products/market-basket?min_occurrences=${minOccurrences}&limit=${limit}`
    );
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const mappedData = dataList.map((item: any) => ({
      product_1: item.product_name1 || 'Unknown',
      product_2: item.product_name2 || 'Unknown',
      times_bought_together: parseInt(item.times_bought_together) || 0,
      support_percent: parseFloat(item.support_percent) || 0
    }));

    return {
      success: true,
      message: 'Market basket analysis retrieved',
      data: mappedData,
      count: mappedData.length
    };
  },

  getDiscontinuedAnalysis: async (): Promise<ApiResponse<DiscontinuedProduct>> => {
    const response = await apiInstance.get('/products/discontinued-analysis');
    
    // Map backend response to frontend interface
    const rawData = response.data.data || response.data;
    const dataList = Array.isArray(rawData) ? rawData : (rawData.data || []);

    const mappedData = dataList.map((item: any) => ({
      product_status: item.product_status || 'Unknown',
      product_count: parseInt(item.product_count) || 0,
      total_orders: parseInt(item.total_orders) || 0,
      total_units_sold: parseInt(item.total_units_sold) || 0,
      total_revenue: parseFloat(item.total_revenue) || 0,
      avg_revenue_per_product: parseFloat(item.avg_revenue_per_product) || 0,
      avg_discount_given: parseFloat(item.avg_discount_given) || 0
    }));

    return {
      success: true,
      message: 'Discontinued analysis retrieved',
      data: mappedData,
      count: mappedData.length
    };
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
  getEmployeeMonthlySales: async (year?: number): Promise<ApiResponse<EmployeeMonthlySales[]> & { years: number[] }> => {
    const response = await apiInstance.get('/employees/monthly-sales', { params: { year } });
    const rawData = response.data;
    
    // Check if response has 'years' property which is not in standard ApiResponse
    let years = ((rawData as any).years || []) as number[];
    const dataList = Array.isArray(rawData.data) ? rawData.data : (rawData.data?.data || []);

    const mappedData = dataList.map((item: any) => ({
      employee_id: item.employee_id || 0,
      employee_name: item.employee_name || 'Unknown',
      photo_url: item.photo_url || '', // Backend should provide this
      total_sales: Number(item.total_sales) || 0,
      completed_orders: Number(item.completed_orders) || 0,
      active_deals: Number(item.active_deals) || 0,
      avg_order_value: parseFloat(item.avg_order_value) || 0,
      order_year: item.order_year // ensure this exists for sorting
    }));

    // If years not provided in response, extract from data
    if (years.length === 0) {
      years = ([...new Set(mappedData.map((item: any) => item.order_year))] as number[]).sort((a: any, b: any) => b - a);
    }

    return {
      success: true,
      message: 'Employee monthly sales retrieved',
      data: mappedData,
      count: mappedData.length,
      years: years
    };
  },

  getEmployeeHierarchy: async (): Promise<ApiResponse<EmployeeHierarchy>> => {
    const response = await apiInstance.get('/employees/hierarchy');
    return response.data;
  },

  // ==================== SALES ====================
  getYoYGrowth: async (): Promise<ApiResponse<YoYGrowth[]>> => {
    const response = await apiInstance.get('/sales/yoy-growth');
    const rawData = response.data;
    
    // Extract data array
    const dataList = rawData?.data || rawData || [];
    
    // Map API fields to frontend interface
    const mappedData: YoYGrowth[] = dataList.map((item: Record<string, unknown>) => {
      const salesMonth = String(item.sales_month || '');
      const [yearStr, monthStr] = salesMonth.split('-');
      const revenue = parseFloat(String(item.revenue || 0));
      const prevYearRevenue = item.prev_year_revenue != null ? parseFloat(String(item.prev_year_revenue)) : null;
      const absoluteDiff = prevYearRevenue != null ? revenue - prevYearRevenue : null;
      
      return {
        sales_month: salesMonth,
        year: parseInt(yearStr) || 0,
        month: parseInt(monthStr) || 0,
        revenue,
        prev_year_revenue: prevYearRevenue,
        yoy_growth_percent: item.yoy_growth_percent != null ? parseFloat(String(item.yoy_growth_percent)) : null,
        moving_avg_3month: parseFloat(String(item.moving_avg_3month || 0)),
        ytd_revenue: parseFloat(String(item.ytd_revenue || 0)),
        absolute_difference: absoluteDiff,
      };
    });
    
    return {
      success: rawData?.success ?? true,
      message: rawData?.message ?? 'Success',
      data: mappedData,
    };
  },

  getDayOfWeekPatterns: async (): Promise<ApiResponse<DayOfWeekPattern>> => {
    const response = await apiInstance.get('/sales/day-of-week-patterns');
    return response.data;
  },

  getDiscountImpact: async (limit: number = 20): Promise<ApiResponse<DiscountImpact>> => {
    const response = await apiInstance.get(`/sales/discount-impact?limit=${limit}`);
    return response.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    try {
      const response = await apiInstance.get<ApiResponse<RecentActivity[]>>(`/dashboard/recent-activity?limit=${limit}`);
      return response.data.data;
    } catch (error) {
       console.warn('Recent Activity API not available, using mock data');
       // Fallback mock data for demonstration when API is missing
       return [
        {
          order_id: 10248,
          order_date: new Date().toISOString(),
          customer_name: 'Vins et alcools Chevalier',
          employee_name: 'Buchanan, Steven',
          total_amount: 440.00,
          status: 'Completed'
        },
        {
          order_id: 10249,
          order_date: new Date(Date.now() - 86400000).toISOString(),
          customer_name: 'Toms Spezialitäten',
          employee_name: 'Suyama, Michael',
          total_amount: 1863.40,
          status: 'Completed'
        },
        {
          order_id: 10250,
          order_date: new Date(Date.now() - 172800000).toISOString(),
          customer_name: 'Hanari Carnes',
          employee_name: 'Davolio, Nancy',
          total_amount: 1550.60,
          status: 'Late'
        },
        {
          order_id: 10251,
          order_date: new Date(Date.now() - 259200000).toISOString(),
          customer_name: 'Victuailles en stock',
          employee_name: 'Leverling, Janet',
          total_amount: 654.50,
          status: 'Completed'
        },
        {
          order_id: 10252,
          order_date: new Date(Date.now() - 345600000).toISOString(),
          customer_name: 'Suprêmes délices',
          employee_name: 'Peacock, Margaret',
          total_amount: 3597.90,
          status: 'Pending'
        }
      ].slice(0, limit);
    }
  },

  getTerritoryPerformance: async (): Promise<ApiResponse<TerritoryPerformance>> => {
    const response = await apiInstance.get('/sales/territory-performance');
    return response.data;
  },

  // ==================== CATEGORIES ====================
  // ==================== CATEGORIES ====================
  getCategoryMonthlyGrowth: async (): Promise<ApiResponse<CategoryMonthlySales[]>> => {
    try {
      const response = await apiInstance.get('/categories/monthly-growth');
      const rawData = response.data.data || response.data;
      const flatData = Array.isArray(rawData) ? rawData : (rawData.data || []);

      // Group by category to match CategoryMonthlySales structure
      const groupedData: Record<string, any> = {};

      flatData.forEach((item: any) => {
        const catName = item.category_name;
        if (!groupedData[catName]) {
          groupedData[catName] = {
            category_id: 0, // Will assign index later
            category_name: catName,
            total_sales: 0,
            growth_percentage: 0,
            monthly_data: []
          };
        }

        const revenue = parseFloat(item.monthly_revenue) || 0;

        groupedData[catName].total_sales += revenue;
        
        // Month Logic
        const now = new Date(); // 2026-01-17
        const [yearStr, mStr] = item.sales_month.split('-');
        const itemYear = parseInt(yearStr, 10);
        const itemMonth = parseInt(mStr, 10);
        
        const isCurrentMonth = itemYear === now.getFullYear() && itemMonth === (now.getMonth() + 1);

        // Always add to monthly_data for the chart
        groupedData[catName].monthly_data.push({
          year: itemYear,
          month: itemMonth,
          total_sales: revenue,
          order_count: 0,
          growth_percent: item.mom_growth_percent ? parseFloat(item.mom_growth_percent) : 0
        });

        // Only set the summary growth percentage if it's NOT the current incomplete month
        // This ensures we show the growth of the last FULL month (e.g. Dec vs Nov) instead of Jan vs Dec
        if (!isCurrentMonth && item.mom_growth_percent !== null && item.mom_growth_percent !== undefined) {
           groupedData[catName].growth_percentage = parseFloat(item.mom_growth_percent);
        }
      });

      const result = Object.values(groupedData).map((cat, index) => ({
        ...cat,
        category_id: index + 1
      })) as CategoryMonthlySales[];

      return {
        success: true,
        message: 'Category growth retrieved successfully',
        data: result
      };
    } catch (error) {
      console.warn('Failed to fetch category monthly growth, using mock data');
      // Mock data for fallback
      const categories = ['Beverages', 'Condiments', 'Confections', 'Dairy Products', 'Grains/Cereals', 'Meat/Poultry', 'Produce', 'Seafood'];
      const mockData = categories.map((cat, index) => {
        const monthly_data = Array.from({ length: 12 }, (_, i) => ({
          year: 2023,
          month: i + 1,
          total_sales: Math.floor(Math.random() * 5000) + 1000,
          order_count: Math.floor(Math.random() * 50) + 10,
          growth_percent: Number((Math.random() * 20 - 5).toFixed(1))
        }));
        const total_sales = monthly_data.reduce((sum, m) => sum + m.total_sales, 0);
        
        return {
          category_id: index + 1,
          category_name: cat,
          total_sales,
          growth_percentage: Number((Math.random() * 20 - 5).toFixed(1)), // -5% to +15%
          monthly_data
        };
      });

      return {
        success: true,
        message: 'Mock data retrieved successfully',
        data: mockData
      };
    }
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
