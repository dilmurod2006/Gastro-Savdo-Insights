"""
Ilova konfiguratsiyasi.
.env faylidan sozlamalarni o'qiydi va Pydantic Settings orqali validatsiya qiladi.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Ilova sozlamalari.
    Barcha muhit o'zgaruvchilarini .env faylidan o'qiydi.
    """
    # ==================== Allowded URLS ====================
    main_url: str = Field(default="", alias="MAINURL")

    # ==================== Database Configuration ====================
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=3306, alias="DB_PORT")
    db_user: str = Field(default="root", alias="DB_USER")
    db_password: str = Field(default="", alias="DB_PASSWORD")
    db_name: str = Field(default="northwind", alias="DB_NAME")
    db_pool_size: int = Field(default=5, alias="DB_POOL_SIZE")

    # ==================== JWT Configuration ====================
    jwt_secret_key: str = Field(
        default="your-super-secret-key-change-in-production-at-least-32-chars",
        alias="JWT_SECRET_KEY"
    )
    jwt_expire_seconds: int = Field(default=900, alias="JWT_EXPIRE_SECONDS")  # 15 daqiqa
    jwt_refresh_expire_seconds: int = Field(default=604800, alias="JWT_REFRESH_EXPIRE_SECONDS")  # 7 kun
    jwt_algorithm: str = "HS256"

    # ==================== Telegram Configuration ====================
    telegram_bot_token: str = Field(default="", alias="TELEGRAM_BOT_TOKEN")

    # ==================== Security ====================
    otp_expire_seconds: int = Field(default=300, alias="OTP_EXPIRE_SECONDS")  # 5 daqiqa
    cookie_secure: bool = Field(default=False, alias="COOKIE_SECURE")
    bcrypt_rounds: int = 12

    # ==================== Application ====================
    debug: bool = Field(default=False, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")

    class Config:
        """Pydantic konfiguratsiyasi."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"

    @property
    def database_url(self) -> str:
        """MySQL database URL yasash."""
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def is_production(self) -> bool:
        """Prodakshn muhitida ekanligini tekshirish."""
        return self.environment.lower() == "production"


@lru_cache()
def get_settings() -> Settings:
    """
    Sozlamalarni olish (cached).
    Bir marta yaratiladi va keyingi chaqiruvlarda cache'dan qaytariladi.
    """
    return Settings()


# Global settings instance
settings = get_settings()
