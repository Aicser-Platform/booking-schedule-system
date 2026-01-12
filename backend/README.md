# Appointment Booking API

FastAPI backend for the appointment booking system.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Endpoints

### Services
- `GET /api/services` - Get all services
- `GET /api/services/{service_id}` - Get service by ID
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/{service_id}` - Update service (Admin)
- `DELETE /api/services/{service_id}` - Delete service (Admin)

### Staff
- `POST /api/staff/services` - Assign staff to service
- `GET /api/staff/services/{staff_id}` - Get staff services
- `DELETE /api/staff/services/{assignment_id}` - Remove staff from service
- `GET /api/staff/{service_id}/staff` - Get service staff

### Availability
- `POST /api/availability/rules` - Create availability rule
- `GET /api/availability/rules/{staff_id}` - Get staff availability rules
- `DELETE /api/availability/rules/{rule_id}` - Delete rule
- `POST /api/availability/exceptions` - Create availability exception
- `GET /api/availability/exceptions/{staff_id}` - Get staff exceptions
- `GET /api/availability/slots` - Get available time slots

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get bookings (with filters)
- `GET /api/bookings/{booking_id}` - Get booking by ID
- `PUT /api/bookings/{booking_id}` - Update booking
- `DELETE /api/bookings/{booking_id}` - Cancel booking

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/{payment_id}/confirm` - Confirm payment
- `GET /api/payments/{payment_id}` - Get payment
- `GET /api/payments/booking/{booking_id}` - Get booking payments
- `POST /api/payments/{payment_id}/refund` - Refund payment

### Analytics
- `GET /api/analytics/bookings/stats` - Get booking statistics
- `GET /api/analytics/services/stats` - Get service statistics
- `GET /api/analytics/staff/stats` - Get staff statistics
- `GET /api/analytics/daily/stats` - Get daily statistics

## Mock Integrations

- **ABA Payway**: Payment processing is mocked. Real integration would require actual API credentials.
- **Email/SMS**: Notifications are logged to database. Real integration would require email/SMS provider.
