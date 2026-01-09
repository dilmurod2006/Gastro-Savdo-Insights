"""
Database Configuration Module
Ma'lumotlar bazasi bilan ishlash uchun konfiguratsiya
"""

import os
from typing import Optional
import sqlite3


class DatabaseConfig:
    """Database configuration class"""
    
    def __init__(self):
        """Initialize database configuration"""
        self.db_type = os.getenv('DB_TYPE', 'sqlite')
        self.db_host = os.getenv('DB_HOST', 'localhost')
        self.db_port = os.getenv('DB_PORT', '5432')
        self.db_name = os.getenv('DB_NAME', 'gastro_savdo.db')
        self.db_user = os.getenv('DB_USER', '')
        self.db_password = os.getenv('DB_PASSWORD', '')
        
    def get_connection_string(self) -> str:
        """Get database connection string"""
        if self.db_type == 'sqlite':
            db_path = os.path.join('data', self.db_name)
            return f"sqlite:///{db_path}"
        elif self.db_type == 'postgresql':
            return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        elif self.db_type == 'mysql':
            return f"mysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        else:
            raise ValueError(f"Noma'lum ma'lumotlar bazasi turi: {self.db_type}")


def get_database_connection(db_path: Optional[str] = None):
    """
    Get database connection
    
    Args:
        db_path: Path to SQLite database file (optional)
        
    Returns:
        Database connection object
    """
    if db_path is None:
        db_path = os.path.join('data', 'gastro_savdo.db')
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Ma'lumotlar bazasiga ulanishda xatolik: {e}")
        return None


def create_tables(conn):
    """
    Create necessary database tables
    
    Args:
        conn: Database connection object
    """
    cursor = conn.cursor()
    
    # Example: Create sales table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Example: Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()


def initialize_database():
    """Initialize database with tables"""
    conn = get_database_connection()
    if conn:
        create_tables(conn)
        conn.close()
        print("Ma'lumotlar bazasi muvaffaqiyatli yaratildi.")
    else:
        print("Ma'lumotlar bazasini yaratishda xatolik yuz berdi.")


if __name__ == "__main__":
    initialize_database()
