"""
Gastro-Savdo-Insights FastAPI Application.
Restoran va savdo analitikasi tizimi uchun backend.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import settings
from src.routers import auth_router
from src.routers.analytics import router as analytics_router
from src.utils.exceptions import GastroSavdoException

# Logging sozlash
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Ilova lifecycle boshqaruvi.
    Startup va shutdown eventlarini boshqaradi.
    """
    # Startup
    logger.info("=" * 50)
    logger.info("Gastro-Savdo-Insights backend ishga tushmoqda...")
    logger.info(f"Muhit: {settings.environment}")
    logger.info(f"Debug: {settings.debug}")
    logger.info(f"Database: {settings.db_host}:{settings.db_port}/{settings.db_name}")
    logger.info("=" * 50)
    
    yield
    
    # Shutdown
    logger.info("Gastro-Savdo-Insights backend to'xtatilmoqda...")
    logger.info("Xayr!")


# FastAPI ilovasi
app = FastAPI(
    title="Gastro-Savdo-Insights API",
    description="""
    ## Restoran va Savdo Analitikasi Tizimi
    
    Bu API quyidagi funksiyalarni taqdim etadi:
    
    * **Autentifikatsiya**: JWT + 2FA (Telegram OTP)
    * **Admin boshqaruvi**: Admin CRUD operatsiyalari
    * **Analitika**: 20 ta murakkab SQL savol asosida keng qamrovli analitika
    
    ### Analitika Modullari
    - **Mahsulot Analitikasi**: Top daromad, ABC tahlil, Market Basket
    - **Xodim Analitikasi**: Oylik sotuv, Ierarxiya
    - **Mijoz Analitikasi**: RFM Segmentatsiya, Retention, Chegirma tahlili
    - **Kategoriya Analitikasi**: Oylik o'sish, Davlat bo'yicha tahlil
    - **Yetkazib Beruvchi**: Samaradorlik, Xavf tahlili
    - **Yetkazib Berish**: Kompaniya samaradorligi
    - **Sotuv Analitikasi**: YoY o'sish, Haftalik pattern, Territoriya tahlili
    - **Business KPI Dashboard**: Kompleks biznes ko'rsatkichlar
    
    ### Xavfsizlik
    - JWT access token (15 daqiqa)
    - JWT refresh token (7 kun)
    - Bcrypt parol hashing
    - Telegram 2FA (ixtiyoriy)
    - SQL Injection himoya
    """,
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan,
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.main_url,
        "https://gastro-analytics.uz",
        "https://www.gastro-analytics.uz",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routerlarni qo'shish
app.include_router(auth_router, prefix="/api/v1")
app.include_router(analytics_router)  # Analytics router already has /api/v1/analytics prefix


# Global exception handler
@app.exception_handler(GastroSavdoException)
async def gastro_savdo_exception_handler(
    request: Request,
    exc: GastroSavdoException
) -> JSONResponse:
    """
    Gastro-Savdo-Insights custom exceptionlarni handle qilish.
    """
    logger.error(f"GastroSavdoException: {exc.message}")
    return JSONResponse(
        status_code=400,
        content=exc.to_dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    Umumiy exceptionlarni handle qilish.
    """
    logger.error(f"Kutilmagan xatolik: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "Ichki server xatosi" if not settings.debug else str(exc),
        }
    )


# Root endpoint
@app.get("/", tags=["Root"])
async def root() -> dict:
    """
    API root endpoint.
    Ilova holati va versiyasini qaytaradi.
    """
    return {
        "app": "Gastro-Savdo-Insights",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled",
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """
    Health check endpoint.
    Ilova va database holatini tekshiradi.
    """
    from src.config import get_db
    
    db_status = "unknown"
    try:
        db = get_db()
        with db.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()  # Natijani o'qib tashlash
            db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {e}"
        logger.error(f"Database health check xatosi: {e}")
    
    return {
        "status": "healthy",
        "database": db_status,
        "environment": settings.environment,
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info",
    )
