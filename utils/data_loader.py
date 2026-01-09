"""
Data Loader Module
Ma'lumotlarni yuklash va qayta ishlash uchun funksiyalar
"""

import pandas as pd
import os
from typing import Optional


def load_csv_data(file_path: str) -> Optional[pd.DataFrame]:
    """
    Load data from CSV file
    
    Args:
        file_path: Path to CSV file
        
    Returns:
        DataFrame or None if error occurs
    """
    try:
        df = pd.read_csv(file_path)
        return df
    except Exception as e:
        print(f"CSV faylni yuklashda xatolik: {e}")
        return None


def load_excel_data(file_path: str, sheet_name: str = 0) -> Optional[pd.DataFrame]:
    """
    Load data from Excel file
    
    Args:
        file_path: Path to Excel file
        sheet_name: Sheet name or index to load
        
    Returns:
        DataFrame or None if error occurs
    """
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        return df
    except Exception as e:
        print(f"Excel faylni yuklashda xatolik: {e}")
        return None


def load_data(file_name: str, data_dir: str = 'data') -> Optional[pd.DataFrame]:
    """
    Load data from file (auto-detect format)
    
    Args:
        file_name: Name of the file to load
        data_dir: Directory where data files are stored
        
    Returns:
        DataFrame or None if error occurs
    """
    file_path = os.path.join(data_dir, file_name)
    
    if not os.path.exists(file_path):
        print(f"Fayl topilmadi: {file_path}")
        return None
    
    # Detect file format and load
    if file_name.endswith('.csv'):
        return load_csv_data(file_path)
    elif file_name.endswith(('.xlsx', '.xls')):
        return load_excel_data(file_path)
    else:
        print(f"Qo'llab-quvvatlanmaydigan fayl formati: {file_name}")
        return None


def get_data_summary(df: pd.DataFrame) -> dict:
    """
    Get summary statistics of DataFrame
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary with summary statistics
    """
    if df is None or df.empty:
        return {}
    
    summary = {
        'rows': len(df),
        'columns': len(df.columns),
        'column_names': df.columns.tolist(),
        'data_types': df.dtypes.to_dict(),
        'missing_values': df.isnull().sum().to_dict(),
        'memory_usage': df.memory_usage(deep=True).sum()
    }
    
    return summary
