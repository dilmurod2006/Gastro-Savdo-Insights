"""
Autentifikatsiya biznes logikasi.
Login, 2FA va token operatsiyalarini boshqaradi.
"""

import logging
from typing import Optional

from src.config import get_db, DatabaseManager
from src.models import AdminInDB, AdminResponse, TokenResponse, LoginResponse
from src.services.hashing_service import hashing_service, HashingService
from src.services.jwt_service import jwt_service, JWTService
from src.services.tfa_service import tfa_service, TFAService

logger = logging.getLogger(__name__)


class AuthService:
    """
    Autentifikatsiya operatsiyalari uchun servis.
    Login, 2FA verify va token yangilashni boshqaradi.
    """

    def __init__(
        self,
        db: DatabaseManager = None,
        hashing: HashingService = None,
        jwt: JWTService = None,
        tfa: TFAService = None
    ) -> None:
        """
        AuthService ni ishga tushirish.
        
        Args:
            db: Database manager
            hashing: Hashing service
            jwt: JWT service
            tfa: 2FA service
        """
        self._db = db or get_db()
        self._hashing = hashing or hashing_service
        self._jwt = jwt or jwt_service
        self._tfa = tfa or tfa_service

    def get_admin_by_username(self, username: str) -> Optional[AdminInDB]:
        """
        Username bo'yicha admin olish.
        
        Args:
            username: Admin foydalanuvchi nomi
            
        Returns:
            AdminInDB: Admin ma'lumotlari yoki None
        """
        query = """
            SELECT 
                adminId as admin_id,
                username,
                password_hash,
                first_name,
                last_name,
                telegram_id,
                created_at,
                updated_at
            FROM admins 
            WHERE username = %s
        """
        
        result = self._db.execute_query(query, (username,), fetch_one=True)
        
        if result:
            return AdminInDB(**result)
        return None

    def get_admin_by_id(self, admin_id: int) -> Optional[AdminInDB]:
        """
        ID bo'yicha admin olish.
        
        Args:
            admin_id: Admin ID
            
        Returns:
            AdminInDB: Admin ma'lumotlari yoki None
        """
        query = """
            SELECT 
                adminId as admin_id,
                username,
                password_hash,
                first_name,
                last_name,
                telegram_id,
                created_at,
                updated_at
            FROM admins 
            WHERE adminId = %s
        """
        
        result = self._db.execute_query(query, (admin_id,), fetch_one=True)
        
        if result:
            return AdminInDB(**result)
        return None

    async def authenticate(self, username: str, password: str) -> LoginResponse:
        """
        Adminni login qilish va tekshirish.
        
        Args:
            username: Admin foydalanuvchi nomi
            password: Parol (hash qilinmagan)
            
        Returns:
            LoginResponse: Login natijasi (2FA talab qilish yoki tokenlar)
            
        Raises:
            ValueError: Noto'g'ri login ma'lumotlari
        """
        logger.info(f"Login urinishi: username={username}")
        
        # Adminni topish
        admin = self.get_admin_by_username(username)
        
        if not admin:
            logger.warning(f"Admin topilmadi: username={username}")
            raise ValueError("Noto'g'ri foydalanuvchi nomi yoki parol")
        
        # Parolni tekshirish
        if not self._hashing.verify_password(password, admin.password_hash):
            logger.warning(f"Noto'g'ri parol: username={username}")
            raise ValueError("Noto'g'ri foydalanuvchi nomi yoki parol")
        
        # 2FA tekshirish
        if admin.telegram_id:
            # 2FA yoqilgan - OTP yuborish
            otp = self._tfa.create_and_store_otp(admin.admin_id)
            
            # Telegram orqali OTP yuborish
            sent = await self._tfa.send_otp_to_telegram(admin.telegram_id, otp)
            
            if not sent:
                logger.error(f"OTP yuborilmadi: admin_id={admin.admin_id}")
                raise ValueError("OTP yuborishda xatolik. Keyinroq urinib ko'ring.")
            
            # Vaqtinchalik token yaratish
            temp_token = self._jwt.create_temp_token(admin.admin_id, admin.username)
            
            logger.info(f"2FA talab qilinmoqda: admin_id={admin.admin_id}")
            
            return LoginResponse(
                requires_2fa=True,
                temp_token=temp_token,
                message="OTP kod Telegram orqali yuborildi"
            )
        else:
            # 2FA o'chirilgan - to'g'ridan-to'g'ri token berish
            access_token = self._jwt.create_access_token(admin.admin_id, admin.username)
            refresh_token = self._jwt.create_refresh_token(admin.admin_id, admin.username)
            
            admin_response = AdminResponse(
                adminId=admin.admin_id,
                username=admin.username,
                first_name=admin.first_name,
                last_name=admin.last_name,
                telegram_id=admin.telegram_id,
                created_at=admin.created_at,
                updated_at=admin.updated_at,
            )
            
            logger.info(f"Login muvaffaqiyatli (2FA o'chirilgan): admin_id={admin.admin_id}")
            
            return LoginResponse(
                requires_2fa=False,
                access_token=access_token,
                refresh_token=refresh_token,
                admin=admin_response,
                message="Login muvaffaqiyatli"
            )

    def verify_2fa(self, temp_token: str, otp_code: str) -> TokenResponse:
        """
        2FA OTP kodni tekshirish va tokenlar berish.
        
        Args:
            temp_token: Login'dan olingan vaqtinchalik token
            otp_code: Foydalanuvchi kiritgan OTP kod
            
        Returns:
            TokenResponse: Access va refresh tokenlar
            
        Raises:
            ValueError: Noto'g'ri temp token yoki OTP
        """
        # Temp tokenni tekshirish
        try:
            payload = self._jwt.verify_token(temp_token, expected_type="temp")
        except ValueError as e:
            logger.warning(f"Noto'g'ri temp token: {e}")
            raise ValueError("Noto'g'ri yoki muddati tugagan vaqtinchalik token")
        
        admin_id = int(payload["sub"])
        username = payload["username"]
        
        # OTP ni tekshirish
        self._tfa.verify_otp(admin_id, otp_code)
        
        # Admin ma'lumotlarini olish
        admin = self.get_admin_by_id(admin_id)
        
        if not admin:
            raise ValueError("Admin topilmadi")
        
        # Tokenlar yaratish
        access_token = self._jwt.create_access_token(admin_id, username)
        refresh_token = self._jwt.create_refresh_token(admin_id, username)
        
        admin_response = AdminResponse(
            adminId=admin.admin_id,
            username=admin.username,
            first_name=admin.first_name,
            last_name=admin.last_name,
            telegram_id=admin.telegram_id,
            created_at=admin.created_at,
            updated_at=admin.updated_at,
        )
        
        logger.info(f"2FA muvaffaqiyatli: admin_id={admin_id}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=self._jwt.access_expire_seconds,
            admin=admin_response,
        )

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """
        Refresh token yordamida yangi access token olish.
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            TokenResponse: Yangi access token
            
        Raises:
            ValueError: Noto'g'ri refresh token
        """
        # Refresh tokenni tekshirish
        try:
            payload = self._jwt.verify_token(refresh_token, expected_type="refresh")
        except ValueError as e:
            logger.warning(f"Noto'g'ri refresh token: {e}")
            raise ValueError("Noto'g'ri yoki muddati tugagan refresh token")
        
        admin_id = int(payload["sub"])
        username = payload["username"]
        
        # Admin hali ham mavjudligini tekshirish
        admin = self.get_admin_by_id(admin_id)
        
        if not admin:
            raise ValueError("Admin topilmadi")
        
        # Yangi access token yaratish
        access_token = self._jwt.create_access_token(admin_id, username)
        
        logger.info(f"Access token yangilandi: admin_id={admin_id}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,  # Eski refresh token qaytariladi
            expires_in=self._jwt.access_expire_seconds,
        )

    # =========================================================================
    # Admin CRUD Operatsiyalari
    # =========================================================================

    def create_admin(self, admin_data) -> AdminResponse:
        """
        Yangi admin yaratish.
        
        Args:
            admin_data: AdminCreate model (username, password, va boshqalar)
            
        Returns:
            AdminResponse: Yaratilgan admin ma'lumotlari
            
        Raises:
            ValueError: Username allaqachon mavjud
        """
        from src.models import AdminCreate
        
        # Username mavjudligini tekshirish
        existing = self.get_admin_by_username(admin_data.username)
        if existing:
            raise ValueError(f"'{admin_data.username}' foydalanuvchi nomi allaqachon mavjud")
        
        # Parolni hash qilish
        password_hash = self._hashing.hash_password(admin_data.password)
        
        # SQL INSERT
        insert_query = """
            INSERT INTO admins (username, password_hash, first_name, last_name, telegram_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        params = (
            admin_data.username,
            password_hash,
            admin_data.first_name,
            admin_data.last_name,
            admin_data.telegram_id,
        )
        
        result = self._db.execute_query(insert_query, params)
        
        # Yaratilgan adminni olish
        new_admin = self.get_admin_by_username(admin_data.username)
        
        if not new_admin:
            raise ValueError("Admin yaratishda xatolik yuz berdi")
        
        logger.info(f"Yangi admin yaratildi: {admin_data.username}")
        
        return AdminResponse(
            adminId=new_admin.admin_id,
            username=new_admin.username,
            first_name=new_admin.first_name,
            last_name=new_admin.last_name,
            telegram_id=new_admin.telegram_id,
            created_at=new_admin.created_at,
            updated_at=new_admin.updated_at,
        )

    def get_all_admins(self) -> list[AdminResponse]:
        """
        Barcha adminlarni olish.
        
        Returns:
            list[AdminResponse]: Adminlar ro'yxati
        """
        query = """
            SELECT 
                adminId as admin_id,
                username,
                password_hash,
                first_name,
                last_name,
                telegram_id,
                created_at,
                updated_at
            FROM admins 
            ORDER BY created_at DESC
        """
        
        results = self._db.execute_query(query)
        
        admins = []
        for row in results:
            from src.models import AdminInDB
            admin = AdminInDB(**row)
            admins.append(AdminResponse(
                adminId=admin.admin_id,
                username=admin.username,
                first_name=admin.first_name,
                last_name=admin.last_name,
                telegram_id=admin.telegram_id,
                created_at=admin.created_at,
                updated_at=admin.updated_at,
            ))
        
        logger.info(f"Barcha adminlar olindi: {len(admins)} ta")
        
        return admins

    def delete_admin(self, admin_id: int) -> bool:
        """
        Admin o'chirish.
        
        Args:
            admin_id: O'chiriladigan admin ID
            
        Returns:
            bool: Muvaffaqiyatli o'chirildi
            
        Raises:
            ValueError: Admin topilmadi
        """
        # Admin mavjudligini tekshirish
        admin = self.get_admin_by_id(admin_id)
        
        if not admin:
            raise ValueError(f"Admin topilmadi: ID={admin_id}")
        
        # SQL DELETE
        delete_query = "DELETE FROM admins WHERE adminId = %s"
        self._db.execute_query(delete_query, (admin_id,))
        
        logger.info(f"Admin o'chirildi: ID={admin_id}, username={admin.username}")
        
        return True


# Global service instance
auth_service = AuthService()
