from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.auth import get_current_user, is_admin
from app.models.schemas import (
    BookingCreate, BookingUpdate, BookingResponse, BookingWithDetails
)
import uuid

router = APIRouter()

def _get_customer_id(db: Session, user_id: str) -> str | None:
    record = db.execute(
        "SELECT id FROM customers WHERE user_id = :user_id",
        {"user_id": user_id},
    ).fetchone()
    return record[0] if record else None

def _ensure_booking_access(db: Session, booking_id: str, current_user: dict) -> dict:
    record = db.execute(
        "SELECT id, staff_id, customer_id FROM bookings WHERE id = :id",
        {"id": booking_id},
    ).fetchone()

    if not record:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = {"id": record[0], "staff_id": record[1], "customer_id": record[2]}

    if is_admin(current_user):
        return booking

    role = current_user.get("role")
    if role == "staff":
        if booking["staff_id"] != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Forbidden")
        return booking

    if role == "customer":
        customer_id = _get_customer_id(db, current_user.get("id"))
        if not customer_id or booking["customer_id"] != customer_id:
            raise HTTPException(status_code=403, detail="Forbidden")
        return booking

    raise HTTPException(status_code=403, detail="Forbidden")

@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new booking"""
    booking_id = str(uuid.uuid4())

    role = current_user.get("role")
    if role == "customer":
        customer_id = _get_customer_id(db, current_user.get("id"))
        if not customer_id:
            raise HTTPException(status_code=403, detail="Customer profile not found")
        if booking.customer_id != customer_id:
            raise HTTPException(status_code=403, detail="Forbidden")
    elif role == "staff":
        if booking.staff_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Forbidden")

    # Get service details to calculate end time
    service_result = db.execute(
        "SELECT duration_minutes FROM services WHERE id = :id",
        {"id": booking.service_id}
    )
    service = service_result.fetchone()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    end_time_utc = booking.start_time_utc + timedelta(minutes=service[0])
    
    # Check if slot is available
    conflict_result = db.execute(
        """
        SELECT id FROM bookings
        WHERE staff_id = :staff_id
        AND status NOT IN ('cancelled', 'no-show')
        AND (
            (start_time_utc < :end_time AND end_time_utc > :start_time)
        )
        """,
        {
            "staff_id": booking.staff_id,
            "start_time": booking.start_time_utc,
            "end_time": end_time_utc,
        }
    )
    
    if conflict_result.fetchone():
        raise HTTPException(status_code=400, detail="Time slot is not available")
    
    # Create booking
    db.execute(
        """
        INSERT INTO bookings (id, service_id, staff_id, customer_id, start_time_utc,
                            end_time_utc, booking_source, customer_timezone, status, payment_status)
        VALUES (:id, :service_id, :staff_id, :customer_id, :start_time_utc,
                :end_time_utc, :booking_source, :customer_timezone, 'pending', 'pending')
        """,
        {
            "id": booking_id,
            "service_id": booking.service_id,
            "staff_id": booking.staff_id,
            "customer_id": booking.customer_id,
            "start_time_utc": booking.start_time_utc,
            "end_time_utc": end_time_utc,
            "booking_source": booking.booking_source,
            "customer_timezone": booking.customer_timezone,
        }
    )
    db.commit()
    
    # Log the booking creation
    db.execute(
        """
        INSERT INTO booking_logs (id, booking_id, action, performed_by)
        VALUES (:id, :booking_id, 'created', :performed_by)
        """,
        {
            "id": str(uuid.uuid4()),
            "booking_id": booking_id,
            "performed_by": current_user.get("id"),
        }
    )
    db.commit()
    
    result = db.execute(
        "SELECT * FROM bookings WHERE id = :id",
        {"id": booking_id}
    )
    return dict(result.fetchone()._mapping)

@router.get("/{booking_id}", response_model=BookingWithDetails)
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get booking by ID with details"""
    _ensure_booking_access(db, booking_id, current_user)
    result = db.execute(
        """
        SELECT b.*, s.name as service_name, s.price as service_price,
               u.full_name as staff_name, c.full_name as customer_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN users u ON b.staff_id = u.id
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE b.id = :id
        """,
        {"id": booking_id}
    )
    
    booking = result.fetchone()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return dict(booking._mapping)

