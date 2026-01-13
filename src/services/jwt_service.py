"""
JWT tokenlarni yaratish va tekshirish uchun servis.
Access va Refresh tokenlarni boshqaradi.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from src.config import settings

logger = logging.getLogger(__name__)


class JWTService:
    """
    JSON Web Token operatsiyalari.
    Access token (qisqa muddatli) va Refresh token (uzoq muddatli) yaratadi.
    """

    def __init__(
        self,
        secret_key: str = None,
        algorithm: str = None,
        access_expire_seconds: int = None,
        refresh_expire_seconds: int = None
    ) -> None:
        """
        JWTService ni ishga tushirish.
        
        Args:
            secret_key: JWT imzolash uchun maxfiy kalit
            algorithm: Hash algoritmi (default: HS256)
            access_expire_seconds: Access token muddati
            refresh_expire_seconds: Refresh token muddati
        """
        self._secret_key = secret_key or settings.jwt_secret_key
        self._algorithm = algorithm or settings.jwt_algorithm
        self._access_expire = access_expire_seconds or settings.jwt_expire_seconds
        self._refresh_expire = refresh_expire_seconds or settings.jwt_refresh_expire_seconds

    def create_access_token(
        self,
        admin_id: int,
        username: str,
        extra_claims: dict = None
    ) -> str:
        """
        Access token yaratish (qisqa muddatli).
        
        Args:
            admin_id: Admin ID
            username: Admin foydalanuvchi nomi
            extra_claims: Qo'shimcha ma'lumotlar
            
        Returns:
            str: JWT access token
            
        Note:
            Default muddat: 15 daqiqa (900 soniya)
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(seconds=self._access_expire)
        
        payload = {
            "sub": str(admin_id),
            "username": username,
            "type": "access",
            "iat": now,
            "exp": expire,
            "nbf": now,
        }
        
        if extra_claims:
            payload.update(extra_claims)
        
        token = jwt.encode(payload, self._secret_key, algorithm=self._algorithm)
        
        logger.debug(f"Access token yaratildi: admin_id={admin_id}, expire={expire}")
        
        return token

    def create_refresh_token(self, admin_id: int, username: str) -> str:
        """
        Refresh token yaratish (uzoq muddatli).
        
        Args:
            admin_id: Admin ID
            username: Admin foydalanuvchi nomi
            
        Returns:
            str: JWT refresh token
            
        Note:
            Default muddat: 7 kun (604800 soniya)
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(seconds=self._refresh_expire)
        
        payload = {
            "sub": str(admin_id),
            "username": username,
            "type": "refresh",
            "iat": now,
            "exp": expire,
            "nbf": now,
        }
        
        token = jwt.encode(payload, self._secret_key, algorithm=self._algorithm)
        
        logger.debug(f"Refresh token yaratildi: admin_id={admin_id}, expire={expire}")
        
        return token

    def create_temp_token(self, admin_id: int, username: str, purpose: str = "2fa") -> str:
        """
        Vaqtinchalik token yaratish (2FA uchun).
        
        Args:
            admin_id: Admin ID
            username: Admin foydalanuvchi nomi
            purpose: Token maqsadi
            
        Returns:
            str: Vaqtinchalik JWT token
            
        Note:
            Muddat: 5 daqiqa
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=5)
        
        payload = {
            "sub": str(admin_id),
            "username": username,
            "type": "temp",
            "purpose": purpose,
            "iat": now,
            "exp": expire,
        }
        
        token = jwt.encode(payload, self._secret_key, algorithm=self._algorithm)
        
        logger.debug(f"Temp token yaratildi: admin_id={admin_id}, purpose={purpose}")
        
        return token

    def verify_token(self, token: str, expected_type: str = None) -> Optional[dict]:
        """
        Tokenni tekshirish va decode qilish.
        
        Args:
            token: JWT token
            expected_type: Kutilgan token turi ('access', 'refresh', 'temp')
            
        Returns:
            dict: Token payload yoki None (noto'g'ri bo'lsa)
            
        Raises:
            ValueError: Token muddati tugagan yoki noto'g'ri
        """
        if not token:
            raise ValueError("Token bo'sh bo'lishi mumkin emas")
        
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
                options={"require": ["exp", "sub", "type"]}
            )
            
            # Token turini tekshirish
            if expected_type and payload.get("type") != expected_type:
                raise ValueError(f"Noto'g'ri token turi: kutilgan={expected_type}, actual={payload.get('type')}")
            
            logger.debug(f"Token muvaffaqiyatli tekshirildi: sub={payload.get('sub')}")
            
            return payload
            
        except ExpiredSignatureError:
            logger.warning("Token muddati tugagan")
            raise ValueError("Token muddati tugagan")
        except InvalidTokenError as e:
            logger.warning(f"Noto'g'ri token: {e}")
            raise ValueError(f"Noto'g'ri token: {e}")

    def decode_token_unsafe(self, token: str) -> Optional[dict]:
        """
        Tokenni tekshirmasdan decode qilish (faqat debug uchun).
        
        Args:
            token: JWT token
            
        Returns:
            dict: Token payload
            
        Warning:
            Bu metod production'da ishlatilmasligi kerak!
        """
        try:
            return jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
                options={"verify_signature": False, "verify_exp": False}
            )
        except Exception as e:
            logger.error(f"Token decode xatosi: {e}")
            return None

    @property
    def access_expire_seconds(self) -> int:
        """Access token muddati (soniyalarda)."""
        return self._access_expire


# Global service instance
jwt_service = JWTService()
