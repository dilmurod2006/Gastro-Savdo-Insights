"""
Maxsus xatoliklar (Custom Exceptions).
Ilova bo'ylab ishlatiladigan xatolik klasslari.
"""

from typing import Optional


class GastroSavdoException(Exception):
    """
    Gastro-Savdo-Insights ilovasi uchun bazaviy xatolik.
    Barcha custom exceptionlar bu klassdan meros oladi.
    """

    def __init__(
        self,
        message: str,
        error_code: str = None,
        details: dict = None
    ) -> None:
        """
        Exception yaratish.
        
        Args:
            message: Xatolik xabari
            error_code: Xatolik kodi (API response uchun)
            details: Qo'shimcha ma'lumotlar
        """
        super().__init__(message)
        self.message = message
        self.error_code = error_code or "UNKNOWN_ERROR"
        self.details = details or {}

    def to_dict(self) -> dict:
        """Xatolikni dict formatga o'tkazish."""
        return {
            "error": self.error_code,
            "message": self.message,
            "details": self.details,
        }


class DatabaseException(GastroSavdoException):
    """
    Database xatoligi.
    SQL query, connection yoki database bilan bog'liq xatoliklar.
    """

    def __init__(
        self,
        message: str,
        query: Optional[str] = None,
        details: dict = None
    ) -> None:
        """
        Database exception yaratish.
        
        Args:
            message: Xatolik xabari
            query: SQL query (optional)
            details: Qo'shimcha ma'lumotlar
        """
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            details=details or {}
        )
        if query:
            self.details["query"] = query


class AuthenticationError(GastroSavdoException):
    """
    Autentifikatsiya xatoligi.
    Noto'g'ri login, parol yoki token holatlarda ishlatiladi.
    """

    def __init__(
        self,
        message: str = "Autentifikatsiya xatosi",
        details: dict = None
    ) -> None:
        """AuthenticationError yaratish."""
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            details=details
        )


class AuthorizationError(GastroSavdoException):
    """
    Avtorizatsiya xatoligi.
    Ruxsat yo'q bo'lgan holatlarda ishlatiladi.
    """

    def __init__(
        self,
        message: str = "Ruxsat berilmagan",
        details: dict = None
    ) -> None:
        """AuthorizationError yaratish."""
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            details=details
        )


class ValidationError(GastroSavdoException):
    """
    Validatsiya xatoligi.
    Noto'g'ri input ma'lumotlar uchun ishlatiladi.
    """

    def __init__(
        self,
        message: str = "Validatsiya xatosi",
        field: str = None,
        details: dict = None
    ) -> None:
        """ValidationError yaratish."""
        _details = details or {}
        if field:
            _details["field"] = field
        
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details=_details
        )


class NotFoundError(GastroSavdoException):
    """
    Resurs topilmadi xatoligi.
    Ma'lumot bazada topilmaganda ishlatiladi.
    """

    def __init__(
        self,
        resource: str = "Resurs",
        identifier: str = None,
        details: dict = None
    ) -> None:
        """NotFoundError yaratish."""
        message = f"{resource} topilmadi"
        if identifier:
            message = f"{resource} topilmadi: {identifier}"
        
        super().__init__(
            message=message,
            error_code="NOT_FOUND",
            details=details
        )


class DatabaseError(GastroSavdoException):
    """
    Database xatoligi.
    MySQL bilan bog'liq xatoliklarda ishlatiladi.
    """

    def __init__(
        self,
        message: str = "Database xatosi",
        original_error: Exception = None,
        details: dict = None
    ) -> None:
        """DatabaseError yaratish."""
        _details = details or {}
        if original_error:
            _details["original_error"] = str(original_error)
        
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            details=_details
        )


class TelegramError(GastroSavdoException):
    """
    Telegram xatoligi.
    Bot yoki API bilan bog'liq xatoliklarda ishlatiladi.
    """

    def __init__(
        self,
        message: str = "Telegram xatosi",
        chat_id: str = None,
        details: dict = None
    ) -> None:
        """TelegramError yaratish."""
        _details = details or {}
        if chat_id:
            _details["chat_id"] = chat_id
        
        super().__init__(
            message=message,
            error_code="TELEGRAM_ERROR",
            details=_details
        )


class TokenError(GastroSavdoException):
    """
    Token xatoligi.
    JWT token bilan bog'liq muammolarda ishlatiladi.
    """

    def __init__(
        self,
        message: str = "Token xatosi",
        token_type: str = None,
        details: dict = None
    ) -> None:
        """TokenError yaratish."""
        _details = details or {}
        if token_type:
            _details["token_type"] = token_type
        
        super().__init__(
            message=message,
            error_code="TOKEN_ERROR",
            details=_details
        )


class RateLimitError(GastroSavdoException):
    """
    Rate limit xatoligi.
    Juda ko'p so'rov yuborilganda ishlatiladi.
    """

    def __init__(
        self,
        message: str = "Juda ko'p so'rov. Biroz kuting.",
        retry_after: int = None,
        details: dict = None
    ) -> None:
        """RateLimitError yaratish."""
        _details = details or {}
        if retry_after:
            _details["retry_after_seconds"] = retry_after
        
        super().__init__(
            message=message,
            error_code="RATE_LIMIT_EXCEEDED",
            details=_details
        )
