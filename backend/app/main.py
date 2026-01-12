from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import services, staff, availability, bookings, payments, notifications, analytics, users
from app.core.config import settings

app = FastAPI(
    title="Appointment Booking API",
    description="API for time-based appointment booking system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(services.router, prefix="/api/services", tags=["services"])
app.include_router(staff.router, prefix="/api/staff", tags=["staff"])
app.include_router(availability.router, prefix="/api/availability", tags=["availability"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {"message": "Appointment Booking API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
