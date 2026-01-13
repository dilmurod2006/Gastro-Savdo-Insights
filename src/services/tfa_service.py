"""
Telegram orqali ikki faktorli autentifikatsiya (2FA).
OTP kodlarni yuborish va tekshirish.
"""

import logging
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

from src.config import settings

logger = logging.getLogger(__name__)


class OTPStorage:
    """
    OTP kodlarni saqlash uchun in-memory storage.
    Production uchun Redis ishlatish tavsiya etiladi.
    """

    def __init__(self) -> None:
        """OTP storage ni ishga tushirish."""
        self._storage: dict[int, dict] = {}

    def save(self, admin_id: int, otp: str, expires_at: datetime) -> None:
        """
        OTP kodni saqlash.
        
        Args:
            admin_id: Admin ID
            otp: OTP kod
            expires_at: Amal qilish muddati
        """
        self._storage[admin_id] = {
            "otp": otp,
            "expires_at": expires_at,
            "attempts": 0,
        }
        logger.debug(f"OTP saqlandi: admin_id={admin_id}")

    def get(self, admin_id: int) -> Optional[dict]:
        """
        OTP kodini olish.
        
        Args:
            admin_id: Admin ID
            
        Returns:
            dict: OTP ma'lumotlari yoki None
        """
        return self._storage.get(admin_id)

    def delete(self, admin_id: int) -> None:
        """
        OTP kodni o'chirish.
        
        Args:
            admin_id: Admin ID
        """
        if admin_id in self._storage:
            del self._storage[admin_id]
            logger.debug(f"OTP o'chirildi: admin_id={admin_id}")

    def increment_attempts(self, admin_id: int) -> int:
        """
        Urinishlar sonini oshirish.
        
        Args:
            admin_id: Admin ID
            
        Returns:
            int: Yangi urinishlar soni
        """
        if admin_id in self._storage:
            self._storage[admin_id]["attempts"] += 1
            return self._storage[admin_id]["attempts"]
        return 0

    def cleanup_expired(self) -> None:
        """Muddati tugagan OTP kodlarni tozalash."""
        now = datetime.now(timezone.utc)
        expired_ids = [
            admin_id
            for admin_id, data in self._storage.items()
            if data["expires_at"] < now
        ]
        for admin_id in expired_ids:
            del self._storage[admin_id]
        
        if expired_ids:
            logger.debug(f"{len(expired_ids)} ta muddati tugagan OTP tozalandi")


