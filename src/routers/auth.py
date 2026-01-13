"""
Autentifikatsiya API endpointlari.
Login, 2FA verify, token yangilash va admin boshqaruvi.
HTTP-only cookie bilan xavfsiz sessiya boshqaruvi.
"""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.models import (
    LoginRequest,
    LoginResponse,
    TFAVerifyRequest,
    TokenResponse,
    RefreshTokenRequest,
    AdminResponse,
    AdminCreate,
)
from src.services import AuthService
from src.services.auth_service import auth_service
from src.services.jwt_service import jwt_service
from src.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBearer(auto_error=False)

# Cookie sozlamalari
COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"
COOKIE_MAX_AGE = settings.jwt_expire_seconds  # 15 daqiqa
REFRESH_COOKIE_MAX_AGE = settings.jwt_refresh_expire_seconds  # 7 kun


def get_auth_service() -> AuthService:
    """
    AuthService ni olish (Dependency Injection).
    
    Returns:
        AuthService: Auth service instance
    """
    return auth_service


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """
    HTTP-only cookie'larga tokenlarni saqlash.
    
    Args:
        response: FastAPI Response object
        access_token: JWT access token
        refresh_token: JWT refresh token
    """
    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.cookie_secure,  # Production'da True
        samesite="lax",
        path="/"
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=REFRESH_COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/"
    )


def clear_auth_cookies(response: Response) -> None:
    """
    Auth cookie'larni o'chirish.
    
    Args:
        response: FastAPI Response object
    """
    response.delete_cookie(key=COOKIE_NAME, path="/")
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/")


async def get_current_admin_from_cookie(
    request: Request,
    auth: AuthService = Depends(get_auth_service)
) -> Optional[AdminResponse]:
    """
    Cookie'dan joriy adminni olish.
    
    Args:
        request: FastAPI Request object
        auth: AuthService dependency
        
    Returns:
        AdminResponse: Admin ma'lumotlari yoki None
    """
    access_token = request.cookies.get(COOKIE_NAME)
    
    if not access_token:
        return None
    
    try:
        payload = jwt_service.verify_token(access_token, expected_type="access")
        admin_id = int(payload["sub"])
        admin = auth.get_admin_by_id(admin_id)
        
        if admin:
            return AdminResponse(
                adminId=admin.admin_id,
                username=admin.username,
                first_name=admin.first_name,
                last_name=admin.last_name,
                telegram_id=admin.telegram_id,
                created_at=admin.created_at,
                updated_at=admin.updated_at,
            )
    except Exception:
        pass
    
    return None


async def require_auth(
    request: Request,
    auth: AuthService = Depends(get_auth_service)
) -> AdminResponse:
    """
    Autentifikatsiya talab qilish (sessiya majburiy).
    
    Args:
        request: FastAPI Request object
        auth: AuthService dependency
        
    Returns:
        AdminResponse: Admin ma'lumotlari
        
    Raises:
        HTTPException: 401 - Sessiya topilmadi
    """
    admin = await get_current_admin_from_cookie(request, auth)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessiya topilmadi. Iltimos, login qiling.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return admin


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Admin login",
    description="Admin foydalanuvchi login qilish. 2FA yoqilgan bo'lsa OTP talab qilinadi.",
)
async def login(
    request: LoginRequest,
    response: Response,
    auth: Annotated[AuthService, Depends(get_auth_service)]
) -> LoginResponse:
    """
    Admin login endpoint.
    HTTP-only cookie'ga token saqlanadi.
    """
    try:
        logger.info(f"Login so'rovi: username={request.username}")
        result = await auth.authenticate(request.username, request.password)
        
        # Agar 2FA talab qilinmasa, cookie'ga token saqlash
        if not result.requires_2fa and result.access_token and result.refresh_token:
            set_auth_cookies(response, result.access_token, result.refresh_token)
        
        return result
    
    except ValueError as e:
        logger.warning(f"Login xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        logger.error(f"Login server xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ichki server xatosi"
        )


@router.post(
    "/2fa-verify",
    response_model=TokenResponse,
    summary="2FA tasdiqlash",
    description="Telegram orqali yuborilgan OTP kodni tasdiqlash.",
)
async def verify_2fa(
    request: TFAVerifyRequest,
    response: Response,
    auth: Annotated[AuthService, Depends(get_auth_service)]
) -> TokenResponse:
    """
    2FA OTP tasdiqlash endpoint.
    Muvaffaqiyatli bo'lsa HTTP-only cookie'ga token saqlanadi.
    """
    try:
        logger.info("2FA tasdiqlash so'rovi")
        result = auth.verify_2fa(request.temp_token, request.otp_code)
        
        # Cookie'ga token saqlash
        set_auth_cookies(response, result.access_token, result.refresh_token)
        
        return result
    
    except ValueError as e:
        error_msg = str(e)
        logger.warning(f"2FA xatosi: {error_msg}")
        
        if "muddati tugagan" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_msg
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        logger.error(f"2FA server xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ichki server xatosi"
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Token yangilash",
    description="Cookie'dagi refresh token yordamida yangi access token olish.",
)
async def refresh_token(
    request: Request,
    response: Response,
    auth: Annotated[AuthService, Depends(get_auth_service)]
) -> TokenResponse:
    """
    Access token yangilash endpoint.
    Cookie'dan refresh token olinadi.
    """
    try:
        # Cookie'dan refresh token olish
        refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
        
        if not refresh_token:
            raise ValueError("Refresh token topilmadi")
        
        logger.info("Token yangilash so'rovi")
        result = auth.refresh_access_token(refresh_token)
        
        # Yangi access token cookie'ga saqlash
        response.set_cookie(
            key=COOKIE_NAME,
            value=result.access_token,
            max_age=COOKIE_MAX_AGE,
            httponly=True,
            secure=settings.cookie_secure,
            samesite="lax",
            path="/"
        )
        
        return result
    
    except ValueError as e:
        logger.warning(f"Refresh token xatosi: {e}")
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        logger.error(f"Refresh server xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ichki server xatosi"
        )