@router.get("/{booking_id}/payment")
async def get_booking_for_payment(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return booking details needed for payment screen."""
    _ensure_booking_access(db, booking_id, current_user)
    result = db.execute(
        """
        SELECT b.id, b.status, b.payment_status, b.start_time_utc,
               s.name as service_name, s.price, s.deposit_amount, s.duration_minutes,
               u.full_name as staff_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN users u ON b.staff_id = u.id
        WHERE b.id = :id
        """,
        {"id": booking_id},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "id": result[0],
        "status": result[1],
        "payment_status": result[2],
        "start_time_utc": result[3],
        "services": {
            "name": result[4],
            "price": result[5],
            "deposit_amount": result[6],
            "duration_minutes": result[7],
        },
        "staff": {"full_name": result[8]},
    }

@router.get("/{booking_id}/confirmed")
async def get_booking_confirmed(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return booking confirmation details."""
    _ensure_booking_access(db, booking_id, current_user)
    result = db.execute(
        """
        SELECT b.id, b.start_time_utc,
               s.name as service_name, s.price, s.duration_minutes,
               u.full_name as staff_name, u.phone as staff_phone
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN users u ON b.staff_id = u.id
        WHERE b.id = :id
        """,
        {"id": booking_id},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "id": result[0],
        "start_time_utc": result[1],
        "services": {
            "name": result[2],
            "price": result[3],
            "duration_minutes": result[4],
        },
        "staff": {"full_name": result[5], "phone": result[6]},
    }

@router.get("/", response_model=List[BookingWithDetails])
async def get_bookings(
    customer_id: str = None,
    staff_id: str = None,
    service_id: str = None,
    status: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bookings with filters"""
    query = """
        SELECT b.*, s.name as service_name, s.price as service_price,
               u.full_name as staff_name, c.full_name as customer_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN users u ON b.staff_id = u.id
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE 1=1
    """
    params = {}
    
    role = current_user.get("role")
    if is_admin(current_user):
        pass
    elif role == "staff":
        staff_id = current_user.get("id")
    elif role == "customer":
        customer_id = _get_customer_id(db, current_user.get("id"))
        if not customer_id:
            raise HTTPException(status_code=403, detail="Customer profile not found")
    else:
        raise HTTPException(status_code=403, detail="Forbidden")

    if customer_id:
        query += " AND b.customer_id = :customer_id"
        params["customer_id"] = customer_id
    if staff_id:
        query += " AND b.staff_id = :staff_id"
        params["staff_id"] = staff_id
    if service_id:
        query += " AND b.service_id = :service_id"
        params["service_id"] = service_id
    if status:
        query += " AND b.status = :status"
        params["status"] = status
    if start_date:
        query += " AND b.start_time_utc >= :start_date"
        params["start_date"] = start_date
    if end_date:
        query += " AND b.start_time_utc <= :end_date"
        params["end_date"] = end_date
    
    query += f" ORDER BY b.start_time_utc DESC LIMIT {limit} OFFSET {skip}"
    
    result = db.execute(query, params)
    bookings = result.fetchall()
    return [dict(row._mapping) for row in bookings]

@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    booking: BookingUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a booking"""
    # Get current booking
    _ensure_booking_access(db, booking_id, current_user)
    result = db.execute("SELECT * FROM bookings WHERE id = :id", {"id": booking_id})
    current_booking = result.fetchone()

    updates = []
    params = {"id": booking_id}
    change_type = None
    old_start_time = current_booking[5]  # start_time_utc column
    
    if booking.start_time_utc is not None:
        # Reschedule
        service_result = db.execute(
            "SELECT duration_minutes FROM services WHERE id = :id",
            {"id": current_booking[1]}  # service_id
        )
        service = service_result.fetchone()
        end_time_utc = booking.start_time_utc + timedelta(minutes=service[0])
        
        updates.append("start_time_utc = :start_time_utc")
        updates.append("end_time_utc = :end_time_utc")
        params["start_time_utc"] = booking.start_time_utc
        params["end_time_utc"] = end_time_utc
        change_type = "reschedule"
    
    if booking.status is not None:
        updates.append("status = :status")
        params["status"] = booking.status
        if not change_type:
            change_type = "cancel" if booking.status == "cancelled" else "status_update"
    
    if booking.payment_status is not None:
        if current_user.get("role") == "customer" and not is_admin(current_user):
            raise HTTPException(status_code=403, detail="Forbidden")
        updates.append("payment_status = :payment_status")
        params["payment_status"] = booking.payment_status
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = f"UPDATE bookings SET {', '.join(updates)} WHERE id = :id"
    db.execute(query, params)
    db.commit()
    
    # Log the change
    if change_type:
        db.execute(
            """
            INSERT INTO booking_changes (id, booking_id, old_start_time, new_start_time, 
                                        change_type, changed_by)
            VALUES (:id, :booking_id, :old_start_time, :new_start_time, :change_type, :changed_by)
            """,
            {
                "id": str(uuid.uuid4()),
                "booking_id": booking_id,
                "old_start_time": old_start_time if change_type == "reschedule" else None,
                "new_start_time": booking.start_time_utc if change_type == "reschedule" else None,
                "change_type": change_type,
                "changed_by": current_user.get("id"),
            }
        )
        db.commit()
    
    result = db.execute(
        "SELECT * FROM bookings WHERE id = :id",
        {"id": booking_id}
    )
    return dict(result.fetchone()._mapping)

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: str,
    reason: str = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a booking"""
    _ensure_booking_access(db, booking_id, current_user)
    db.execute(
        "UPDATE bookings SET status = 'cancelled' WHERE id = :id",
        {"id": booking_id}
    )
    db.commit()
    
    # Log the cancellation
    db.execute(
        """
        INSERT INTO booking_changes (id, booking_id, change_type, changed_by, reason)
        VALUES (:id, :booking_id, 'cancel', :changed_by, :reason)
        """,
        {
            "id": str(uuid.uuid4()),
            "booking_id": booking_id,
            "changed_by": current_user.get("id"),
            "reason": reason,
        }
    )
    db.commit()
    
    return {"message": "Booking cancelled"}
