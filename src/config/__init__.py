"""
Konfiguratsiya moduli.
Settings va database ulanishlarini boshqaradi.
"""

from .settings import settings
from .database import DatabaseManager, get_db

__all__ = ["settings", "DatabaseManager", "get_db"]
