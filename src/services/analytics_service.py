"""
Analytics Service Layer - Business Logic
Following Service Layer Pattern and Single Responsibility Principle
Each service class handles specific business domain logic
"""
from typing import List, Dict, Any, Optional
from src.config.database import DatabaseManager
from src.repositories.analytics_repository import (
    ProductAnalyticsRepository,
    EmployeeAnalyticsRepository,
    CustomerAnalyticsRepository,
    CategoryAnalyticsRepository,
    SupplierAnalyticsRepository,
    ShippingAnalyticsRepository,
    SalesAnalyticsRepository
)
from src.models.analytics import AnalyticsResponse
import logging

logger = logging.getLogger(__name__)


class BaseAnalyticsService:
    """
    Base service class providing common functionality
    Following Open/Closed Principle - open for extension, closed for modification
    """
    
    def format_response(
        self, 
        data: List[Dict[str, Any]], 
        message: str = "Data retrieved successfully"
    ) -> AnalyticsResponse:
        """
        Format data into standard API response
        
        Args:
            data: Query results
            message: Response message
            
        Returns:
            Formatted analytics response
        """
        return AnalyticsResponse(
            success=True,
            message=message,
            data=data,
            count=len(data)
        )


class ProductAnalyticsService(BaseAnalyticsService):
    """
    Service for product-related analytics
    Follows Single Responsibility Principle
    """
    
    def __init__(self, db: DatabaseManager):
        self.repository = ProductAnalyticsRepository(db)
    
    def get_top_revenue_products(self, limit: int = 5) -> AnalyticsResponse:
        """
        Get top revenue generating products
        
        Args:
            limit: Number of products to return
            
        Returns:
            Top revenue products response
        """
        logger.info(f"Fetching top {limit} revenue products")
        data = self.repository.get_top_revenue_products(limit)
        return self.format_response(
            data, 
            f"Top {limit} revenue products retrieved successfully"
        )
    
    def get_abc_analysis(self) -> AnalyticsResponse:
        """
        Get ABC analysis for product classification
        
        Returns:
            ABC analysis response
        """
        logger.info("Performing ABC analysis")
        data = self.repository.get_abc_analysis()
        return self.format_response(
            data,
            "ABC analysis completed successfully"
        )
    
    def get_discontinued_products_analysis(self) -> AnalyticsResponse:
        """
        Get analysis of discontinued products impact
        
        Returns:
            Discontinued products analysis response
        """
        logger.info("Analyzing discontinued products")
        data = self.repository.get_discontinued_products_analysis()
        return self.format_response(
            data,
            "Discontinued products analysis completed"
        )
    
    def get_market_basket_analysis(
        self, 
        min_occurrences: int = 10, 
        limit: int = 20
    ) -> AnalyticsResponse:
        """
        Get products frequently bought together
        
        Args:
            min_occurrences: Minimum co-occurrence threshold
            limit: Number of product pairs to return
            
        Returns:
            Market basket analysis response
        """
        logger.info(f"Performing market basket analysis (min: {min_occurrences}, limit: {limit})")
        data = self.repository.get_market_basket_analysis(min_occurrences, limit)
        return self.format_response(
            data,
            "Market basket analysis completed"
        )


class EmployeeAnalyticsService(BaseAnalyticsService):
    """
    Service for employee-related analytics
    Handles employee performance and hierarchy analysis
    """
    
    def __init__(self, db: DatabaseManager):
        self.repository = EmployeeAnalyticsRepository(db)
    
    def get_monthly_sales_performance(self) -> AnalyticsResponse:
        """
        Get employee monthly sales performance
        
        Returns:
            Employee monthly sales response
        """
        logger.info("Fetching employee monthly sales performance")
        data = self.repository.get_employee_monthly_sales()
        return self.format_response(
            data,
            "Employee monthly sales data retrieved"
        )
    
    def get_hierarchy_with_sales(self) -> AnalyticsResponse:
        """
        Get employee hierarchy with sales performance
        
        Returns:
            Employee hierarchy response
        """
        logger.info("Fetching employee hierarchy")
        data = self.repository.get_employee_hierarchy()
        return self.format_response(
            data,
            "Employee hierarchy data retrieved"
        )


