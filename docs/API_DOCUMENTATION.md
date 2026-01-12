# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All authenticated requests should include the Supabase JWT token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

Note: Currently, the API doesn't enforce authentication on all endpoints for development purposes. In production, implement proper JWT verification.

## Users API

### Create User Profile
**POST** `/users/profile`

Creates a user profile after Supabase authentication.

**Request Body:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "phone": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "role": "customer",
  "phone": "+1234567890",
  "avatar_url": null
}
```

### Get User Profile
**GET** `/users/{user_id}/profile`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "role": "customer",
  "phone": "+1234567890",
  "avatar_url": null
}
```

## Services API

### List All Services
**GET** `/services`

**Query Parameters:**
- `is_active` (optional): Filter by active status

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Haircut",
    "description": "Professional haircut service",
    "duration_minutes": 60,
    "price": 50.00,
    "deposit_amount": 10.00,
    "is_active": true
  }
]
```

### Create Service
**POST** `/services`

**Request Body:**
```json
{
  "name": "Haircut",
  "description": "Professional haircut service",
  "duration_minutes": 60,
  "price": 50.00,
  "deposit_amount": 10.00,
  "buffer_minutes": 15,
  "max_capacity": 1,
  "admin_id": "uuid"
}
```

### Update Service
**PUT** `/services/{service_id}`

### Delete Service
**DELETE** `/services/{service_id}`

## Availability API

### Get Available Slots
**GET** `/availability/slots`

**Query Parameters:**
- `service_id` (required): UUID
- `date` (required): YYYY-MM-DD
- `staff_id` (optional): UUID
- `timezone` (optional): Default UTC

**Response:** `200 OK`
```json
{
  "date": "2024-03-15",
  "service_id": "uuid",
  "available_slots": [
    {
      "start_time": "09:00",
      "end_time": "10:00",
      "staff_id": "uuid",
      "staff_name": "John Staff"
    }
  ]
}
```

### Create Availability Rule
**POST** `/availability/rules`

**Request Body:**
```json
{
  "staff_id": "uuid",
  "service_id": "uuid",
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "America/New_York"
}
```

### Create Availability Exception
**POST** `/availability/exceptions`

**Request Body:**
```json
{
  "staff_id": "uuid",
  "service_id": "uuid",
  "date": "2024-03-15",
  "is_available": false,
  "reason": "Holiday"
}
```

## Bookings API

### Create Booking
**POST** `/bookings`

**Request Body:**
```json
{
  "service_id": "uuid",
  "staff_id": "uuid",
  "customer_name": "Jane Customer",
  "customer_email": "jane@example.com",
  "customer_phone": "+1234567890",
  "start_time_utc": "2024-03-15T14:00:00Z",
  "customer_timezone": "America/New_York",
  "booking_source": "web"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "service_id": "uuid",
  "staff_id": "uuid",
  "customer_id": "uuid",
  "start_time_utc": "2024-03-15T14:00:00Z",
  "end_time_utc": "2024-03-15T15:00:00Z",
  "status": "pending",
  "payment_status": "pending"
}
```

### Get Booking
**GET** `/bookings/{booking_id}`

### Update Booking Status
**PUT** `/bookings/{booking_id}`

**Request Body:**
```json
{
  "status": "confirmed",
  "payment_status": "paid"
}
```

### Get User Bookings
**GET** `/bookings/user/{user_id}`

### Get Staff Bookings
**GET** `/bookings/staff/{staff_id}`

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

## Payments API

### Create Payment Intent
**POST** `/payments/create-intent`

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 50.00,
  "currency": "USD",
  "payment_type": "full"
}
```

**Response:** `200 OK`
```json
{
  "payment_id": "uuid",
  "checkout_url": "https://checkout.payway.com/...",
  "transaction_id": "TXN123456"
}
```

### Confirm Payment
**POST** `/payments/{payment_id}/confirm`

**Request Body:**
```json
{
  "transaction_status": "approved"
}
```

## Analytics API

### Get Revenue Analytics
**GET** `/analytics/revenue`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:** `200 OK`
```json
{
  "total_revenue": 15000.00,
  "completed_bookings": 150,
  "pending_revenue": 2000.00,
  "refunded_amount": 500.00,
  "period": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  }
}
```

### Get Booking Analytics
**GET** `/analytics/bookings`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:** `200 OK`
```json
{
  "total_bookings": 200,
  "confirmed": 150,
  "cancelled": 20,
  "no_show": 10,
  "by_service": [
    {
      "service_name": "Haircut",
      "count": 80
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "detail": "Validation error message"
}
```

**404 Not Found**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Internal server error message"
}
