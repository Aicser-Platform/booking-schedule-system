from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, services, staff, availability, bookings, payments, notifications, analytics
from app.core.config import settings

app = FastAPI(title="Appointment Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(services.router, prefix="/api/services")
app.include_router(staff.router, prefix="/api/staff")
app.include_router(availability.router, prefix="/api/availability")
app.include_router(bookings.router, prefix="/api/bookings")
app.include_router(payments.router, prefix="/api/payments")
app.include_router(notifications.router, prefix="/api/notifications")
app.include_router(analytics.router, prefix="/api/analytics")

@app.get("/health")
def health():
    return {"status": "ok"}