class CustomerAnalyticsService(BaseAnalyticsService):
    """
    Service for customer-related analytics
    Handles customer segmentation and behavior analysis
    """
    
    def __init__(self, db: DatabaseManager):
        self.repository = CustomerAnalyticsRepository(db)
    
    def get_top_customers_by_country(self) -> AnalyticsResponse:
        """
        Get top customer per country
        
        Returns:
            Top customers by country response
        """
        logger.info("Fetching top customers by country")
        data = self.repository.get_top_customer_by_country()
        return self.format_response(
            data,
            "Top customers by country retrieved"
        )
    
    def get_rfm_segmentation(self, reference_date: str = '2008-05-06') -> AnalyticsResponse:
        """
        Get RFM customer segmentation
        
        Args:
            reference_date: Reference date for recency calculation
            
        Returns:
            RFM segmentation response
        """
        logger.info(f"Performing RFM analysis with reference date: {reference_date}")
        data = self.repository.get_rfm_analysis(reference_date)
        return self.format_response(
            data,
            "RFM customer segmentation completed"
        )
    
    def get_retention_metrics(self) -> AnalyticsResponse:
        """
        Get customer retention analysis
        
        Returns:
            Customer retention response
        """
        logger.info("Analyzing customer retention")
        data = self.repository.get_customer_retention_analysis()
        return self.format_response(
            data,
            "Customer retention analysis completed"
        )
    
    def get_discount_behavior(self, limit: int = 20) -> AnalyticsResponse:
        """
        Get customer discount usage patterns
        
        Args:
            limit: Number of customers to analyze
            
        Returns:
            Customer discount behavior response
        """
        logger.info(f"Analyzing discount behavior for top {limit} customers")
        data = self.repository.get_customer_discount_behavior(limit)
        return self.format_response(
            data,
            "Customer discount behavior analysis completed"
        )


class CategoryAnalyticsService(BaseAnalyticsService):
    """
    Service for category-related analytics
    Handles category performance and growth analysis
    """
    
    def __init__(self, db: DatabaseManager):
        self.repository = CategoryAnalyticsRepository(db)
    
    def get_monthly_growth(self) -> AnalyticsResponse:
        """
        Get category month-over-month growth
        
        Returns:
            Category MoM growth response
        """
        logger.info("Calculating category monthly growth")
        data = self.repository.get_category_monthly_growth()
        return self.format_response(
            data,
            "Category monthly growth analysis completed"
        )
    
    def get_country_category_breakdown(self) -> AnalyticsResponse:
        """
        Get sales breakdown by country and category
        
        Returns:
            Country-category pivot response
        """
        logger.info("Generating country-category breakdown")
        data = self.repository.get_country_category_pivot()
        return self.format_response(
            data,
            "Country-category breakdown generated"
        )


class SupplierAnalyticsService(BaseAnalyticsService):
    """
    Service for supplier-related analytics
    Handles supplier performance and risk analysis
    """
    
    def __init__(self, db: DatabaseManager):
        self.repository = SupplierAnalyticsRepository(db)
    
    def get_performance_metrics(self, min_orders: int = 10) -> AnalyticsResponse:
        """
        Get supplier performance and lead time analysis
        
        Args:
            min_orders: Minimum orders for inclusion
            
        Returns:
            Supplier performance response
        """
        logger.info(f"Analyzing supplier performance (min orders: {min_orders})")
        data = self.repository.get_supplier_performance(min_orders)
        return self.format_response(
            data,
            "Supplier performance analysis completed"
        )
    
    def get_risk_assessment(self) -> AnalyticsResponse:
        """
        Get supplier risk and diversification analysis
        
        Returns:
            Supplier risk assessment response
        """
        logger.info("Performing supplier risk assessment")
        data = self.repository.get_supplier_risk_analysis()
        return self.format_response(
            data,
            "Supplier risk assessment completed"
        )


