from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    # Allow extra env vars like ENV/DEBUG without crashing
    model_config = ConfigDict(env_file=".env", extra="ignore")

    # =========================
    # Application
    # =========================
    ENV: str = "development"
    DEBUG: bool = False

    # =========================
    # Database (REQUIRED)
    # =========================
    DATABASE_URL: str

    # =========================
    # CORS (comma-separated)
    # =========================
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # =========================
    # Auth / Security
    # =========================
    SECRET_KEY: str = "dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # =========================
    # Supabase (disabled / optional)
    # =========================
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # =========================
    # ABA Payway (Mock)
    # =========================
    ABA_PAYWAY_MERCHANT_ID: str = "mock_merchant_id"
    ABA_PAYWAY_API_KEY: str = "mock_api_key"
    ABA_PAYWAY_API_URL: str = "https://checkout-sandbox.payway.com.kh/api"

    # =========================
    # Booking Policies
    # =========================
    SLOT_GRANULARITY_MINUTES: int = 15
    MIN_NOTICE_MINUTES: int = 120
    MAX_BOOKING_DAYS: int = 90

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

settings = Settings()
