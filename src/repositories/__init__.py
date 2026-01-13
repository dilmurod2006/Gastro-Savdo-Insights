"""
Analytics Repositories Package
Provides database access layer for analytics queries
"""
from src.repositories.analytics_repository import (
    BaseAnalyticsRepository,
    ProductAnalyticsRepository,
    EmployeeAnalyticsRepository,
    CustomerAnalyticsRepository,
    CategoryAnalyticsRepository,
    SupplierAnalyticsRepository,
    ShippingAnalyticsRepository,
    SalesAnalyticsRepository
)

__all__ = [
    "BaseAnalyticsRepository",
    "ProductAnalyticsRepository",
    "EmployeeAnalyticsRepository",
    "CustomerAnalyticsRepository",
    "CategoryAnalyticsRepository",
    "SupplierAnalyticsRepository",
    "ShippingAnalyticsRepository",
    "SalesAnalyticsRepository"
]
