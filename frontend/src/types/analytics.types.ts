/**
 * Analytics Data Types
 * Alignment: https://api.gastro-analytics.uz/openapi.json
 */

export interface BusinessKPI {
  // Sales
  total_orders: number;
  active_customers: number;
  total_revenue: number;
  freight_costs: number;
  avg_order_value: number;

  // Products
  total_products: number;
  discontinued_products: number;
  number_of_categories: number;
  number_of_suppliers: number;

  // Employees
  avg_orders_per_employee: number;
  // top_performer: string; // Not explicitly typed in schema, might need check
  // bottom_performer: string;

  // Shipping
  avg_shipping_days: number;
  on_time_delivery_rate: number;

  // Trends
  latest_month_revenue: number;
}

// ==================== PRODUCTS ====================
export interface TopRevenueProduct {
  rank: number;
  product_id: number;
  product_name: string;
  category_name: string;
  supplier_name: string;
  quantity_sold: number;
  total_revenue: number;
  order_count: number;
  revenue_percentage: number;
}

export interface ABCAnalysisProduct {
  product_id: number;
  product_name: string;
  category_name: string;
  total_revenue: number;
  revenue_rank: number;
  cumulative_revenue: number;
  revenue_percentage: number;
  cumulative_percentage: number;
  abc_category: string;
}

export interface MarketBasketItem {
  product_1: string;
  product_2: string;
  times_bought_together: number;
  support_percent: number;
}

export interface DiscontinuedProduct {
  product_status: string;
  product_count: number;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  avg_revenue_per_product: number;
  avg_discount_given: number;
}

// ==================== CUSTOMERS ====================
// ==================== CUSTOMERS ====================
export interface TopCustomerByCountry {
  country: string;
  total_revenue: number;
  customer_count: number;
  total_orders: number;
  avg_order_value: number;
  // Legacy
  top_customer?: string;
  total_amount_spent?: number;
  order_count?: number;
  running_total?: number;
  percentage_of_country?: number;
}

export interface RFMCustomer {
  customer_id?: string;
  company_name: string;
  country: string;
  recency_days: number;
  frequency: number;
  monetary: number;
  r_score: number;
  f_score: number;
  m_score: number;
  segment: string; // 'Champions' | ...
  rfm_score?: string; // Derived?
  // Legacy
  recency?: number; 
}

export interface RetentionCustomer {
  customer_id?: string;
  company_name: string;
  country: string;
  first_order_date: string;
  last_order_date: string;
  lifespan_days: number;
  total_orders: number;
  total_revenue: number;
  buyer_type: 'one_time' | 'repeat'; // Page uses lowercase with underscore
  // Legacy
  avg_days_between_orders?: number;
}

export interface DiscountBehaviorCustomer {
  customer_id?: string;
  company_name: string;
  country: string;
  total_orders: number;
  orders_with_discount: number;
  total_discount_value: number;
  discount_percentage: number;
  behavior_segment: string;
  // Legacy
  total_discounts?: number;
  avg_discount_percentage?: number;
  percentage_discounted_items?: number;
  overall_discount_impact?: number;
  behavior_class?: string;
}

// ==================== EMPLOYEES ====================
export interface EmployeeMonthlySales {
  employee_id: number;
  employee_name: string;
  title: string;
  order_year: number;
  order_month: number;
  total_orders: number;
  monthly_revenue: number;
  avg_order_value: number;
}

export interface EmployeeHierarchy {
  employee_id: number;
  first_name: string;
  last_name: string;
  title: string;
  reports_to: number | null;
  email: string;
  phone: string;
  direct_reports: number;
  // Legacy
  full_name?: string;
  level?: number;
  sales_performance?: number;
  subordinates?: EmployeeHierarchy[];
}

// ==================== SALES ====================
// ... (Sales types are below this block, keeping contextual match if possible, but I am replacing from EMPLOYEES)
// Actually I need to match the "SUPPLIERS" which is further down. I'll split this edit or do a larger replace?
// File structure: Employees -> Sales -> Categories -> Suppliers.
// I will just replace Employees section first.


// ==================== SALES ====================
export interface YoYGrowth {
  sales_month: string; // Format: "2006-07"
  year: number; // Computed from sales_month
  month: number; // Computed from sales_month
  revenue: number;
  prev_year_revenue: number | null;
  yoy_growth_percent: number | null;
  moving_avg_3month: number;
  ytd_revenue: number;
  // Computed for display
  absolute_difference: number | null;
}

export interface DayOfWeekPattern {
  day_of_week: number; // Changed to number to match page usage
  total_revenue: number;
  order_count: number;
  avg_order_value: number;
  percentage_of_total: number;
  // Legacy
  total_orders?: number;
  unique_customers?: number;
  revenue?: number;
  order_pct?: number;
}

export interface DiscountImpact {
  has_discount: boolean;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  total_discount_given: number;
  avg_discount_percent: number;
  // Legacy
  category?: 'High Discount' | 'Medium Discount' | 'Low/No Discount';
  gross_amount?: number;
  net_amount?: number;
  total_discount?: number;
  avg_discount_pct?: number;
  max_discount_pct?: number;
  impact_pct?: number;
}

export interface TerritoryPerformance {
  territory_id: number;
  region: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  percentage_of_total: number;
  // Legacy
  territory_description?: string;
  region_id?: number;
  region_description?: string;
  unique_customers?: number;
  rank_in_region?: number;
}

// ==================== CATEGORIES ====================
export interface CategoryMonthlyGrowth {
  category_name: string;
  month: number; 
  year: number;
  monthly_revenue: number;
  previous_month_revenue: number;
  growth_rate: number;
  running_total: number;
  // Legacy
  revenue?: number;
  prev_month_revenue?: number;
  mom_growth_pct?: number;
}

export interface CategoryCountryBreakdown {
  country: string;
  category_name: string;
  total_revenue: number;
  order_count: number;
  category_percentage: number;
  country_percentage: number;
  // Legacy
  category?: string;
  sales_amount?: number;
}

// ==================== SUPPLIERS ====================
export interface SupplierPerformance {
  supplier_id: number;
  company_name: string;
  contact_name: string;
  country: string;
  product_count: number;
  total_revenue: number;
  order_count: number;
  percentage_of_total: number;
  // Legacy
  avg_lead_time_days?: number;
  late_shipment_pct?: number;
  min_lead_time?: number;
  max_lead_time?: number;
}

export interface SupplierRisk {
  supplier_id: number;
  company_name: string;
  risk_level: 'High' | 'Medium' | 'Low'; // Page uses Title Case
  risk_factors: string[];
  dependency_score: number;
  product_count: number;
  single_supplier_products: number;
  // Legacy
  revenue_share?: number;
  category_count?: number;
}

// ==================== SHIPPING ====================
export interface ShipperEfficiency {
  shipper_id: number;
  shipper_name: string;
  total_orders: number;
  total_freight: number;
  avg_freight_per_order: number;
  avg_delivery_days: number;
  on_time_delivery_rate: number;
  // Legacy
  company_name?: string;
  total_shipments?: number;
  avg_freight_cost?: number;
  avg_shipping_days?: number;
  freight_to_value_ratio?: number;
}