@router.get(
    "/me",
    response_model=AdminResponse,
    summary="Joriy admin",
    description="Cookie'dagi sessiya orqali joriy admin ma'lumotlarini olish.",
)
async def get_current_admin(
    current_admin: Annotated[AdminResponse, Depends(require_auth)]
) -> AdminResponse:
    """
    Joriy admin ma'lumotlarini olish endpoint.
    Faqat sessiya bor bo'lsa ishlaydi.
    """
    return current_admin


@router.post(
    "/logout",
    summary="Logout",
    description="Foydalanuvchini tizimdan chiqarish va cookie'larni tozalash.",
)
async def logout(response: Response) -> dict:
    """
    Logout endpoint.
    HTTP-only cookie'larni o'chiradi.
    """
    logger.info("Logout so'rovi")
    clear_auth_cookies(response)
    return {
        "message": "Muvaffaqiyatli chiqildi",
        "success": True
    }


@router.get(
    "/check-session",
    summary="Sessiyani tekshirish",
    description="Joriy sessiya mavjudligini tekshirish.",
)
async def check_session(
    request: Request,
    auth: Annotated[AuthService, Depends(get_auth_service)]
) -> dict:
    """
    Sessiya mavjudligini tekshirish endpoint.
    """
    admin = await get_current_admin_from_cookie(request, auth)
    
    if admin:
        return {
            "authenticated": True,
            "admin": admin
        }
    
    return {
        "authenticated": False,
        "admin": None
    }


# =============================================================================
# Admin CRUD Endpoints (Faqat sessiya bilan)
# =============================================================================

@router.post(
    "/admins",
    response_model=AdminResponse,
    summary="Yangi admin qo'shish",
    description="Yangi admin foydalanuvchi yaratish. Faqat autentifikatsiya qilingan adminlar uchun.",
    status_code=status.HTTP_201_CREATED,
)
async def create_admin(
    admin_data: AdminCreate,
    current_admin: Annotated[AdminResponse, Depends(require_auth)],
    auth: Annotated[AuthService, Depends(get_auth_service)]
) -> AdminResponse:
    """
    Yangi admin yaratish endpoint.
    Faqat sessiya bor bo'lsa ishlaydi.
    """
    try:
        logger.info(f"Yangi admin yaratish: {admin_data.username} (yaratuvchi: {current_admin.username})")
        new_admin = auth.create_admin(admin_data)
        return new_admin
    
    except ValueError as e:
        logger.warning(f"Admin yaratish xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Admin yaratish server xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ichki server xatosi"
        )


@router.get(
    "/admins",
    response_model=list[AdminResponse],
    summary="Barcha adminlar",
    description="Barcha admin foydalanuvchilarni olish. Faqat autentifikatsiya qilingan adminlar uchun.",
)
async def get_all_admins(
    current_admin: Annotated[AdminResponse, Depends(require_auth)],
    auth: Annotated[AuthService, Depends(get_auth_service)]
) -> list[AdminResponse]:
    """
    Barcha adminlarni olish endpoint.
    Faqat sessiya bor bo'lsa ishlaydi.
    """
    try:
        logger.info(f"Barcha adminlarni olish (so'rovchi: {current_admin.username})")
        admins = auth.get_all_admins()
        return admins
    
    except Exception as e:
        logger.error(f"Adminlarni olish xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ichki server xatosi"
        )


@router.delete(
    "/admins/{admin_id}",
    summary="Admin o'chirish",
    description="Admin foydalanuvchini o'chirish. O'zini o'zini o'chira olmaydi.",
)
async def delete_admin(
    admin_id: int,
    current_admin: Annotated[AdminResponse, Depends(require_auth)],
    auth: Annotated[AuthService, Depends(get_auth_service)]
) -> dict:
    """
    Admin o'chirish endpoint.
    Faqat sessiya bor bo'lsa ishlaydi.
    """
    try:
        # O'zini o'chirmaslik
        if current_admin.admin_id == admin_id:
            raise ValueError("O'zingizni o'chira olmaysiz")
        
        logger.info(f"Admin o'chirish: {admin_id} (o'chiruvchi: {current_admin.username})")
        auth.delete_admin(admin_id)
        
        return {
            "message": "Admin muvaffaqiyatli o'chirildi",
            "deleted_id": admin_id
        }
    
    except ValueError as e:
        logger.warning(f"Admin o'chirish xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Admin o'chirish server xatosi: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ichki server xatosi"
        )
