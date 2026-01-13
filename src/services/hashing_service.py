"""
Parollarni xavfsiz hash qilish uchun servis.
Bcrypt algoritmidan foydalanadi.
"""

import logging

import bcrypt

from src.config import settings

logger = logging.getLogger(__name__)


class HashingService:
    """
    Bcrypt yordamida parollarni hash qilish va tekshirish.
    Salt avtomatik generatsiya qilinadi va hash ichiga qo'shiladi.
    """

    def __init__(self, rounds: int = None) -> None:
        """
        HashingService ni ishga tushirish.
        
        Args:
            rounds: Bcrypt work factor (default: settings'dan olinadi)
        """
        self._rounds = rounds or settings.bcrypt_rounds

    def hash_password(self, password: str) -> str:
        """
        Parolni bcrypt bilan hash qilish.
        
        Args:
            password: Oddiy matnli parol
            
        Returns:
            str: Bcrypt hash (salt bilan birga)
            
        Example:
            >>> service = HashingService()
            >>> hashed = service.hash_password("MySecurePassword123!")
            >>> print(hashed)  # $2b$12$...
        """
        if not password:
            raise ValueError("Parol bo'sh bo'lishi mumkin emas")
        
        # Parolni bytes ga o'tkazish
        password_bytes = password.encode("utf-8")
        
        # Salt generatsiya qilish va hash qilish
        salt = bcrypt.gensalt(rounds=self._rounds)
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        logger.debug(f"Parol hash qilindi (rounds={self._rounds})")
        
        return hashed.decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Parolni hash bilan solishtirish.
        
        Args:
            plain_password: Tekshiriladigan oddiy parol
            hashed_password: Database'dagi hash
            
        Returns:
            bool: True agar parol to'g'ri bo'lsa
            
        Example:
            >>> service = HashingService()
            >>> hashed = service.hash_password("MyPassword123!")
            >>> service.verify_password("MyPassword123!", hashed)
            True
            >>> service.verify_password("WrongPassword", hashed)
            False
        """
        if not plain_password or not hashed_password:
            return False
        
        try:
            password_bytes = plain_password.encode("utf-8")
            hashed_bytes = hashed_password.encode("utf-8")
            
            result = bcrypt.checkpw(password_bytes, hashed_bytes)
            
            if not result:
                logger.warning("Parol tekshirish muvaffaqiyatsiz")
            
            return result
        except Exception as e:
            logger.error(f"Parol tekshirishda xatolik: {e}")
            return False


# Global service instance
hashing_service = HashingService()