class TFAService:
    """
    Telegram bot orqali 2FA kodlarini boshqarish.
    OTP generatsiya, yuborish va tekshirish.
    """

    MAX_ATTEMPTS = 3  # Maksimal urinishlar soni

    def __init__(
        self,
        bot_token: str = None,
        otp_expire_seconds: int = None
    ) -> None:
        """
        TFAService ni ishga tushirish.
        
        Args:
            bot_token: Telegram bot tokeni
            otp_expire_seconds: OTP amal qilish muddati (soniyalarda)
        """
        self._bot_token = bot_token or settings.telegram_bot_token
        self._otp_expire = otp_expire_seconds or settings.otp_expire_seconds
        self._storage = OTPStorage()
        self._telegram_api_url = f"https://api.telegram.org/bot{self._bot_token}"

    def generate_otp(self, length: int = 6) -> str:
        """
        Tasodifiy OTP kod yaratish.
        
        Args:
            length: Kod uzunligi (default: 6)
            
        Returns:
            str: Tasodifiy raqamli kod
            
        Example:
            >>> service = TFAService()
            >>> otp = service.generate_otp()
            >>> print(otp)  # "847293"
        """
        otp = "".join(random.choices(string.digits, k=length))
        logger.debug(f"OTP generatsiya qilindi: {'*' * length}")
        return otp

    async def send_otp_to_telegram(self, chat_id: str, otp: str) -> bool:
        """
        Telegram orqali OTP yuborish.
        
        Args:
            chat_id: Telegram chat ID
            otp: Yuboriladigan OTP kod
            
        Returns:
            bool: True agar muvaffaqiyatli yuborilsa
            
        Example:
            >>> service = TFAService()
            >>> await service.send_otp_to_telegram("123456789", "847293")
            True
        """
        if not self._bot_token:
            logger.error("Telegram bot tokeni sozlanmagan")
            return False

        if not chat_id:
            logger.error("Telegram chat ID bo'sh")
            return False

        message = (
            "🔐 *Gastro-Savdo-Insights*\n\n"
            f"Sizning tasdiqlash kodingiz:\n\n"
            f"```\n{otp}\n```\n\n"
            f"⏰ Kod {self._otp_expire // 60} daqiqa ichida amal qiladi.\n\n"
            "⚠️ *Bu kodni hech kimga bermang!*"
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._telegram_api_url}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": message,
                        "parse_mode": "Markdown",
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("ok"):
                        logger.info(f"OTP Telegram orqali yuborildi: chat_id={chat_id}")
                        return True
                    else:
                        logger.error(f"Telegram API xatosi: {result}")
                        return False
                else:
                    logger.error(f"Telegram so'rov xatosi: {response.status_code}")
                    return False

        except httpx.TimeoutException:
            logger.error("Telegram so'rovi timeout")
            return False
        except Exception as e:
            logger.error(f"Telegram yuborishda xatolik: {e}")
            return False

    def create_and_store_otp(self, admin_id: int) -> str:
        """
        OTP yaratish va saqlash.
        
        Args:
            admin_id: Admin ID
            
        Returns:
            str: Yaratilgan OTP kod
        """
        # Avvalgi OTP ni o'chirish
        self._storage.delete(admin_id)
        
        # Yangi OTP yaratish
        otp = self.generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=self._otp_expire)
        
        # Saqlash
        self._storage.save(admin_id, otp, expires_at)
        
        return otp

    def verify_otp(self, admin_id: int, otp: str) -> bool:
        """
        OTP kodni tekshirish.
        
        Args:
            admin_id: Admin ID
            otp: Tekshiriladigan OTP kod
            
        Returns:
            bool: True agar OTP to'g'ri va amal qilsa
            
        Raises:
            ValueError: OTP topilmasa, muddati tugagan bo'lsa yoki urinishlar tugagan
        """
        stored = self._storage.get(admin_id)
        
        if not stored:
            logger.warning(f"OTP topilmadi: admin_id={admin_id}")
            raise ValueError("OTP kod topilmadi. Qaytadan login qiling.")
        
        # Muddatni tekshirish
        if stored["expires_at"] < datetime.now(timezone.utc):
            self._storage.delete(admin_id)
            logger.warning(f"OTP muddati tugagan: admin_id={admin_id}")
            raise ValueError("OTP kod muddati tugagan. Qaytadan login qiling.")
        
        # Urinishlar sonini tekshirish
        if stored["attempts"] >= self.MAX_ATTEMPTS:
            self._storage.delete(admin_id)
            logger.warning(f"OTP urinishlar tugadi: admin_id={admin_id}")
            raise ValueError("Juda ko'p noto'g'ri urinish. Qaytadan login qiling.")
        
        # OTP ni tekshirish
        if stored["otp"] != otp:
            attempts = self._storage.increment_attempts(admin_id)
            remaining = self.MAX_ATTEMPTS - attempts
            logger.warning(f"Noto'g'ri OTP: admin_id={admin_id}, qolgan={remaining}")
            raise ValueError(f"Noto'g'ri OTP kod. Qolgan urinishlar: {remaining}")
        
        # Muvaffaqiyatli - OTP ni o'chirish
        self._storage.delete(admin_id)
        logger.info(f"OTP muvaffaqiyatli tekshirildi: admin_id={admin_id}")
        
        return True

    def cleanup(self) -> None:
        """Muddati tugagan OTP kodlarni tozalash."""
        self._storage.cleanup_expired()


# Global service instance
tfa_service = TFAService()
