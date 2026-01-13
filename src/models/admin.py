"""
Admin foydalanuvchi modellari.
Request va Response validatsiyasi uchun Pydantic modellar.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class AdminBase(BaseModel):
    """
    Admin bazaviy modeli.
    Barcha admin modellarida umumiy maydonlar.
    """
    username: str = Field(..., min_length=3, max_length=50, description="Admin foydalanuvchi nomi")
    first_name: Optional[str] = Field(None, max_length=50, description="Ism")
    last_name: Optional[str] = Field(None, max_length=50, description="Familiya")
    telegram_id: Optional[str] = Field(None, max_length=20, description="Telegram chat ID (2FA uchun)")


class AdminCreate(AdminBase):
    """
    Yangi admin yaratish uchun model.
    Parol majburiy.
    """
    password: str = Field(..., min_length=6, max_length=100, description="Parol (kamida 6 belgi)")


class AdminResponse(AdminBase):
    """
    Admin ma'lumotlarini qaytarish uchun model.
    Parol hech qachon qaytarilmaydi.
    """
    admin_id: int = Field(..., alias="adminId", description="Admin ID")
    created_at: Optional[datetime] = Field(None, description="Yaratilgan vaqt")
    updated_at: Optional[datetime] = Field(None, description="Yangilangan vaqt")

    class Config:
        """Pydantic konfiguratsiyasi."""
        from_attributes = True
        populate_by_name = True


class AdminInDB(AdminBase):
    """
    Database'dan olingan admin modeli.
    Ichki ishlatish uchun (parol hash bilan).
    """
    admin_id: int
    password_hash: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ==================== Authentication Models ====================

class LoginRequest(BaseModel):
    """
    Login so'rovi uchun model.
    Username va parol majburiy.
    """
    username: str = Field(..., min_length=3, max_length=50, description="Foydalanuvchi nomi")
    password: str = Field(..., min_length=1, description="Parol")


class LoginResponse(BaseModel):
    """
    Login javobi uchun model.
    2FA yoqilgan bo'lsa temp_token qaytariladi.
    """
    requires_2fa: bool = Field(..., description="2FA talab qilinadimi")
    temp_token: Optional[str] = Field(None, description="2FA uchun vaqtinchalik token")
    access_token: Optional[str] = Field(None, description="Access token (2FA o'chirilgan bo'lsa)")
    refresh_token: Optional[str] = Field(None, description="Refresh token (2FA o'chirilgan bo'lsa)")
    admin: Optional[AdminResponse] = Field(None, description="Admin ma'lumotlari")
    message: str = Field(..., description="Xabar")


class TFAVerifyRequest(BaseModel):
    """
    2FA tekshirish so'rovi uchun model.
    Vaqtinchalik token va OTP kod majburiy.
    """
    temp_token: str = Field(..., description="Login'dan olingan vaqtinchalik token")
    otp_code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", description="6 xonali OTP kod")


class TokenResponse(BaseModel):
    """
    Token javobi uchun model.
    Access va refresh tokenlarni o'z ichiga oladi.
    """
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token turi")
    expires_in: int = Field(..., description="Token amal qilish muddati (soniyalarda)")
    admin: Optional[AdminResponse] = Field(None, description="Admin ma'lumotlari")


class RefreshTokenRequest(BaseModel):
    """
    Token yangilash so'rovi uchun model.
    Refresh token majburiy.
    """
    refresh_token: str = Field(..., description="Refresh token")
