from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date, time
from decimal import Decimal

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int = 60
    price: Decimal
    deposit_amount: Decimal = Decimal("0")
    buffer_minutes: int = 0
    max_capacity: int = 1
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[Decimal] = None
    deposit_amount: Optional[Decimal] = None
    buffer_minutes: Optional[int] = None
    max_capacity: Optional[int] = None
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: str
    admin_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Staff Schemas
class StaffServiceCreate(BaseModel):
    staff_id: str
    service_id: str

class StaffServiceResponse(BaseModel):
    id: str
    staff_id: str
    service_id: str
    created_at: datetime

# Availability Schemas
class AvailabilityRuleCreate(BaseModel):
    staff_id: str
    service_id: Optional[str] = None
    day_of_week: int  # 0 = Sunday, 6 = Saturday
    start_time: time
    end_time: time
    timezone: str = "UTC"

class AvailabilityRuleResponse(BaseModel):
    id: str
    staff_id: str
    service_id: Optional[str]
    day_of_week: int
    start_time: time
    end_time: time
    timezone: str
    created_at: datetime

class AvailabilityExceptionCreate(BaseModel):
    staff_id: str
    service_id: Optional[str] = None
    date: date
    is_available: bool = False
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    reason: Optional[str] = None

class AvailabilityExceptionResponse(BaseModel):
    id: str
    staff_id: str
    service_id: Optional[str]
    date: date
    is_available: bool
    start_time: Optional[time]
    end_time: Optional[time]
    reason: Optional[str]
    created_at: datetime

class AvailableSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    staff_id: str
    staff_name: Optional[str] = None

# Customer Schemas
class CustomerCreate(BaseModel):
    user_id: Optional[str] = None
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    timezone: str = "UTC"
    notes: Optional[str] = None

class CustomerResponse(BaseModel):
    id: str
    user_id: Optional[str]
    full_name: str
    email: str
    phone: Optional[str]
    timezone: str
    notes: Optional[str]
    is_blocked: bool
    created_at: datetime

# Booking Schemas
class BookingCreate(BaseModel):
    service_id: str
    staff_id: str
    customer_id: str
    start_time_utc: datetime
    booking_source: str = "web"
    customer_timezone: str = "UTC"

class BookingUpdate(BaseModel):
    start_time_utc: Optional[datetime] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    service_id: str
    staff_id: str
    customer_id: str
    start_time_utc: datetime
    end_time_utc: datetime
    status: str
    payment_status: str
    booking_source: str
    customer_timezone: str
    created_at: datetime

class BookingWithDetails(BookingResponse):
    service_name: Optional[str] = None
    staff_name: Optional[str] = None
    customer_name: Optional[str] = None
    service_price: Optional[Decimal] = None

# Payment Schemas
class PaymentCreate(BaseModel):
    booking_id: str
    amount: Decimal
    currency: str = "USD"
    provider: str = "aba_payway"

class PaymentResponse(BaseModel):
    id: str
    booking_id: str
    provider: str
    provider_reference: Optional[str]
    amount: Decimal
    currency: str
    status: str
    created_at: datetime

class PaymentIntent(BaseModel):
    payment_url: str
    payment_id: str
    transaction_id: str

# Review Schemas
class ReviewCreate(BaseModel):
    booking_id: str
    rating: int  # 1-5
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    rating: int
    comment: Optional[str]
    is_approved: bool
    created_at: datetime

# Notification Schemas
class NotificationCreate(BaseModel):
    booking_id: str
    channel: str  # "email" or "sms"
    type: str  # "confirmation", "reminder", "cancellation", "feedback"
    recipient: str

class NotificationResponse(BaseModel):
    id: str
    booking_id: str
    channel: str
    type: str
    recipient: str
    status: str
    sent_at: Optional[datetime]
    created_at: datetime

# Analytics Schemas
class BookingStats(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    completed_bookings: int
    pending_bookings: int
    total_revenue: Decimal
    average_booking_value: Decimal

class ServiceStats(BaseModel):
    service_id: str
    service_name: str
    total_bookings: int
    total_revenue: Decimal
    average_rating: Optional[float]

class StaffStats(BaseModel):
    staff_id: str
    staff_name: str
    total_bookings: int
    completed_bookings: int
    total_revenue: Decimal
    average_rating: Optional[float]

class DailyStats(BaseModel):
    date: date
    total_bookings: int
    total_revenue: Decimal
