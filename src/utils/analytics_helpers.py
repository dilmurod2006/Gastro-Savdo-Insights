"""
Analytics Utilities - Helper functions and classes
Following DRY (Don't Repeat Yourself) principle
Provides reusable functionality for analytics operations
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class DateHelper:
    """
    Helper class for date-related operations
    Follows Single Responsibility Principle
    """
    
    @staticmethod
    def format_date(date_obj: date, format_string: str = "%Y-%m-%d") -> str:
        """
        Format date object to string
        
        Args:
            date_obj: Date object to format
            format_string: Desired format string
            
        Returns:
            Formatted date string
        """
        if not date_obj:
            return None
        return date_obj.strftime(format_string)
    
    @staticmethod
    def parse_date(date_string: str, format_string: str = "%Y-%m-%d") -> date:
        """
        Parse date string to date object
        
        Args:
            date_string: Date string to parse
            format_string: Format of the input string
            
        Returns:
            Date object
        """
        if not date_string:
            return None
        return datetime.strptime(date_string, format_string).date()
    
    @staticmethod
    def get_month_name(month_number: int) -> str:
        """
        Get month name from number
        
        Args:
            month_number: Month number (1-12)
            
        Returns:
            Month name
        """
        months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        if 1 <= month_number <= 12:
            return months[month_number - 1]
        return "Unknown"
    
    @staticmethod
    def calculate_days_between(start_date: date, end_date: date) -> int:
        """
        Calculate days between two dates
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            Number of days between dates
        """
        if not start_date or not end_date:
            return 0
        return (end_date - start_date).days


class NumberFormatter:
    """
    Helper class for number formatting
    Provides consistent number formatting across the application
    """
    
    @staticmethod
    def format_currency(amount: Decimal, currency_symbol: str = "$") -> str:
        """
        Format decimal as currency
        
        Args:
            amount: Decimal amount
            currency_symbol: Currency symbol to use
            
        Returns:
            Formatted currency string
        """
        if amount is None:
            return f"{currency_symbol}0.00"
        return f"{currency_symbol}{amount:,.2f}"
    
    @staticmethod
    def format_percentage(value: Decimal, decimal_places: int = 2) -> str:
        """
        Format decimal as percentage
        
        Args:
            value: Decimal value
            decimal_places: Number of decimal places
            
        Returns:
            Formatted percentage string
        """
        if value is None:
            return "0.00%"
        return f"{value:.{decimal_places}f}%"
    
    @staticmethod
    def round_decimal(value: Decimal, decimal_places: int = 2) -> Decimal:
        """
        Round decimal to specified places
        
        Args:
            value: Decimal value
            decimal_places: Number of decimal places
            
        Returns:
            Rounded decimal
        """
        if value is None:
            return Decimal("0.00")
        return round(value, decimal_places)


class DataTransformer:
    """
    Helper class for data transformation
    Converts database results to various formats
    """
    
    @staticmethod
    def convert_decimal_to_float(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Convert Decimal values to float for JSON serialization
        
        Args:
            data: List of dictionaries with potential Decimal values
            
        Returns:
            Data with Decimals converted to floats
        """
        result = []
        for row in data:
            converted_row = {}
            for key, value in row.items():
                if isinstance(value, Decimal):
                    converted_row[key] = float(value)
                elif isinstance(value, date):
                    converted_row[key] = value.isoformat()
                else:
                    converted_row[key] = value
            result.append(converted_row)
        return result
    
    @staticmethod
    def flatten_nested_dict(nested_dict: Dict[str, Any], separator: str = "_") -> Dict[str, Any]:
        """
        Flatten nested dictionary
        
        Args:
            nested_dict: Dictionary with nested structure
            separator: Separator for flattened keys
            
        Returns:
            Flattened dictionary
        """
        flattened = {}
        
        def flatten(obj: Any, parent_key: str = ""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    new_key = f"{parent_key}{separator}{key}" if parent_key else key
                    flatten(value, new_key)
            else:
                flattened[parent_key] = obj
        
        flatten(nested_dict)
        return flattened
    
    @staticmethod
    def group_by_key(data: List[Dict[str, Any]], key: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Group list of dictionaries by a specific key
        
        Args:
            data: List of dictionaries
            key: Key to group by
            
        Returns:
            Dictionary with grouped data
        """
        grouped = {}
        for item in data:
            group_key = item.get(key)
            if group_key not in grouped:
                grouped[group_key] = []
            grouped[group_key].append(item)
        return grouped


class QueryBuilder:
    """
    Helper class for building dynamic SQL queries
    Provides safe query construction methods
    """
    
    @staticmethod
    def build_where_clause(filters: Dict[str, Any]) -> str:
        """
        Build WHERE clause from filters dictionary
        
        Args:
            filters: Dictionary of column: value pairs
            
        Returns:
            WHERE clause string
        """
        if not filters:
            return ""
        
        conditions = []
        for column, value in filters.items():
            if value is not None:
                if isinstance(value, str):
                    conditions.append(f"{column} = '{value}'")
                elif isinstance(value, (int, float, Decimal)):
                    conditions.append(f"{column} = {value}")
                elif isinstance(value, list):
                    values = ", ".join([f"'{v}'" if isinstance(v, str) else str(v) for v in value])
                    conditions.append(f"{column} IN ({values})")
        
        return f"WHERE {' AND '.join(conditions)}" if conditions else ""
    
    @staticmethod
    def build_order_by(sort_fields: List[tuple]) -> str:
        """
        Build ORDER BY clause
        
        Args:
            sort_fields: List of (column, direction) tuples
            
        Returns:
            ORDER BY clause string
        """
        if not sort_fields:
            return ""
        
        order_clauses = []
        for column, direction in sort_fields:
            direction = direction.upper() if direction else "ASC"
            if direction in ["ASC", "DESC"]:
                order_clauses.append(f"{column} {direction}")
        
        return f"ORDER BY {', '.join(order_clauses)}" if order_clauses else ""


class MetricsCalculator:
    """
    Helper class for calculating business metrics
    Provides reusable metric calculation methods
    """
    
    @staticmethod
    def calculate_growth_rate(current: Decimal, previous: Decimal) -> Optional[Decimal]:
        """
        Calculate growth rate percentage
        
        Args:
            current: Current period value
            previous: Previous period value
            
        Returns:
            Growth rate percentage
        """
        if not previous or previous == 0:
            return None
        return ((current - previous) / previous) * 100
    
    @staticmethod
    def calculate_average(values: List[Decimal]) -> Decimal:
        """
        Calculate average of values
        
        Args:
            values: List of decimal values
            
        Returns:
            Average value
        """
        if not values:
            return Decimal("0.00")
        return sum(values) / len(values)
    
    @staticmethod
    def calculate_variance(values: List[Decimal]) -> Decimal:
        """
        Calculate variance of values
        
        Args:
            values: List of decimal values
            
        Returns:
            Variance
        """
        if not values or len(values) < 2:
            return Decimal("0.00")
        
        mean = MetricsCalculator.calculate_average(values)
        squared_diffs = [(x - mean) ** 2 for x in values]
        return sum(squared_diffs) / len(values)
    
    @staticmethod
    def calculate_percentile(values: List[Decimal], percentile: int) -> Decimal:
        """
        Calculate percentile value
        
        Args:
            values: List of decimal values
            percentile: Percentile to calculate (0-100)
            
        Returns:
            Percentile value
        """
        if not values:
            return Decimal("0.00")
        
        sorted_values = sorted(values)
        index = int((percentile / 100) * (len(sorted_values) - 1))
        return sorted_values[index]
    
    @staticmethod
    def calculate_moving_average(values: List[Decimal], window_size: int) -> List[Decimal]:
        """
        Calculate moving average
        
        Args:
            values: List of decimal values
            window_size: Size of moving window
            
        Returns:
            List of moving average values
        """
        if not values or window_size <= 0:
            return []
        
        moving_averages = []
        for i in range(len(values)):
            start_index = max(0, i - window_size + 1)
            window = values[start_index:i + 1]
            moving_averages.append(MetricsCalculator.calculate_average(window))
        
        return moving_averages


class ValidationHelper:
    """
    Helper class for data validation
    Provides validation methods for analytics inputs
    """
    
    @staticmethod
    def validate_date_range(start_date: str, end_date: str) -> bool:
        """
        Validate date range
        
        Args:
            start_date: Start date string
            end_date: End date string
            
        Returns:
            True if valid, False otherwise
        """
        try:
            start = DateHelper.parse_date(start_date)
            end = DateHelper.parse_date(end_date)
            return start <= end
        except Exception:
            return False
    
    @staticmethod
    def validate_positive_number(value: Any) -> bool:
        """
        Validate positive number
        
        Args:
            value: Value to validate
            
        Returns:
            True if positive, False otherwise
        """
        try:
            num = Decimal(str(value))
            return num > 0
        except Exception:
            return False
    
    @staticmethod
    def validate_percentage(value: Decimal) -> bool:
        """
        Validate percentage value (0-100)
        
        Args:
            value: Percentage value
            
        Returns:
            True if valid percentage, False otherwise
        """
        try:
            return Decimal("0") <= value <= Decimal("100")
        except Exception:
            return False


class ExportHelper:
    """
    Helper class for exporting data
    Provides methods for data export in various formats
    """
    
    @staticmethod
    def to_csv_string(data: List[Dict[str, Any]], delimiter: str = ",") -> str:
        """
        Convert data to CSV string
        
        Args:
            data: List of dictionaries
            delimiter: CSV delimiter
            
        Returns:
            CSV formatted string
        """
        if not data:
            return ""
        
        # Get headers from first row
        headers = list(data[0].keys())
        csv_lines = [delimiter.join(headers)]
        
        # Add data rows
        for row in data:
            values = [str(row.get(header, "")) for header in headers]
            csv_lines.append(delimiter.join(values))
        
        return "\n".join(csv_lines)
    
    @staticmethod
    def to_excel_compatible(data: List[Dict[str, Any]]) -> List[List[Any]]:
        """
        Convert data to Excel-compatible format
        
        Args:
            data: List of dictionaries
            
        Returns:
            List of lists suitable for Excel
        """
        if not data:
            return []
        
        # Get headers
        headers = list(data[0].keys())
        excel_data = [headers]
        
        # Add data rows
        for row in data:
            excel_data.append([row.get(header) for header in headers])
        
        return excel_data


class CacheKeyBuilder:
    """
    Helper class for building cache keys
    Provides consistent cache key generation
    """
    
    @staticmethod
    def build_key(prefix: str, *args, **kwargs) -> str:
        """
        Build cache key from prefix and parameters
        
        Args:
            prefix: Cache key prefix
            *args: Positional arguments
            **kwargs: Keyword arguments
            
        Returns:
            Cache key string
        """
        key_parts = [prefix]
        
        # Add positional arguments
        for arg in args:
            key_parts.append(str(arg))
        
        # Add keyword arguments (sorted for consistency)
        for key in sorted(kwargs.keys()):
            key_parts.append(f"{key}={kwargs[key]}")
        
        return ":".join(key_parts)


# Utility function for logging analytics queries
def log_query_execution(query_name: str, execution_time: float, record_count: int):
    """
    Log analytics query execution
    
    Args:
        query_name: Name of the query
        execution_time: Execution time in seconds
        record_count: Number of records returned
    """
    logger.info(
        f"Analytics Query Executed: {query_name} | "
        f"Time: {execution_time:.3f}s | "
        f"Records: {record_count}"
    )
