"""
Analytics Router - REST API Endpoints
Following RESTful design principles and Clean Architecture
Provides 20 analytics endpoints with comprehensive documentation
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from src.config.database import get_db, DatabaseManager
from src.models.analytics import AnalyticsResponse
from src.services.analytics_service import (
    ProductAnalyticsService,
    EmployeeAnalyticsService,
    CustomerAnalyticsService,
    CategoryAnalyticsService,
    SupplierAnalyticsService,
    ShippingAnalyticsService,
    SalesAnalyticsService,
    AnalyticsServiceFactory
)
from src.utils.exceptions import DatabaseException
import logging

logger = logging.getLogger(__name__)

# Create router with prefix and tags
router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
    responses={
        500: {"description": "Internal Server Error"},
        400: {"description": "Bad Request"}
    }
)


# ============================================================================
# PRODUCT ANALYTICS ENDPOINTS
# ============================================================================

@router.get(
    "/products/top-revenue",
    response_model=AnalyticsResponse,
    summary="Top Revenue Products",
    description="""
    **Query 1: Eng ko'p daromad keltirgan TOP mahsulotlar**
    
    Returns the top revenue-generating products with detailed sales metrics.
    
    **Metrics included:**
    - Total revenue per product
    - Total quantity sold
    - Number of orders
    
    **Use cases:**
    - Identify best-selling products
    - Inventory planning
    - Marketing focus
    """,
    response_description="List of top revenue products"
)
async def get_top_revenue_products(
    limit: int = Query(
        default=5,
        ge=1,
        le=100,
        description="Number of top products to return"
    ),
    db: DatabaseManager = Depends(get_db)
):
    """Get top revenue generating products"""
    try:
        service = AnalyticsServiceFactory.create_product_service(db)
        return service.get_top_revenue_products(limit)
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/products/market-basket",
    response_model=AnalyticsResponse,
    summary="Market Basket Analysis",
    description="""
    **Query 7: Mahsulotlarning birga sotilish tendensiyasi**
    
    Analyzes which products are frequently bought together.
    
    **Metrics included:**
    - Product pairs
    - Times bought together
    - Support percentage
    
    **Use cases:**
    - Cross-selling strategies
    - Product bundling
    - Store layout optimization
    """,
    response_description="Product pairs frequently bought together"
)
async def get_market_basket_analysis(
    min_occurrences: int = Query(
        default=10,
        ge=1,
        description="Minimum times products should be bought together"
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Number of product pairs to return"
    ),
    db: DatabaseManager = Depends(get_db)
):
    """Get products frequently bought together"""
    try:
        service = AnalyticsServiceFactory.create_product_service(db)
        return service.get_market_basket_analysis(min_occurrences, limit)
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/products/abc-analysis",
    response_model=AnalyticsResponse,
    summary="ABC Analysis",
    description="""
    **Query 16: ABC tahlili - Mahsulotlarni daromad bo'yicha turkumlang**
    
    Classifies products into ABC categories based on revenue contribution.
    
    **Categories:**
    - A: Top 70% of revenue (most important)
    - B: Next 20% of revenue
    - C: Bottom 10% of revenue
    
    **Use cases:**
    - Inventory management prioritization
    - Resource allocation
    - Focus on high-value products
    """,
    response_description="Products classified by ABC analysis"
)
async def get_abc_analysis(db: DatabaseManager = Depends(get_db)):
    """Get ABC analysis for product classification"""
    try:
        service = AnalyticsServiceFactory.create_product_service(db)
        return service.get_abc_analysis()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/products/discontinued-analysis",
    response_model=AnalyticsResponse,
    summary="Discontinued Products Analysis",
    description="""
    **Query 12: To'xtatilgan mahsulotlarning ta'sirini tahlil qiling**
    
    Compares performance of active vs discontinued products.
    
    **Metrics included:**
    - Product count by status
    - Total orders and units sold
    - Revenue comparison
    - Average discount given
    
    **Use cases:**
    - Product lifecycle management
    - Impact assessment of discontinuation
    - Strategic planning
    """,
    response_description="Analysis of discontinued products impact"
)
async def get_discontinued_products_analysis(db: DatabaseManager = Depends(get_db)):
    """Get analysis of discontinued products impact"""
    try:
        service = AnalyticsServiceFactory.create_product_service(db)
        return service.get_discontinued_products_analysis()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# EMPLOYEE ANALYTICS ENDPOINTS
# ============================================================================

@router.get(
    "/employees/monthly-sales",
    response_model=AnalyticsResponse,
    summary="Employee Monthly Sales",
    description="""
    **Query 2: Har bir xodimning oylik sotuvlarini hisoblang**
    
    Provides monthly sales performance for each employee.
    
    **Metrics included:**
    - Total orders per month
    - Monthly revenue
    - Average order value
    
    **Use cases:**
    - Performance evaluation
    - Commission calculation
    - Sales team management
    """,
    response_description="Monthly sales data for all employees"
)
async def get_employee_monthly_sales(db: DatabaseManager = Depends(get_db)):
    """Get employee monthly sales performance"""
    try:
        service = AnalyticsServiceFactory.create_employee_service(db)
        return service.get_monthly_sales_performance()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/employees/hierarchy",
    response_model=AnalyticsResponse,
    summary="Employee Hierarchy",
    description="""
    **Query 8: Xodimlar ierarxiyasi va jamoaviy sotuv**
    
    Shows employee organizational hierarchy with sales performance.
    
    **Features:**
    - Recursive hierarchy traversal
    - Hierarchy path visualization
    - Sales performance by level
    
    **Use cases:**
    - Organizational structure analysis
    - Team performance evaluation
    - Management reporting
    """,
    response_description="Employee hierarchy with sales data"
)
async def get_employee_hierarchy(db: DatabaseManager = Depends(get_db)):
    """Get employee hierarchy with sales performance"""
    try:
        service = AnalyticsServiceFactory.create_employee_service(db)
        return service.get_hierarchy_with_sales()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# CUSTOMER ANALYTICS ENDPOINTS
# ============================================================================

@router.get(
    "/customers/top-by-country",
    response_model=AnalyticsResponse,
    summary="Top Customer by Country",
    description="""
    **Query 3: Har bir davlat bo'yicha eng yaxshi mijoz**
    
    Identifies the top spending customer in each country.
    
    **Metrics included:**
    - Total amount spent
    - Number of orders
    - Running total in country
    - Percentage of country's total revenue
    
    **Use cases:**
    - VIP customer identification
    - Regional account management
    - Targeted marketing campaigns
    """,
    response_description="Top customer per country with analytics"
)
async def get_top_customers_by_country(db: DatabaseManager = Depends(get_db)):
    """Get top customer in each country"""
    try:
        service = AnalyticsServiceFactory.create_customer_service(db)
        return service.get_top_customers_by_country()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/customers/rfm-segmentation",
    response_model=AnalyticsResponse,
    summary="RFM Customer Segmentation",
    description="""
    **Query 5: RFM (Recency, Frequency, Monetary) tahlili**
    
    Segments customers based on RFM analysis.
    
    **RFM Scores (1-5):**
    - Recency: Days since last order (5 = most recent)
    - Frequency: Number of orders (5 = most frequent)
    - Monetary: Total amount spent (5 = highest value)
    
    **Customer Segments:**
    - Champions: Best customers (RFM 444+)
    - Loyal Customers: Regular buyers
    - New Customers: Recent but few orders
    - At Risk: Haven't ordered recently
    - Lost: Inactive customers
    
    **Use cases:**
    - Customer retention strategies
    - Targeted marketing campaigns
    - Customer lifetime value prediction
    """,
    response_description="RFM customer segmentation with scores"
)
async def get_rfm_segmentation(
    reference_date: str = Query(
        default="2008-05-06",
        description="Reference date for recency calculation (YYYY-MM-DD)"
    ),
    db: DatabaseManager = Depends(get_db)
):
    """Get RFM customer segmentation"""
    try:
        service = AnalyticsServiceFactory.create_customer_service(db)
        return service.get_rfm_segmentation(reference_date)
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/customers/retention-analysis",
    response_model=AnalyticsResponse,
    summary="Customer Retention Analysis",
    description="""
    **Query 13: Mijozlarning qayta buyurtma qilish vaqti**
    
    Analyzes customer retention and reorder patterns.
    
    **Metrics included:**
    - Customer lifespan in days
    - Average days between orders
    - First and last order dates
    - Buyer type classification
    
    **Buyer Types:**
    - One-Time Buyer: Single purchase
    - Frequent Buyer: Orders every ≤30 days
    - Regular Buyer: Orders every 31-90 days
    - Occasional Buyer: Orders every >90 days
    
    **Use cases:**
    - Retention strategy development
    - Churn prediction
    - Customer lifecycle management
    """,
    response_description="Customer retention metrics and patterns"
)
async def get_customer_retention_analysis(db: DatabaseManager = Depends(get_db)):
    """Get customer retention analysis"""
    try:
        service = AnalyticsServiceFactory.create_customer_service(db)
        return service.get_retention_metrics()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/customers/discount-behavior",
    response_model=AnalyticsResponse,
    summary="Customer Discount Behavior",
    description="""
    **Query 18: Mijozlarning chegirma olish tendensiyasi**
    
    Analyzes customer discount usage patterns.
    
    **Metrics included:**
    - Total discounts received
    - Average discount percentage
    - Percentage of discounted items
    - Overall discount impact
    
    **Behavior Classifications:**
    - Discount Hunter: Avg discount ≥15%
    - Discount Aware: Avg discount 5-15%
    - Full Price Buyer: Avg discount <5%
    
    **Use cases:**
    - Pricing strategy optimization
    - Promotional campaign targeting
    - Profitability analysis by customer
    """,
    response_description="Customer discount usage patterns"
)
async def get_customer_discount_behavior(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Number of customers to analyze"
    ),
    db: DatabaseManager = Depends(get_db)
):
    """Get customer discount behavior analysis"""
    try:
        service = AnalyticsServiceFactory.create_customer_service(db)
        return service.get_discount_behavior(limit)
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# CATEGORY ANALYTICS ENDPOINTS
# ============================================================================

@router.get(
    "/categories/monthly-growth",
    response_model=AnalyticsResponse,
    summary="Category Monthly Growth",
    description="""
    **Query 4: Kategoriya bo'yicha oylik o'sish (MoM Growth)**
    
    Analyzes month-over-month growth for each category.
    
    **Metrics included:**
    - Monthly revenue per category
    - Previous month revenue
    - MoM growth percentage
    
    **Use cases:**
    - Category performance tracking
    - Trend identification
    - Strategic planning
    """,
    response_description="Category MoM growth analysis"
)
async def get_category_monthly_growth(db: DatabaseManager = Depends(get_db)):
    """Get category month-over-month growth"""
    try:
        service = AnalyticsServiceFactory.create_category_service(db)
        return service.get_monthly_growth()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/categories/country-breakdown",
    response_model=AnalyticsResponse,
    summary="Country-Category Breakdown",
    description="""
    **Query 10: Davlatlar va kategoriyalar bo'yicha PIVOT jadval**
    
    Provides a pivot table of sales by country and category.
    
    **Categories included:**
    - Beverages
    - Condiments
    - Confections
    - Dairy Products
    - Grains/Cereals
    - Meat/Poultry
    - Produce
    - Seafood
    
    **Use cases:**
    - Regional product performance
    - Market-specific strategies
    - Product mix optimization
    """,
    response_description="Sales breakdown by country and category"
)
async def get_country_category_breakdown(db: DatabaseManager = Depends(get_db)):
    """Get sales breakdown by country and category"""
    try:
        service = AnalyticsServiceFactory.create_category_service(db)
        return service.get_country_category_breakdown()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# SUPPLIER ANALYTICS ENDPOINTS
# ============================================================================

@router.get(
    "/suppliers/performance",
    response_model=AnalyticsResponse,
    summary="Supplier Performance",
    description="""
    **Query 6: Yetkazib beruvchilar samaradorligini baholang**
    
    Evaluates supplier performance and lead time analysis.
    
    **Metrics included:**
    - Average lead time in days
    - Late shipment percentage
    - Total revenue by supplier
    - Min/Max lead times
    
    **Use cases:**
    - Supplier evaluation
    - Logistics optimization
    - Contract negotiations
    """,
    response_description="Supplier performance metrics"
)
async def get_supplier_performance(
    min_orders: int = Query(
        default=10,
        ge=1,
        description="Minimum orders for supplier inclusion"
    ),
    db: DatabaseManager = Depends(get_db)
):
    """Get supplier performance and lead time analysis"""
    try:
        service = AnalyticsServiceFactory.create_supplier_service(db)
        return service.get_performance_metrics(min_orders)
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/suppliers/risk-analysis",
    response_model=AnalyticsResponse,
    summary="Supplier Risk Analysis",
    description="""
    **Query 19: Yetkazib beruvchi diversifikatsiyasi va xavf tahlili**
    
    Analyzes supplier diversification and concentration risk.
    
    **Risk Levels:**
    - HIGH RISK: >50% revenue from single supplier
    - MEDIUM RISK: 25-50% revenue concentration
    - LOW RISK: Well diversified
    
    **Metrics included:**
    - Revenue share per supplier
    - Number of suppliers per category
    - Product count by supplier
    
    **Use cases:**
    - Supply chain risk management
    - Diversification strategy
    - Vendor relationship management
    """,
    response_description="Supplier risk assessment by category"
)
async def get_supplier_risk_analysis(db: DatabaseManager = Depends(get_db)):
    """Get supplier risk and diversification analysis"""
    try:
        service = AnalyticsServiceFactory.create_supplier_service(db)
        return service.get_risk_assessment()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# SHIPPING ANALYTICS ENDPOINTS
# ============================================================================

@router.get(
    "/shipping/efficiency",
    response_model=AnalyticsResponse,
    summary="Shipper Efficiency Analysis",
    description="""
    **Query 9: Yetkazib berish kompaniyalari samaradorligi**
    
    Analyzes shipping company performance and cost efficiency.
    
    **Metrics included:**
    - Total shipments
    - Average freight cost
    - Average shipping days
    - On-time delivery rate
    - Freight-to-value ratio
    
    **Use cases:**
    - Carrier selection
    - Cost optimization
    - Service level agreements
    """,
    response_description="Shipper efficiency and cost metrics"
)
async def get_shipper_efficiency(db: DatabaseManager = Depends(get_db)):
    """Get shipper performance and cost analysis"""
    try:
        service = AnalyticsServiceFactory.create_shipping_service(db)
        return service.get_shipper_efficiency()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# SALES ANALYTICS ENDPOINTS
# ============================================================================

@router.get(
    "/sales/yoy-growth",
    response_model=AnalyticsResponse,
    summary="Year-over-Year Growth",
    description="""
    **Query 11: Yillik o'sish tendensiyasi va harakatlanuvchi o'rtacha**
    
    Provides YoY growth trends with moving averages.
    
    **Metrics included:**
    - Monthly revenue
    - Previous year same month revenue
    - YoY growth percentage
    - 3-month moving average
    - Year-to-date revenue
    
    **Use cases:**
    - Long-term trend analysis
    - Forecasting
    - Strategic planning
    """,
    response_description="YoY growth with moving averages"
)
async def get_yoy_growth(db: DatabaseManager = Depends(get_db)):
    """Get year-over-year growth and moving averages"""
    try:
        service = AnalyticsServiceFactory.create_sales_service(db)
        return service.get_yoy_growth_trends()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/sales/day-of-week-patterns",
    response_model=AnalyticsResponse,
    summary="Day of Week Sales Patterns",
    description="""
    **Query 17: Hafta kunlari bo'yicha sotuv tendensiyasi**
    
    Analyzes sales patterns by day of week.
    
    **Metrics included:**
    - Total orders per day
    - Unique customers per day
    - Revenue by day of week
    - Order percentage distribution
    
    **Use cases:**
    - Staffing optimization
    - Promotional timing
    - Operational planning
    """,
    response_description="Sales patterns by day of week"
)
async def get_day_of_week_patterns(db: DatabaseManager = Depends(get_db)):
    """Get sales patterns by day of week"""
    try:
        service = AnalyticsServiceFactory.create_sales_service(db)
        return service.get_day_of_week_patterns()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/sales/discount-impact",
    response_model=AnalyticsResponse,
    summary="Discount Impact Analysis",
    description="""
    **Query 15: Chegirma ta'siri va rentabellik tahlili**
    
    Analyzes the impact of discounts on profitability.
    
    **Metrics included:**
    - Gross and net amounts
    - Total discount given
    - Average and max discount percentages
    - Discount impact percentage
    
    **Discount Categories:**
    - High Discount: ≥15%
    - Medium Discount: 5-15%
    - Low/No Discount: <5%
    
    **Use cases:**
    - Pricing strategy evaluation
    - Profitability optimization
    - Discount policy review
    """,
    response_description="Discount impact on orders"
)
async def get_discount_impact(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Number of orders to analyze"
    ),
    db: DatabaseManager = Depends(get_db)
):
    """Get discount impact on profitability"""
    try:
        service = AnalyticsServiceFactory.create_sales_service(db)
        return service.get_discount_impact(limit)
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/sales/territory-performance",
    response_model=AnalyticsResponse,
    summary="Territory Sales Performance",
    description="""
    **Query 14: Territoriya va hudud bo'yicha sotuv tahlili**
    
    Analyzes sales performance by territory and region.
    
    **Metrics included:**
    - Total orders per territory
    - Unique customers
    - Revenue by territory
    - Territory rank within region
    
    **Use cases:**
    - Regional performance tracking
    - Sales territory optimization
    - Resource allocation
    """,
    response_description="Territory and region sales data"
)
async def get_territory_performance(db: DatabaseManager = Depends(get_db)):
    """Get territory and region sales performance"""
    try:
        service = AnalyticsServiceFactory.create_sales_service(db)
        return service.get_territory_performance()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/dashboard/business-kpis",
    response_model=AnalyticsResponse,
    summary="Business KPI Dashboard",
    description="""
    **Query 20: Kompleks biznes KPI Dashboard**
    
    Comprehensive business intelligence dashboard with all key metrics.
    
    **Sections included:**
    
    1. **Sales Metrics:**
       - Total orders
       - Active customers
       - Total revenue
       - Freight costs
       - Average order value
    
    2. **Product Metrics:**
       - Total products
       - Discontinued products
       - Number of categories
       - Number of suppliers
    
    3. **Employee Performance:**
       - Average orders per employee
       - Top and bottom performers
    
    4. **Shipping Metrics:**
       - Average shipping days
       - On-time delivery rate
    
    5. **Monthly Trends:**
       - Latest month revenue
    
    **Use cases:**
    - Executive reporting
    - Business performance overview
    - Strategic decision making
    """,
    response_description="Comprehensive business KPIs"
)
async def get_business_kpis(db: DatabaseManager = Depends(get_db)):
    """Get comprehensive business KPI dashboard"""
    try:
        service = AnalyticsServiceFactory.create_sales_service(db)
        return service.get_business_kpis()
    except DatabaseException as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Health check endpoint
@router.get(
    "/health",
    summary="Analytics API Health Check",
    description="Check if the analytics API is running and database is accessible"
)
async def health_check(db: DatabaseManager = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Try to execute a simple query
        db.execute_query("SELECT 1")
        return {
            "status": "healthy",
            "service": "analytics-api",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Service unavailable - database connection failed"
        )
