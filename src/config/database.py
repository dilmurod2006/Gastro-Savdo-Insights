"""
MySQL database ulanishini boshqarish.
Connection pooling va context manager supportni ta'minlaydi.
"""

import logging
from contextlib import contextmanager
from typing import Generator, Optional

import mysql.connector
from mysql.connector import pooling, Error as MySQLError

from .settings import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    MySQL database connection pool boshqaruvchisi.
    Singleton pattern yordamida bitta pool yaratadi.
    """

    _instance: Optional["DatabaseManager"] = None
    _pool: Optional[pooling.MySQLConnectionPool] = None

    def __new__(cls) -> "DatabaseManager":
        """Singleton pattern - faqat bitta instance yaratish."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """Database pool'ni ishga tushirish."""
        if self._pool is None:
            self._initialize_pool()

    def _initialize_pool(self) -> None:
        """
        MySQL connection pool yaratish.
        Pool size .env faylidan olinadi.
        """
        try:
            pool_config = {
                "pool_name": "gastro_savdo_pool",
                "pool_size": settings.db_pool_size,
                "pool_reset_session": True,
                "host": settings.db_host,
                "port": settings.db_port,
                "user": settings.db_user,
                "password": settings.db_password,
                "database": settings.db_name,
                "charset": "utf8mb4",
                "collation": "utf8mb4_general_ci",
                "autocommit": False,
                "use_pure": True,
            }
            self._pool = pooling.MySQLConnectionPool(**pool_config)
            logger.info(
                f"Database pool muvaffaqiyatli yaratildi: "
                f"{settings.db_host}:{settings.db_port}/{settings.db_name}"
            )
        except MySQLError as e:
            logger.error(f"Database pool yaratishda xatolik: {e}")
            raise

    def get_connection(self) -> mysql.connector.MySQLConnection:
        """
        Pool'dan connection olish.
        
        Returns:
            MySQLConnection: Database ulanishi
            
        Raises:
            MySQLError: Ulanish olishda xatolik
        """
        if self._pool is None:
            raise RuntimeError("Database pool ishga tushmagan")
        
        try:
            connection = self._pool.get_connection()
            return connection
        except MySQLError as e:
            logger.error(f"Connection olishda xatolik: {e}")
            raise

    @contextmanager
    def connection(self) -> Generator[mysql.connector.MySQLConnection, None, None]:
        """
        Context manager yordamida connection olish va avtomatik yopish.
        
        Yields:
            MySQLConnection: Database ulanishi
            
        Example:
            with db_manager.connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM admins")
        """
        conn = None
        try:
            conn = self.get_connection()
            yield conn
            conn.commit()
        except MySQLError as e:
            if conn:
                conn.rollback()
            logger.error(f"Database xatoligi: {e}")
            raise
        finally:
            if conn and conn.is_connected():
                conn.close()

    @contextmanager
    def cursor(self, dictionary: bool = True) -> Generator:
        """
        Context manager yordamida cursor olish.
        
        Args:
            dictionary: True bo'lsa natijalar dict ko'rinishida qaytadi
            
        Yields:
            MySQLCursor: Database cursor
            
        Example:
            with db_manager.cursor() as cursor:
                cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
                admin = cursor.fetchone()
        """
        with self.connection() as conn:
            cursor = conn.cursor(dictionary=dictionary)
            try:
                yield cursor
            finally:
                cursor.close()

    def execute_query(
        self,
        query: str,
        params: tuple = None,
        fetch_one: bool = False,
        fetch_all: bool = True
    ) -> Optional[list | dict]:
        """
        SQL query bajarish va natijani qaytarish.
        
        Args:
            query: SQL query (parameterized)
            params: Query parametrlari (SQL injection himoyasi uchun)
            fetch_one: Faqat bitta natija olish
            fetch_all: Barcha natijalarni olish
            
        Returns:
            Query natijalari yoki None
        """
        with self.cursor() as cursor:
            cursor.execute(query, params or ())
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            return None

    def execute_many(self, query: str, params_list: list[tuple]) -> int:
        """
        Bir nechta INSERT/UPDATE operatsiyalarni bajarish.
        
        Args:
            query: SQL query
            params_list: Parametrlar ro'yxati
            
        Returns:
            int: Ta'sirlangan qatorlar soni
        """
        with self.cursor() as cursor:
            cursor.executemany(query, params_list)
            return cursor.rowcount

    def close_pool(self) -> None:
        """Pool'ni yopish (ilova to'xtaganda chaqiriladi)."""
        if self._pool:
            # MySQL Connector Python pool'ni to'g'ridan-to'g'ri yopish imkoni yo'q
            # Lekin barcha connectionlar avtomatik yopiladi
            logger.info("Database pool yopildi")
            self._pool = None
            DatabaseManager._instance = None


# Global database manager instance
db_manager = DatabaseManager()


def get_db() -> DatabaseManager:
    """
    Database manager olish (Dependency Injection uchun).
    
    Returns:
        DatabaseManager: Database manager instance
    """
    return db_manager
