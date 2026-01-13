"""
Analytics Models - Pydantic schemas for analytics queries
Following Single Responsibility Principle - Each model represents one data structure
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime


# Query 1: Top Revenue Products
class TopRevenueProductSchema(BaseModel):
    """Schema for top revenue generating products"""
    product_id: int = Field(..., description="Product ID")
    product_name: str = Field(..., description="Product name")
    total_revenue: Decimal = Field(..., description="Total revenue generated")
    total_quantity_sold: int = Field(..., description="Total units sold")
    total_orders: int = Field(..., description="Number of orders")

    class Config:
        from_attributes = True


# Query 2: Employee Monthly Sales
class EmployeeMonthlySalesSchema(BaseModel):
    """Schema for employee monthly sales performance"""
    employee_id: int = Field(..., description="Employee ID")
    employee_name: str = Field(..., description="Employee full name")
    title: Optional[str] = Field(None, description="Employee title")
    order_year: int = Field(..., description="Year of orders")
    order_month: int = Field(..., description="Month of orders")
    total_orders: int = Field(..., description="Number of orders")
    monthly_revenue: Decimal = Field(..., description="Revenue for the month")
    avg_order_value: Decimal = Field(..., description="Average order value")

    class Config:
        from_attributes = True


# Query 3: Top Customer by Country
class TopCustomerByCountrySchema(BaseModel):
    """Schema for top customer per country with running total"""
    country: str = Field(..., description="Country name")
    company_name: str = Field(..., description="Company name")
    total_spent: Decimal = Field(..., description="Total amount spent")
    order_count: int = Field(..., description="Number of orders")
    running_total: Decimal = Field(..., description="Running total in country")
    percent_of_country: Decimal = Field(..., description="Percentage of country's total")

    class Config:
        from_attributes = True


# Query 4: Category Monthly Growth
class CategoryMonthlyGrowthSchema(BaseModel):
    """Schema for category month-over-month growth"""
    category_name: str = Field(..., description="Category name")
    sales_month: str = Field(..., description="Sales month (YYYY-MM)")
    monthly_revenue: Decimal = Field(..., description="Revenue for the month")
    prev_month_revenue: Optional[Decimal] = Field(None, description="Previous month revenue")
    mom_growth_percent: Optional[Decimal] = Field(None, description="Month-over-month growth percentage")

    class Config:
        from_attributes = True


# Query 5: RFM Customer Segmentation
class RFMCustomerSegmentSchema(BaseModel):
    """Schema for RFM (Recency, Frequency, Monetary) analysis"""
    cust_id: int = Field(..., description="Customer ID")
    company_name: str = Field(..., description="Company name")
    recency: int = Field(..., description="Days since last order")
    frequency: int = Field(..., description="Number of orders")
    monetary: Decimal = Field(..., description="Total amount spent")
    r_score: int = Field(..., description="Recency score (1-5)")
    f_score: int = Field(..., description="Frequency score (1-5)")
    m_score: int = Field(..., description="Monetary score (1-5)")
    rfm_segment: str = Field(..., description="Combined RFM score")
    customer_segment: str = Field(..., description="Customer segment label")

    class Config:
        from_attributes = True


# Query 6: Supplier Performance
class SupplierPerformanceSchema(BaseModel):
    """Schema for supplier performance and lead time analysis"""
    supplier_id: int = Field(..., description="Supplier ID")
    supplier_name: str = Field(..., description="Supplier company name")
    country: str = Field(..., description="Supplier country")
    total_orders: int = Field(..., description="Total orders")
    avg_lead_time_days: Optional[Decimal] = Field(None, description="Average lead time in days")
    min_lead_time: Optional[int] = Field(None, description="Minimum lead time")
    max_lead_time: Optional[int] = Field(None, description="Maximum lead time")
    late_shipments: int = Field(..., description="Number of late shipments")
    late_shipment_percent: Decimal = Field(..., description="Percentage of late shipments")
    total_revenue: Decimal = Field(..., description="Total revenue from supplier")

    class Config:
        from_attributes = True


# Query 7: Market Basket Analysis
class MarketBasketAnalysisSchema(BaseModel):
    """Schema for products frequently bought together"""
    product_name1: str = Field(..., description="First product name")
    product_name2: str = Field(..., description="Second product name")
    times_bought_together: int = Field(..., description="Times bought together")
    support_percent: Decimal = Field(..., description="Support percentage")

    class Config:
        from_attributes = True


# Query 8: Employee Hierarchy
class EmployeeHierarchySchema(BaseModel):
    """Schema for employee hierarchy with sales performance"""
    employee_id: int = Field(..., description="Employee ID")
    employee_name: str = Field(..., description="Employee full name")
    title: str = Field(..., description="Employee title")
    level: int = Field(..., description="Hierarchy level")
    hierarchy_path: str = Field(..., description="Full hierarchy path")
    total_orders: int = Field(..., description="Number of orders")
    total_revenue: Decimal = Field(..., description="Total revenue generated")

    class Config:
        from_attributes = True


# Query 9: Shipper Efficiency
class ShipperEfficiencySchema(BaseModel):
    """Schema for shipper performance and cost analysis"""
    shipper_id: int = Field(..., description="Shipper ID")
    shipper_name: str = Field(..., description="Shipper company name")
    total_shipments: int = Field(..., description="Total shipments")
    total_freight_cost: Decimal = Field(..., description="Total freight cost")
    avg_freight_cost: Decimal = Field(..., description="Average freight cost")
    freight_std_dev: Optional[Decimal] = Field(None, description="Freight cost standard deviation")
    min_freight: Decimal = Field(..., description="Minimum freight cost")
    max_freight: Decimal = Field(..., description="Maximum freight cost")
    avg_shipping_days: Optional[Decimal] = Field(None, description="Average shipping days")
    on_time_deliveries: int = Field(..., description="Number of on-time deliveries")
    on_time_delivery_rate: Decimal = Field(..., description="On-time delivery rate percentage")
    total_order_value: Decimal = Field(..., description="Total value of orders")
    freight_to_value_ratio: Decimal = Field(..., description="Freight cost to order value ratio")

    class Config:
        from_attributes = True


# Query 10: Country Category Pivot
class CountryCategoryPivotSchema(BaseModel):
    """Schema for sales by country and category (pivot table)"""
    country: str = Field(..., description="Country name")
    beverages: Decimal = Field(..., description="Beverages revenue")
    condiments: Decimal = Field(..., description="Condiments revenue")
    confections: Decimal = Field(..., description="Confections revenue")
    dairy_products: Decimal = Field(..., description="Dairy Products revenue")
    grains_cereals: Decimal = Field(..., description="Grains/Cereals revenue")
    meat_poultry: Decimal = Field(..., description="Meat/Poultry revenue")
    produce: Decimal = Field(..., description="Produce revenue")
    seafood: Decimal = Field(..., description="Seafood revenue")
    total_revenue: Decimal = Field(..., description="Total revenue")

    class Config:
        from_attributes = True


# Query 11: YoY Growth and Moving Average
class YoYGrowthSchema(BaseModel):
    """Schema for year-over-year growth and moving average"""
    sales_month: str = Field(..., description="Sales month (YYYY-MM)")
    revenue: Decimal = Field(..., description="Revenue for the month")
    prev_year_revenue: Optional[Decimal] = Field(None, description="Previous year same month revenue")
    yoy_growth_percent: Optional[Decimal] = Field(None, description="Year-over-year growth percentage")
    moving_avg_3month: Decimal = Field(..., description="3-month moving average")
    ytd_revenue: Decimal = Field(..., description="Year-to-date revenue")

    class Config:
        from_attributes = True


# Query 12: Discontinued Products Analysis
class DiscontinuedProductsAnalysisSchema(BaseModel):
    """Schema for discontinued products impact analysis"""
    product_status: str = Field(..., description="Product status (Active/Discontinued/Grand Total)")
    product_count: int = Field(..., description="Number of products")
    total_orders: int = Field(..., description="Total orders")
    total_units_sold: int = Field(..., description="Total units sold")
    total_revenue: Decimal = Field(..., description="Total revenue")
    avg_revenue_per_product: Decimal = Field(..., description="Average revenue per product")
    avg_discount_given: Decimal = Field(..., description="Average discount given")

    class Config:
        from_attributes = True


# Query 13: Customer Retention Analysis
class CustomerRetentionSchema(BaseModel):
    """Schema for customer retention and reorder analysis"""
    cust_id: int = Field(..., description="Customer ID")
    company_name: str = Field(..., description="Company name")
    country: str = Field(..., description="Country")
    total_orders: int = Field(..., description="Total orders")
    first_order_date: date = Field(..., description="First order date")
    last_order_date: date = Field(..., description="Last order date")
    customer_lifespan_days: int = Field(..., description="Customer lifespan in days")
    avg_days_between_orders: Optional[Decimal] = Field(None, description="Average days between orders")
    buyer_type: str = Field(..., description="Buyer type classification")

    class Config:
        from_attributes = True


# Query 14: Territory Sales Analysis
class TerritorySalesSchema(BaseModel):
    """Schema for territory and region sales analysis"""
    region_id: int = Field(..., description="Region ID")
    region_name: str = Field(..., description="Region name")
    territory_id: str = Field(..., description="Territory ID")
    territory_name: str = Field(..., description="Territory name")
    employee_id: int = Field(..., description="Employee ID")
    employee_name: str = Field(..., description="Employee name")
    total_orders: int = Field(..., description="Total orders")
    unique_customers: int = Field(..., description="Unique customers")
    total_revenue: Decimal = Field(..., description="Total revenue")
    avg_order_value: Decimal = Field(..., description="Average order value")
    territory_rank_in_region: int = Field(..., description="Territory rank in region")

    class Config:
        from_attributes = True


# Query 15: Discount Impact Analysis
class DiscountImpactSchema(BaseModel):
    """Schema for discount impact and profitability analysis"""
    order_id: int = Field(..., description="Order ID")
    order_date: date = Field(..., description="Order date")
    customer_name: str = Field(..., description="Customer company name")
    employee_name: str = Field(..., description="Employee first name")
    gross_amount: Decimal = Field(..., description="Gross amount before discount")
    total_discount: Decimal = Field(..., description="Total discount amount")
    net_amount: Decimal = Field(..., description="Net amount after discount")
    avg_discount_percent: Decimal = Field(..., description="Average discount percentage")
    max_discount_percent: Decimal = Field(..., description="Maximum discount percentage")
    line_items: int = Field(..., description="Number of line items")
    discount_impact_percent: Decimal = Field(..., description="Discount impact percentage")
    discount_category: str = Field(..., description="Discount category label")

    class Config:
        from_attributes = True


# Query 16: ABC Analysis
class ABCAnalysisSchema(BaseModel):
    """Schema for ABC analysis - product classification by revenue"""
    product_id: int = Field(..., description="Product ID")
    product_name: str = Field(..., description="Product name")
    category_name: str = Field(..., description="Category name")
    total_revenue: Decimal = Field(..., description="Total revenue")
    revenue_rank: int = Field(..., description="Revenue rank")
    cumulative_revenue: Decimal = Field(..., description="Cumulative revenue")
    cumulative_percent: Decimal = Field(..., description="Cumulative percentage")
    abc_category: str = Field(..., description="ABC category classification")

    class Config:
        from_attributes = True


# Query 17: Day of Week Sales Pattern
class DayOfWeekSalesSchema(BaseModel):
    """Schema for sales patterns by day of week"""
    day_of_week: int = Field(..., description="Day of week (1=Sunday, 7=Saturday)")
    day_name: str = Field(..., description="Day name")
    total_orders: int = Field(..., description="Total orders")
    unique_customers: int = Field(..., description="Unique customers")
    total_revenue: Decimal = Field(..., description="Total revenue")
    avg_order_value: Decimal = Field(..., description="Average order value")
    order_percentage: Decimal = Field(..., description="Percentage of total orders")
    revenue_rank: int = Field(..., description="Revenue rank")

    class Config:
        from_attributes = True


# Query 18: Customer Discount Behavior
class CustomerDiscountBehaviorSchema(BaseModel):
    """Schema for customer discount usage patterns"""
    cust_id: int = Field(..., description="Customer ID")
    company_name: str = Field(..., description="Company name")
    country: str = Field(..., description="Country")
    total_orders: int = Field(..., description="Total orders")
    gross_purchases: Decimal = Field(..., description="Gross purchases before discount")
    total_discount_received: Decimal = Field(..., description="Total discount received")
    avg_discount_percent: Decimal = Field(..., description="Average discount percentage")
    discounted_line_items: int = Field(..., description="Number of discounted line items")
    total_line_items: int = Field(..., description="Total line items")
    discounted_items_percent: Decimal = Field(..., description="Percentage of discounted items")
    overall_discount_impact: Decimal = Field(..., description="Overall discount impact")
    discount_behavior: str = Field(..., description="Discount behavior classification")

    class Config:
        from_attributes = True


# Query 19: Supplier Risk Analysis
class SupplierRiskAnalysisSchema(BaseModel):
    """Schema for supplier diversification and risk analysis"""
    category_name: str = Field(..., description="Category name")
    supplier_name: str = Field(..., description="Supplier company name")
    supplier_country: str = Field(..., description="Supplier country")
    product_count: int = Field(..., description="Number of products")
    supplier_revenue: Decimal = Field(..., description="Revenue from supplier")
    category_total_revenue: Decimal = Field(..., description="Category total revenue")
    revenue_share_percent: Decimal = Field(..., description="Revenue share percentage")
    total_suppliers_in_category: int = Field(..., description="Total suppliers in category")
    risk_assessment: str = Field(..., description="Risk assessment classification")

    class Config:
        from_attributes = True


# Query 20: Business KPI Dashboard
class BusinessKPIDashboardSchema(BaseModel):
    """Schema for comprehensive business KPI dashboard"""
    # Sales metrics
    section: str = Field(..., description="Section name")
    jami_buyurtmalar: Optional[int] = Field(None, description="Total orders")
    faol_mijozlar: Optional[int] = Field(None, description="Active customers")
    jami_daromad: Optional[Decimal] = Field(None, description="Total revenue")
    jami_yuk_xarajati: Optional[Decimal] = Field(None, description="Total freight cost")
    ortacha_buyurtma_qiymati: Optional[Decimal] = Field(None, description="Average order value")
    
    # Product metrics
    section2: Optional[str] = Field(None, description="Section 2 name")
    jami_mahsulotlar: Optional[int] = Field(None, description="Total products")
    toxtatilgan_mahsulotlar: Optional[int] = Field(None, description="Discontinued products")
    kategoriyalar_soni: Optional[int] = Field(None, description="Number of categories")
    yetkazib_beruvchilar_soni: Optional[int] = Field(None, description="Number of suppliers")
    
    # Employee metrics
    section3: Optional[str] = Field(None, description="Section 3 name")
    ortacha_buyurtma_per_xodim: Optional[int] = Field(None, description="Average orders per employee")
    eng_kop_buyurtma_xodim: Optional[int] = Field(None, description="Most orders by employee")
    eng_kam_buyurtma_xodim: Optional[int] = Field(None, description="Least orders by employee")
    
    # Shipping metrics
    section4: Optional[str] = Field(None, description="Section 4 name")
    ortacha_yetkazish_kunlari: Optional[Decimal] = Field(None, description="Average shipping days")
    vaqtida_yetkazish_foizi: Optional[Decimal] = Field(None, description="On-time delivery percentage")
    
    # Monthly trend
    section5: Optional[str] = Field(None, description="Section 5 name")
    oxirgi_oy: Optional[str] = Field(None, description="Last month")
    oxirgi_oy_daromadi: Optional[Decimal] = Field(None, description="Last month revenue")

    class Config:
        from_attributes = True


# Response wrapper for consistent API responses
class AnalyticsResponse(BaseModel):
    """Generic response wrapper for analytics queries"""
    success: bool = Field(True, description="Request success status")
    message: str = Field(..., description="Response message")
    data: List[dict] = Field(..., description="Query results")
    count: int = Field(..., description="Number of records returned")

    class Config:
        from_attributes = True