class ShippingAnalyticsService(BaseAnalyticsService):
    """
    Service for shipping and logistics analytics
    Handles shipper efficiency and cost analysis
    """
    
    def __init__(self, db: DatabaseManager):
        self.repository = ShippingAnalyticsRepository(db)
    
    def get_shipper_efficiency(self) -> AnalyticsResponse:
        """
        Get shipper performance and cost analysis
        
        Returns:
            Shipper efficiency response
        """
        logger.info("Analyzing shipper efficiency")
        data = self.repository.get_shipper_efficiency()
        return self.format_response(
            data,
            "Shipper efficiency analysis completed"
        )


class SalesAnalyticsService(BaseAnalyticsService):
    """
    Service for general sales analytics
    Handles various sales-related analysis and KPIs
    """
    
    def __init__(self, db: DatabaseManager):
        self.repository = SalesAnalyticsRepository(db)
    
    def get_yoy_growth_trends(self) -> AnalyticsResponse:
        """
        Get year-over-year growth and moving averages
        
        Returns:
            YoY growth trends response
        """
        logger.info("Calculating YoY growth trends")
        data = self.repository.get_yoy_growth_and_moving_avg()
        return self.format_response(
            data,
            "YoY growth analysis completed"
        )
    
    def get_day_of_week_patterns(self) -> AnalyticsResponse:
        """
        Get sales patterns by day of week
        
        Returns:
            Day of week sales patterns response
        """
        logger.info("Analyzing sales patterns by day of week")
        data = self.repository.get_day_of_week_sales()
        return self.format_response(
            data,
            "Day of week sales analysis completed"
        )
    
    def get_discount_impact(self, limit: int = 20) -> AnalyticsResponse:
        """
        Get discount impact on profitability
        
        Args:
            limit: Number of orders to analyze
            
        Returns:
            Discount impact analysis response
        """
        logger.info(f"Analyzing discount impact (top {limit} orders)")
        data = self.repository.get_discount_impact_analysis(limit)
        return self.format_response(
            data,
            "Discount impact analysis completed"
        )
    
    def get_territory_performance(self) -> AnalyticsResponse:
        """
        Get territory and region sales performance
        
        Returns:
            Territory sales analysis response
        """
        logger.info("Analyzing territory sales performance")
        data = self.repository.get_territory_sales_analysis()
        return self.format_response(
            data,
            "Territory sales analysis completed"
        )
    
    def get_business_kpis(self) -> AnalyticsResponse:
        """
        Get comprehensive business KPI dashboard
        
        Returns:
            Business KPI dashboard response
        """
        logger.info("Generating business KPI dashboard")
        data = self.repository.get_business_kpi_dashboard()
        return self.format_response(
            data,
            "Business KPI dashboard generated"
        )


class AnalyticsServiceFactory:
    """
    Factory class for creating analytics services
    Following Factory Pattern and Dependency Injection
    """
    
    @staticmethod
    def create_product_service(db: DatabaseManager) -> ProductAnalyticsService:
        """Create product analytics service"""
        return ProductAnalyticsService(db)
    
    @staticmethod
    def create_employee_service(db: DatabaseManager) -> EmployeeAnalyticsService:
        """Create employee analytics service"""
        return EmployeeAnalyticsService(db)
    
    @staticmethod
    def create_customer_service(db: DatabaseManager) -> CustomerAnalyticsService:
        """Create customer analytics service"""
        return CustomerAnalyticsService(db)
    
    @staticmethod
    def create_category_service(db: DatabaseManager) -> CategoryAnalyticsService:
        """Create category analytics service"""
        return CategoryAnalyticsService(db)
    
    @staticmethod
    def create_supplier_service(db: DatabaseManager) -> SupplierAnalyticsService:
        """Create supplier analytics service"""
        return SupplierAnalyticsService(db)
    
    @staticmethod
    def create_shipping_service(db: DatabaseManager) -> ShippingAnalyticsService:
        """Create shipping analytics service"""
        return ShippingAnalyticsService(db)
    
    @staticmethod
    def create_sales_service(db: DatabaseManager) -> SalesAnalyticsService:
        """Create sales analytics service"""
        return SalesAnalyticsService(db)
