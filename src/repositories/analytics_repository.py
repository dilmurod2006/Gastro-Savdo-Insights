"""
Analytics Repository - Database access layer
Following Repository Pattern and Dependency Inversion Principle
All database queries are encapsulated here
"""
from typing import List, Dict, Any, Optional
from src.config.database import DatabaseManager
from src.utils.exceptions import DatabaseException
import logging

logger = logging.getLogger(__name__)


class BaseAnalyticsRepository:
    """
    Base repository class following Single Responsibility Principle
    Provides common database operations
    """
    
    def __init__(self, db: DatabaseManager):
        self.db = db
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """
        Execute a SQL query and return results as list of dictionaries
        
        Args:
            query: SQL query string
            params: Optional query parameters as tuple
            
        Returns:
            List of dictionaries representing query results
            
        Raises:
            DatabaseException: If query execution fails
        """
        try:
            result = self.db.execute_query(query, params)
            return result if result else []
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}")
            raise DatabaseException(f"Database query failed: {str(e)}")


class ProductAnalyticsRepository(BaseAnalyticsRepository):
    """Repository for product-related analytics queries"""
    
    def get_top_revenue_products(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Query 1: Get top revenue generating products
        
        Args:
            limit: Number of top products to return
            
        Returns:
            List of top revenue products
        """
        query = """
            SELECT 
                p.productId as product_id,
                p.productName as product_name,
                SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
                SUM(od.quantity) AS total_quantity_sold,
                COUNT(DISTINCT od.orderId) AS total_orders
            FROM Product p
            INNER JOIN OrderDetail od ON p.productId = od.productId
            GROUP BY p.productId, p.productName
            ORDER BY total_revenue DESC
            LIMIT %s
        """
        return self.execute_query(query, (limit,))
    
    def get_abc_analysis(self) -> List[Dict[str, Any]]:
        """
        Query 16: ABC Analysis - Product classification by revenue
        
        Returns:
            List of products with ABC classification
        """
        query = """
            WITH ProductRevenue AS (
                SELECT 
                    p.productId as product_id,
                    p.productName as product_name,
                    cat.categoryName as category_name,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue
                FROM Product p
                INNER JOIN Category cat ON p.categoryId = cat.categoryId
                INNER JOIN OrderDetail od ON p.productId = od.productId
                GROUP BY p.productId, p.productName, cat.categoryName
            ),
            RevenueRanked AS (
                SELECT 
                    *,
                    SUM(total_revenue) OVER (ORDER BY total_revenue DESC) AS cumulative_revenue,
                    SUM(total_revenue) OVER () AS grand_total_revenue,
                    ROW_NUMBER() OVER (ORDER BY total_revenue DESC) AS revenue_rank
                FROM ProductRevenue
            )
            SELECT 
                product_id,
                product_name,
                category_name,
                ROUND(total_revenue, 2) AS total_revenue,
                revenue_rank,
                ROUND(cumulative_revenue, 2) AS cumulative_revenue,
                ROUND(cumulative_revenue * 100.0 / grand_total_revenue, 2) AS cumulative_percent,
                CASE 
                    WHEN cumulative_revenue * 100.0 / grand_total_revenue <= 70 THEN 'A (Top 70%)'
                    WHEN cumulative_revenue * 100.0 / grand_total_revenue <= 90 THEN 'B (Next 20%)'
                    ELSE 'C (Bottom 10%)'
                END AS abc_category
            FROM RevenueRanked
            ORDER BY revenue_rank
        """
        return self.execute_query(query)
    
    def get_discontinued_products_analysis(self) -> List[Dict[str, Any]]:
        """
        Query 12: Discontinued products impact analysis
        
        Returns:
            Analysis of active vs discontinued products
        """
        query = """
            WITH ProductAnalysis AS (
                SELECT 
                    p.productId,
                    p.productName,
                    p.discontinued,
                    CASE WHEN p.discontinued = '1' THEN 'Discontinued' ELSE 'Active' END AS product_status,
                    cat.categoryName,
                    s.companyName AS supplierName,
                    COUNT(DISTINCT od.orderId) AS order_count,
                    SUM(od.quantity) AS total_quantity_sold,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
                    AVG(od.discount) AS avg_discount,
                    MAX(so.orderDate) AS last_order_date
                FROM Product p
                INNER JOIN Category cat ON p.categoryId = cat.categoryId
                INNER JOIN Supplier s ON p.supplierId = s.supplierId
                LEFT JOIN OrderDetail od ON p.productId = od.productId
                LEFT JOIN SalesOrder so ON od.orderId = so.orderId
                GROUP BY p.productId, p.productName, p.discontinued, cat.categoryName, s.companyName
            )
            SELECT 
                product_status,
                COUNT(*) AS product_count,
                SUM(order_count) AS total_orders,
                SUM(total_quantity_sold) AS total_units_sold,
                SUM(total_revenue) AS total_revenue,
                AVG(total_revenue) AS avg_revenue_per_product,
                AVG(avg_discount) AS avg_discount_given
            FROM ProductAnalysis
            GROUP BY product_status

            UNION ALL

            SELECT 
                'GRAND TOTAL' AS product_status,
                COUNT(*) AS product_count,
                SUM(order_count) AS total_orders,
                SUM(total_quantity_sold) AS total_units_sold,
                SUM(total_revenue) AS total_revenue,
                AVG(total_revenue) AS avg_revenue_per_product,
                AVG(avg_discount) AS avg_discount_given
            FROM ProductAnalysis
        """
        return self.execute_query(query)
    
    def get_market_basket_analysis(self, min_occurrences: int = 10, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Query 7: Market Basket Analysis - Products bought together
        
        Args:
            min_occurrences: Minimum times products should be bought together
            limit: Number of product pairs to return
            
        Returns:
            Product pairs frequently bought together
        """
        # Using dynamic SQL due to MySQL limitations with parameterized HAVING
        query = f"""
            WITH ProductPairs AS (
                SELECT 
                    od1.productId AS product1,
                    od2.productId AS product2,
                    COUNT(DISTINCT od1.orderId) AS times_bought_together
                FROM OrderDetail od1
                INNER JOIN OrderDetail od2 ON od1.orderId = od2.orderId 
                    AND od1.productId < od2.productId
                GROUP BY od1.productId, od2.productId
                HAVING COUNT(DISTINCT od1.orderId) >= {int(min_occurrences)}
            )
            SELECT 
                p1.productName AS product_name1,
                p2.productName AS product_name2,
                pp.times_bought_together,
                ROUND(pp.times_bought_together * 100.0 / 
                    (SELECT COUNT(DISTINCT orderId) FROM SalesOrder), 2) AS support_percent
            FROM ProductPairs pp
            INNER JOIN Product p1 ON pp.product1 = p1.productId
            INNER JOIN Product p2 ON pp.product2 = p2.productId
            ORDER BY times_bought_together DESC
            LIMIT {int(limit)}
        """
        return self.execute_query(query)


class EmployeeAnalyticsRepository(BaseAnalyticsRepository):
    """Repository for employee-related analytics queries"""
    
    def get_employee_monthly_sales(self) -> List[Dict[str, Any]]:
        """
        Query 2: Employee monthly sales performance
        
        Returns:
            Monthly sales data for each employee
        """
        query = """
            SELECT 
                e.employeeId as employee_id,
                CONCAT(e.firstname, ' ', e.lastname) AS employee_name,
                e.title,
                YEAR(so.orderDate) AS order_year,
                MONTH(so.orderDate) AS order_month,
                COUNT(DISTINCT so.orderId) AS total_orders,
                SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS monthly_revenue,
                AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value
            FROM Employee e
            INNER JOIN SalesOrder so ON e.employeeId = so.employeeId
            INNER JOIN OrderDetail od ON so.orderId = od.orderId
            GROUP BY e.employeeId, e.firstname, e.lastname, e.title, 
                     YEAR(so.orderDate), MONTH(so.orderDate)
            ORDER BY e.employeeId, order_year, order_month
        """
        return self.execute_query(query)
    
    def get_employee_hierarchy(self) -> List[Dict[str, Any]]:
        """
        Query 8: Employee hierarchy with team sales
        
        Returns:
            Employee hierarchy with sales performance
        """
        query = """
            WITH RECURSIVE EmployeeHierarchy AS (
                SELECT 
                    employeeId as employee_id,
                    CONCAT(firstname, ' ', lastname) AS employee_name,
                    title,
                    mgrId as mgr_id,
                    1 AS level,
                    CAST(CONCAT(firstname, ' ', lastname) AS CHAR(500)) AS hierarchy_path
                FROM Employee
                WHERE mgrId IS NULL
                
                UNION ALL
                
                SELECT 
                    e.employeeId,
                    CONCAT(e.firstname, ' ', e.lastname),
                    e.title,
                    e.mgrId,
                    eh.level + 1,
                    CONCAT(eh.hierarchy_path, ' -> ', e.firstname, ' ', e.lastname)
                FROM Employee e
                INNER JOIN EmployeeHierarchy eh ON e.mgrId = eh.employee_id
            )
            SELECT 
                eh.employee_id,
                eh.employee_name,
                eh.title,
                eh.level,
                eh.hierarchy_path,
                COUNT(DISTINCT so.orderId) AS total_orders,
                COALESCE(SUM(od.unitPrice * od.quantity * (1 - od.discount)), 0) AS total_revenue
            FROM EmployeeHierarchy eh
            LEFT JOIN SalesOrder so ON eh.employee_id = so.employeeId
            LEFT JOIN OrderDetail od ON so.orderId = od.orderId
            GROUP BY eh.employee_id, eh.employee_name, eh.title, eh.level, eh.hierarchy_path
            ORDER BY eh.level, total_revenue DESC
        """
        return self.execute_query(query)


class CustomerAnalyticsRepository(BaseAnalyticsRepository):
    """Repository for customer-related analytics queries"""
    
    def get_top_customer_by_country(self) -> List[Dict[str, Any]]:
        """
        Query 3: Top customer per country with running total
        
        Returns:
            Best customer in each country with analytics
        """
        query = """
            WITH CustomerRevenue AS (
                SELECT 
                    c.custId as cust_id,
                    c.companyName as company_name,
                    c.country,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_spent,
                    COUNT(DISTINCT so.orderId) AS order_count
                FROM Customer c
                INNER JOIN SalesOrder so ON c.custId = so.custId
                INNER JOIN OrderDetail od ON so.orderId = od.orderId
                GROUP BY c.custId, c.companyName, c.country
            ),
            RankedCustomers AS (
                SELECT 
                    *,
                    RANK() OVER (PARTITION BY country ORDER BY total_spent DESC) AS country_rank,
                    SUM(total_spent) OVER (PARTITION BY country ORDER BY total_spent DESC) AS running_total
                FROM CustomerRevenue
            )
            SELECT 
                country,
                company_name,
                total_spent,
                order_count,
                running_total,
                ROUND(total_spent * 100.0 / SUM(total_spent) OVER (PARTITION BY country), 2) AS percent_of_country
            FROM RankedCustomers
            WHERE country_rank = 1
            ORDER BY total_spent DESC
        """
        return self.execute_query(query)
    
    def get_rfm_analysis(self, reference_date: str = '2008-05-06') -> List[Dict[str, Any]]:
        """
        Query 5: RFM (Recency, Frequency, Monetary) customer segmentation
        
        Args:
            reference_date: Reference date for recency calculation
            
        Returns:
            RFM analysis with customer segments
        """
        # Escape reference_date for SQL safety
        safe_date = str(reference_date).replace("'", "''")
        query = f"""
            WITH CustomerMetrics AS (
                SELECT 
                    c.custId as cust_id,
                    c.companyName as company_name,
                    DATEDIFF('{safe_date}', MAX(so.orderDate)) AS recency,
                    COUNT(DISTINCT so.orderId) AS frequency,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS monetary
                FROM Customer c
                INNER JOIN SalesOrder so ON c.custId = so.custId
                INNER JOIN OrderDetail od ON so.orderId = od.orderId
                GROUP BY c.custId, c.companyName
            ),
            RFMScores AS (
                SELECT 
                    *,
                    NTILE(5) OVER (ORDER BY recency DESC) AS r_score,
                    NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
                    NTILE(5) OVER (ORDER BY monetary ASC) AS m_score
                FROM CustomerMetrics
            )
            SELECT 
                cust_id,
                company_name,
                recency,
                frequency,
                monetary,
                r_score,
                f_score,
                m_score,
                CONCAT(r_score, f_score, m_score) AS rfm_segment,
                CASE 
                    WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
                    WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
                    WHEN r_score >= 4 AND f_score <= 2 THEN 'New Customers'
                    WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
                    WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost'
                    ELSE 'Regular'
                END AS customer_segment
            FROM RFMScores
            ORDER BY monetary DESC
        """
        return self.execute_query(query)
    
    def get_customer_retention_analysis(self) -> List[Dict[str, Any]]:
        """
        Query 13: Customer retention and reorder analysis
        
        Returns:
            Customer retention metrics
        """
        query = """
            WITH CustomerOrders AS (
                SELECT 
                    c.custId as cust_id,
                    c.companyName as company_name,
                    c.country,
                    so.orderId as order_id,
                    so.orderDate as order_date,
                    ROW_NUMBER() OVER (PARTITION BY c.custId ORDER BY so.orderDate) AS order_sequence,
                    LAG(so.orderDate) OVER (PARTITION BY c.custId ORDER BY so.orderDate) AS prev_order_date
                FROM Customer c
                INNER JOIN SalesOrder so ON c.custId = so.custId
            )
            SELECT 
                cust_id,
                company_name,
                country,
                COUNT(order_id) AS total_orders,
                MIN(order_date) AS first_order_date,
                MAX(order_date) AS last_order_date,
                DATEDIFF(MAX(order_date), MIN(order_date)) AS customer_lifespan_days,
                AVG(DATEDIFF(order_date, prev_order_date)) AS avg_days_between_orders,
                CASE 
                    WHEN COUNT(order_id) = 1 THEN 'One-Time Buyer'
                    WHEN AVG(DATEDIFF(order_date, prev_order_date)) <= 30 THEN 'Frequent Buyer'
                    WHEN AVG(DATEDIFF(order_date, prev_order_date)) <= 90 THEN 'Regular Buyer'
                    ELSE 'Occasional Buyer'
                END AS buyer_type
            FROM CustomerOrders
            GROUP BY cust_id, company_name, country
            HAVING COUNT(order_id) >= 1
            ORDER BY total_orders DESC
        """
        return self.execute_query(query)
    
    def get_customer_discount_behavior(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Query 18: Customer discount usage patterns
        
        Args:
            limit: Number of customers to return
            
        Returns:
            Customer discount behavior analysis
        """
        query = """
            WITH CustomerDiscountBehavior AS (
                SELECT 
                    c.custId as cust_id,
                    c.companyName as company_name,
                    c.country,
                    COUNT(DISTINCT so.orderId) AS total_orders,
                    SUM(od.unitPrice * od.quantity) AS gross_purchases,
                    SUM(od.unitPrice * od.quantity * od.discount) AS total_discount_received,
                    AVG(od.discount) AS avg_discount_rate,
                    SUM(CASE WHEN od.discount > 0 THEN 1 ELSE 0 END) AS discounted_line_items,
                    COUNT(od.orderDetailId) AS total_line_items
                FROM Customer c
                INNER JOIN SalesOrder so ON c.custId = so.custId
                INNER JOIN OrderDetail od ON so.orderId = od.orderId
                GROUP BY c.custId, c.companyName, c.country
            )
            SELECT 
                cust_id,
                company_name,
                country,
                total_orders,
                ROUND(gross_purchases, 2) AS gross_purchases,
                ROUND(total_discount_received, 2) AS total_discount_received,
                ROUND(avg_discount_rate * 100, 2) AS avg_discount_percent,
                discounted_line_items,
                total_line_items,
                ROUND(discounted_line_items * 100.0 / NULLIF(total_line_items, 0), 2) AS discounted_items_percent,
                ROUND(total_discount_received * 100.0 / NULLIF(gross_purchases, 0), 2) AS overall_discount_impact,
                CASE 
                    WHEN avg_discount_rate >= 0.15 THEN 'Discount Hunter'
                    WHEN avg_discount_rate >= 0.05 THEN 'Discount Aware'
                    ELSE 'Full Price Buyer'
                END AS discount_behavior
            FROM CustomerDiscountBehavior
            ORDER BY total_discount_received DESC
            LIMIT %s
        """
        return self.execute_query(query, (limit,))


class CategoryAnalyticsRepository(BaseAnalyticsRepository):
    """Repository for category-related analytics queries"""
    
    def get_category_monthly_growth(self) -> List[Dict[str, Any]]:
        """
        Query 4: Category month-over-month growth
        
        Returns:
            MoM growth for each category
        """
        query = """
            WITH MonthlyCategorySales AS (
                SELECT 
                    c.categoryId,
                    c.categoryName as category_name,
                    DATE_FORMAT(so.orderDate, '%Y-%m') AS sales_month,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS monthly_revenue
                FROM Category c
                INNER JOIN Product p ON c.categoryId = p.categoryId
                INNER JOIN OrderDetail od ON p.productId = od.productId
                INNER JOIN SalesOrder so ON od.orderId = so.orderId
                GROUP BY c.categoryId, c.categoryName, DATE_FORMAT(so.orderDate, '%Y-%m')
            )
            SELECT 
                category_name,
                sales_month,
                monthly_revenue,
                LAG(monthly_revenue) OVER (PARTITION BY categoryId ORDER BY sales_month) AS prev_month_revenue,
                ROUND(
                    (monthly_revenue - LAG(monthly_revenue) OVER (PARTITION BY categoryId ORDER BY sales_month)) 
                    / NULLIF(LAG(monthly_revenue) OVER (PARTITION BY categoryId ORDER BY sales_month), 0) * 100, 2
                ) AS mom_growth_percent
            FROM MonthlyCategorySales
            ORDER BY category_name, sales_month
        """
        return self.execute_query(query)
    
    def get_country_category_pivot(self) -> List[Dict[str, Any]]:
        """
        Query 10: Sales by country and category (pivot table)
        
        Returns:
            Pivot table of country vs category sales
        """
        query = """
            SELECT 
                c.country,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Beverages' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS beverages,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Condiments' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS condiments,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Confections' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS confections,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Dairy Products' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS dairy_products,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Grains/Cereals' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS grains_cereals,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Meat/Poultry' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS meat_poultry,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Produce' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS produce,
                ROUND(SUM(CASE WHEN cat.categoryName = 'Seafood' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS seafood,
                ROUND(SUM(od.unitPrice * od.quantity * (1 - od.discount)), 2) AS total_revenue
            FROM Customer c
            INNER JOIN SalesOrder so ON c.custId = so.custId
            INNER JOIN OrderDetail od ON so.orderId = od.orderId
            INNER JOIN Product p ON od.productId = p.productId
            INNER JOIN Category cat ON p.categoryId = cat.categoryId
            GROUP BY c.country
            ORDER BY total_revenue DESC
        """
        return self.execute_query(query)


class SupplierAnalyticsRepository(BaseAnalyticsRepository):
    """Repository for supplier-related analytics queries"""
    
    def get_supplier_performance(self, min_orders: int = 10) -> List[Dict[str, Any]]:
        """
        Query 6: Supplier performance and lead time analysis
        
        Args:
            min_orders: Minimum orders for inclusion
            
        Returns:
            Supplier performance metrics
        """
        query = """
            SELECT 
                s.supplierId as supplier_id,
                s.companyName AS supplier_name,
                s.country,
                COUNT(DISTINCT so.orderId) AS total_orders,
                AVG(DATEDIFF(so.shippedDate, so.orderDate)) AS avg_lead_time_days,
                MIN(DATEDIFF(so.shippedDate, so.orderDate)) AS min_lead_time,
                MAX(DATEDIFF(so.shippedDate, so.orderDate)) AS max_lead_time,
                SUM(CASE WHEN so.shippedDate > so.requiredDate THEN 1 ELSE 0 END) AS late_shipments,
                ROUND(
                    SUM(CASE WHEN so.shippedDate > so.requiredDate THEN 1 ELSE 0 END) * 100.0 
                    / COUNT(DISTINCT so.orderId), 2
                ) AS late_shipment_percent,
                SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue
            FROM Supplier s
            INNER JOIN Product p ON s.supplierId = p.supplierId
            INNER JOIN OrderDetail od ON p.productId = od.productId
            INNER JOIN SalesOrder so ON od.orderId = so.orderId
            WHERE so.shippedDate IS NOT NULL
            GROUP BY s.supplierId, s.companyName, s.country
            HAVING COUNT(DISTINCT so.orderId) >= %s
            ORDER BY avg_lead_time_days ASC
        """
        return self.execute_query(query, (min_orders,))
    
    def get_supplier_risk_analysis(self) -> List[Dict[str, Any]]:
        """
        Query 19: Supplier diversification and risk analysis
        
        Returns:
            Supplier risk assessment by category
        """
        query = """
            WITH SupplierDependency AS (
                SELECT 
                    cat.categoryId,
                    cat.categoryName as category_name,
                    s.supplierId,
                    s.companyName AS supplier_name,
                    s.country AS supplier_country,
                    COUNT(DISTINCT p.productId) AS product_count,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS supplier_revenue
                FROM Category cat
                INNER JOIN Product p ON cat.categoryId = p.categoryId
                INNER JOIN Supplier s ON p.supplierId = s.supplierId
                INNER JOIN OrderDetail od ON p.productId = od.productId
                GROUP BY cat.categoryId, cat.categoryName, s.supplierId, s.companyName, s.country
            ),
            CategoryTotals AS (
                SELECT 
                    categoryId,
                    SUM(supplier_revenue) AS category_total_revenue,
                    COUNT(DISTINCT supplierId) AS supplier_count
                FROM SupplierDependency
                GROUP BY categoryId
            )
            SELECT 
                sd.category_name,
                sd.supplier_name,
                sd.supplier_country,
                sd.product_count,
                ROUND(sd.supplier_revenue, 2) AS supplier_revenue,
                ROUND(ct.category_total_revenue, 2) AS category_total_revenue,
                ROUND(sd.supplier_revenue * 100.0 / ct.category_total_revenue, 2) AS revenue_share_percent,
                ct.supplier_count AS total_suppliers_in_category,
                CASE 
                    WHEN sd.supplier_revenue * 100.0 / ct.category_total_revenue > 50 THEN 'HIGH RISK - Single Supplier Dependency'
                    WHEN sd.supplier_revenue * 100.0 / ct.category_total_revenue > 25 THEN 'MEDIUM RISK - Significant Dependency'
                    ELSE 'LOW RISK - Diversified'
                END AS risk_assessment
            FROM SupplierDependency sd
            INNER JOIN CategoryTotals ct ON sd.categoryId = ct.categoryId
            ORDER BY sd.category_name, revenue_share_percent DESC
        """
        return self.execute_query(query)


class ShippingAnalyticsRepository(BaseAnalyticsRepository):
    """Repository for shipping and logistics analytics"""
    
    def get_shipper_efficiency(self) -> List[Dict[str, Any]]:
        """
        Query 9: Shipper performance and cost analysis
        
        Returns:
            Shipper efficiency metrics
        """
        query = """
            SELECT 
                sh.shipperId as shipper_id,
                sh.companyName AS shipper_name,
                COUNT(DISTINCT so.orderId) AS total_shipments,
                SUM(so.freight) AS total_freight_cost,
                AVG(so.freight) AS avg_freight_cost,
                STDDEV(so.freight) AS freight_std_dev,
                MIN(so.freight) AS min_freight,
                MAX(so.freight) AS max_freight,
                AVG(DATEDIFF(so.shippedDate, so.orderDate)) AS avg_shipping_days,
                SUM(CASE WHEN so.shippedDate <= so.requiredDate THEN 1 ELSE 0 END) AS on_time_deliveries,
                ROUND(
                    SUM(CASE WHEN so.shippedDate <= so.requiredDate THEN 1 ELSE 0 END) * 100.0 
                    / COUNT(DISTINCT so.orderId), 2
                ) AS on_time_delivery_rate,
                SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_order_value,
                ROUND(SUM(so.freight) * 100.0 / SUM(od.unitPrice * od.quantity * (1 - od.discount)), 2) AS freight_to_value_ratio
            FROM Shipper sh
            INNER JOIN SalesOrder so ON sh.shipperId = so.shipperid
            INNER JOIN OrderDetail od ON so.orderId = od.orderId
            WHERE so.shippedDate IS NOT NULL
            GROUP BY sh.shipperId, sh.companyName
            ORDER BY total_shipments DESC
        """
        return self.execute_query(query)


class SalesAnalyticsRepository(BaseAnalyticsRepository):
    """Repository for general sales analytics"""
    
    def get_yoy_growth_and_moving_avg(self) -> List[Dict[str, Any]]:
        """
        Query 11: Year-over-year growth and 3-month moving average
        
        Returns:
            YoY growth trends with moving averages
        """
        query = """
            WITH MonthlyRevenue AS (
                SELECT 
                    DATE_FORMAT(so.orderDate, '%Y-%m') AS sales_month,
                    YEAR(so.orderDate) AS sales_year,
                    MONTH(so.orderDate) AS month_num,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS revenue
                FROM SalesOrder so
                INNER JOIN OrderDetail od ON so.orderId = od.orderId
                GROUP BY DATE_FORMAT(so.orderDate, '%Y-%m'), YEAR(so.orderDate), MONTH(so.orderDate)
            )
            SELECT 
                sales_month,
                revenue,
                LAG(revenue, 12) OVER (ORDER BY sales_month) AS prev_year_revenue,
                ROUND(
                    (revenue - LAG(revenue, 12) OVER (ORDER BY sales_month)) 
                    / NULLIF(LAG(revenue, 12) OVER (ORDER BY sales_month), 0) * 100, 2
                ) AS yoy_growth_percent,
                ROUND(AVG(revenue) OVER (ORDER BY sales_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3month,
                SUM(revenue) OVER (PARTITION BY sales_year ORDER BY month_num) AS ytd_revenue
            FROM MonthlyRevenue
            ORDER BY sales_month
        """
        return self.execute_query(query)
    
    def get_day_of_week_sales(self) -> List[Dict[str, Any]]:
        """
        Query 17: Sales patterns by day of week
        
        Returns:
            Day of week sales analysis
        """
        query = """
            SELECT 
                DAYOFWEEK(so.orderDate) AS day_of_week,
                DAYNAME(so.orderDate) AS day_name,
                COUNT(DISTINCT so.orderId) AS total_orders,
                COUNT(DISTINCT so.custId) AS unique_customers,
                SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
                AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value,
                ROUND(
                    COUNT(DISTINCT so.orderId) * 100.0 / (SELECT COUNT(DISTINCT orderId) FROM SalesOrder), 2
                ) AS order_percentage,
                RANK() OVER (ORDER BY SUM(od.unitPrice * od.quantity * (1 - od.discount)) DESC) AS revenue_rank
            FROM SalesOrder so
            INNER JOIN OrderDetail od ON so.orderId = od.orderId
            GROUP BY DAYOFWEEK(so.orderDate), DAYNAME(so.orderDate)
            ORDER BY day_of_week
        """
        return self.execute_query(query)
    
    def get_discount_impact_analysis(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Query 15: Discount impact and profitability analysis
        
        Args:
            limit: Number of orders to return
            
        Returns:
            Discount impact on orders
        """
        query = """
            WITH OrderDiscountAnalysis AS (
                SELECT 
                    so.orderId as order_id,
                    so.orderDate as order_date,
                    c.companyName AS customer_name,
                    e.firstname AS employee_name,
                    SUM(od.unitPrice * od.quantity) AS gross_amount,
                    SUM(od.unitPrice * od.quantity * od.discount) AS total_discount,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS net_amount,
                    AVG(od.discount) * 100 AS avg_discount_percent,
                    MAX(od.discount) * 100 AS max_discount_percent,
                    COUNT(od.orderDetailId) AS line_items
                FROM SalesOrder so
                INNER JOIN OrderDetail od ON so.orderId = od.orderId
                INNER JOIN Customer c ON so.custId = c.custId
                INNER JOIN Employee e ON so.employeeId = e.employeeId
                GROUP BY so.orderId, so.orderDate, c.companyName, e.firstname
            )
            SELECT 
                order_id,
                order_date,
                customer_name,
                employee_name,
                gross_amount,
                total_discount,
                net_amount,
                ROUND(avg_discount_percent, 2) AS avg_discount_percent,
                ROUND(max_discount_percent, 2) AS max_discount_percent,
                line_items,
                ROUND(total_discount * 100.0 / NULLIF(gross_amount, 0), 2) AS discount_impact_percent,
                CASE 
                    WHEN avg_discount_percent >= 15 THEN 'High Discount'
                    WHEN avg_discount_percent >= 5 THEN 'Medium Discount'
                    ELSE 'Low/No Discount'
                END AS discount_category
            FROM OrderDiscountAnalysis
            WHERE total_discount > 0
            ORDER BY total_discount DESC
            LIMIT %s
        """
        return self.execute_query(query, (limit,))
    
    def get_territory_sales_analysis(self) -> List[Dict[str, Any]]:
        """
        Query 14: Territory and region sales analysis
        
        Returns:
            Sales performance by territory and region
        """
        query = """
            SELECT 
                r.regionId as region_id,
                r.regiondescription AS region_name,
                t.territoryId as territory_id,
                t.territorydescription AS territory_name,
                e.employeeId as employee_id,
                CONCAT(e.firstname, ' ', e.lastname) AS employee_name,
                COUNT(DISTINCT so.orderId) AS total_orders,
                COUNT(DISTINCT so.custId) AS unique_customers,
                SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
                AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value,
                RANK() OVER (PARTITION BY r.regionId ORDER BY SUM(od.unitPrice * od.quantity * (1 - od.discount)) DESC) AS territory_rank_in_region
            FROM Region r
            INNER JOIN Territory t ON r.regionId = t.regionId
            INNER JOIN EmployeeTerritory et ON t.territoryId = et.territoryId
            INNER JOIN Employee e ON et.employeeId = e.employeeId
            INNER JOIN SalesOrder so ON e.employeeId = so.employeeId
            INNER JOIN OrderDetail od ON so.orderId = od.orderId
            GROUP BY r.regionId, r.regiondescription, t.territoryId, t.territorydescription, e.employeeId, e.firstname, e.lastname
            ORDER BY r.regionId, total_revenue DESC
        """
        return self.execute_query(query)
    
    def get_business_kpi_dashboard(self) -> List[Dict[str, Any]]:
        """
        Query 20: Comprehensive business KPI dashboard
        
        Returns:
            Complete business KPIs
        """
        query = """
            WITH 
            SalesMetrics AS (
                SELECT 
                    COUNT(DISTINCT so.orderId) AS total_orders,
                    COUNT(DISTINCT so.custId) AS unique_customers,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
                    SUM(so.freight) AS total_freight,
                    AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value
                FROM SalesOrder so
                INNER JOIN OrderDetail od ON so.orderId = od.orderId
            ),
            ProductMetrics AS (
                SELECT 
                    COUNT(DISTINCT productId) AS total_products,
                    SUM(CASE WHEN discontinued = '1' THEN 1 ELSE 0 END) AS discontinued_products,
                    COUNT(DISTINCT categoryId) AS total_categories,
                    COUNT(DISTINCT supplierId) AS total_suppliers
                FROM Product
            ),
            EmployeePerformance AS (
                SELECT 
                    AVG(order_count) AS avg_orders_per_employee,
                    MAX(order_count) AS max_orders_per_employee,
                    MIN(order_count) AS min_orders_per_employee
                FROM (
                    SELECT employeeId, COUNT(orderId) AS order_count 
                    FROM SalesOrder 
                    GROUP BY employeeId
                ) emp
            ),
            ShippingMetrics AS (
                SELECT 
                    AVG(DATEDIFF(shippedDate, orderDate)) AS avg_shipping_days,
                    SUM(CASE WHEN shippedDate <= requiredDate THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS on_time_rate
                FROM SalesOrder
                WHERE shippedDate IS NOT NULL
            ),
            MonthlyTrend AS (
                SELECT 
                    DATE_FORMAT(so.orderDate, '%Y-%m') AS month,
                    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS revenue
                FROM SalesOrder so
                INNER JOIN OrderDetail od ON so.orderId = od.orderId
                GROUP BY DATE_FORMAT(so.orderDate, '%Y-%m')
                ORDER BY month DESC
                LIMIT 1
            )
            SELECT 
                '=== SOTUV KORSATKICHLARI ===' AS section,
                sm.total_orders AS jami_buyurtmalar,
                sm.unique_customers AS faol_mijozlar,
                ROUND(sm.total_revenue, 2) AS jami_daromad,
                ROUND(sm.total_freight, 2) AS jami_yuk_xarajati,
                ROUND(sm.avg_order_value, 2) AS ortacha_buyurtma_qiymati,
                
                '=== MAHSULOT KORSATKICHLARI ===' AS section2,
                pm.total_products AS jami_mahsulotlar,
                pm.discontinued_products AS toxtatilgan_mahsulotlar,
                pm.total_categories AS kategoriyalar_soni,
                pm.total_suppliers AS yetkazib_beruvchilar_soni,
                
                '=== XODIM SAMARADORLIGI ===' AS section3,
                ROUND(ep.avg_orders_per_employee, 0) AS ortacha_buyurtma_per_xodim,
                ep.max_orders_per_employee AS eng_kop_buyurtma_xodim,
                ep.min_orders_per_employee AS eng_kam_buyurtma_xodim,
                
                '=== YETKAZIB BERISH ===' AS section4,
                ROUND(shm.avg_shipping_days, 1) AS ortacha_yetkazish_kunlari,
                ROUND(shm.on_time_rate, 2) AS vaqtida_yetkazish_foizi,
                
                '=== OXIRGI OY ===' AS section5,
                mt.month AS oxirgi_oy,
                ROUND(mt.revenue, 2) AS oxirgi_oy_daromadi
                
            FROM SalesMetrics sm, ProductMetrics pm, EmployeePerformance ep, ShippingMetrics shm, MonthlyTrend mt
        """
        return self.execute_query(query)
