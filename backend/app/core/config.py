from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # ABA Payway Configuration (Mock)
    ABA_PAYWAY_MERCHANT_ID: str = "mock_merchant_id"
    ABA_PAYWAY_API_KEY: str = "mock_api_key"
    ABA_PAYWAY_API_URL: str = "https://checkout-sandbox.payway.com.kh/api"
    
    class Config:
        env_file = ".env"

settings = Settings()
