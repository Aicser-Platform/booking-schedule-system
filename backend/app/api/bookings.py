from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, time, date, timezone as dt_timezone
import calendar
from zoneinfo import ZoneInfo
from app.core.database import get_db
from app.core.auth import get_current_user, is_admin
from app.core.config import settings
from app.models.schemas import (
    BookingCreate, BookingUpdate, BookingResponse, BookingWithDetails
)
import uuid

router = APIRouter()

def _is_nth_weekday_in_month(target_date: date, weekday: int, nth: int) -> bool:
    if target_date.weekday() != weekday:
        return False
    first_day = target_date.replace(day=1)
    offset = (weekday - first_day.weekday()) % 7
    first_occurrence = 1 + offset
    occurrence = ((target_date.day - first_occurrence) // 7) + 1
    if nth == -1:
        last_day = calendar.monthrange(target_date.year, target_date.month)[1]
        last_date = target_date.replace(day=last_day)
        last_offset = (last_date.weekday() - weekday) % 7
        last_occurrence_day = last_day - last_offset
        return target_date.day == last_occurrence_day
    return occurrence == nth

def _service_allows_booking(
    db: Session,
    service_id: str,
    local_start: datetime,
    local_end: datetime,
    schedule_tz: ZoneInfo,
) -> bool:
    schedule = db.execute(
        """
        SELECT * FROM service_operating_schedules
        WHERE service_id = :service_id
          AND is_active = TRUE
          AND (effective_from IS NULL OR effective_from <= :date)
          AND (effective_to IS NULL OR effective_to >= :date)
        ORDER BY created_at DESC
        LIMIT 1
        """,
        {"service_id": service_id, "date": local_start.date()},
    ).fetchone()

    if not schedule:
        return True

    schedule_map = schedule._mapping
    service_tz = ZoneInfo(schedule_map.get("timezone") or "UTC")

    exceptions = db.execute(
        """
        SELECT is_open, start_time, end_time
        FROM service_operating_exceptions
        WHERE service_id = :service_id AND date = :date
        """,
        {"service_id": service_id, "date": local_start.date()},
    ).fetchall()

    start_utc = local_start.astimezone(dt_timezone.utc)
    end_utc = local_end.astimezone(dt_timezone.utc)

    if exceptions:
        override_exceptions = [ex for ex in exceptions if ex[0] and ex[1] and ex[2]]
        closed_exceptions = [ex for ex in exceptions if not ex[0]]
        extra_open_exceptions = [ex for ex in exceptions if ex[0] and not (ex[1] and ex[2])]

        if override_exceptions:
            for ex in override_exceptions:
                start_dt = datetime.combine(local_start.date(), ex[1], tzinfo=service_tz)
                end_dt = datetime.combine(local_start.date(), ex[2], tzinfo=service_tz)
                if start_utc >= start_dt.astimezone(dt_timezone.utc) and end_utc <= end_dt.astimezone(dt_timezone.utc):
                    return True
            return False
        if closed_exceptions:
            return False
        if extra_open_exceptions:
            day_start = datetime.combine(local_start.date(), time(0, 0), tzinfo=service_tz)
            day_end = day_start + timedelta(days=1)
            return start_utc >= day_start.astimezone(dt_timezone.utc) and end_utc <= day_end.astimezone(dt_timezone.utc)

    rule_type = schedule_map.get("rule_type")
    open_time = schedule_map.get("open_time")
    close_time = schedule_map.get("close_time")
    weekday = (local_start.weekday() + 1) % 7

    if rule_type == "daily":
        if open_time and close_time:
            start_dt = datetime.combine(local_start.date(), open_time, tzinfo=service_tz)
            end_dt = datetime.combine(local_start.date(), close_time, tzinfo=service_tz)
            return start_utc >= start_dt.astimezone(dt_timezone.utc) and end_utc <= end_dt.astimezone(dt_timezone.utc)
        return True

    rules = db.execute(
        """
        SELECT rule_type, weekday, month_day, nth, start_time, end_time
        FROM service_operating_rules
        WHERE schedule_id = :schedule_id
        """,
        {"schedule_id": schedule_map.get("id")},
    ).fetchall()

    for rule in rules:
        rule_type_value = rule[0]
        rule_weekday = rule[1]
        month_day = rule[2]
        nth = rule[3]
        start_time = rule[4]
        end_time = rule[5]

        is_match = False
        if rule_type == "weekly" and rule_type_value == "weekly":
            is_match = rule_weekday == weekday
        elif rule_type == "monthly" and rule_type_value == "monthly_day":
            is_match = month_day == local_start.date().day
        elif rule_type == "monthly" and rule_type_value == "monthly_nth_weekday":
            if rule_weekday is not None and nth is not None:
                is_match = _is_nth_weekday_in_month(local_start.date(), rule_weekday, nth)

        if not is_match:
            continue

        if start_time and end_time:
            start_dt = datetime.combine(local_start.date(), start_time, tzinfo=service_tz)
            end_dt = datetime.combine(local_start.date(), end_time, tzinfo=service_tz)
            return start_utc >= start_dt.astimezone(dt_timezone.utc) and end_utc <= end_dt.astimezone(dt_timezone.utc)
        if open_time and close_time:
            start_dt = datetime.combine(local_start.date(), open_time, tzinfo=service_tz)
            end_dt = datetime.combine(local_start.date(), close_time, tzinfo=service_tz)
            return start_utc >= start_dt.astimezone(dt_timezone.utc) and end_utc <= end_dt.astimezone(dt_timezone.utc)
        return True

    return False

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
        "SELECT duration_minutes, buffer_minutes FROM services WHERE id = :id",
        {"id": booking.service_id}
    )
    service = service_result.fetchone()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    duration_minutes = int(service[0])
    buffer_minutes = int(service[1] or 0)
    end_time_utc = booking.start_time_utc + timedelta(minutes=duration_minutes + buffer_minutes)

    schedule = db.execute(
        """
        SELECT id, timezone
        FROM staff_weekly_schedules
        WHERE staff_id = :staff_id
          AND (effective_from IS NULL OR effective_from <= :date)
          AND (effective_to IS NULL OR effective_to >= :date)
        ORDER BY is_default DESC, effective_from DESC NULLS LAST
        LIMIT 1
        """,
        {
            "staff_id": booking.staff_id,
            "date": booking.start_time_utc.date(),
        },
    ).fetchone()

    if not schedule:
        raise HTTPException(status_code=400, detail="Staff schedule is not configured")

    schedule_tz = ZoneInfo(schedule[1])
    local_start = booking.start_time_utc.astimezone(schedule_tz)
    local_end = end_time_utc.astimezone(schedule_tz)
    local_date = local_start.date()

    if not _service_allows_booking(db, booking.service_id, local_start, local_end, schedule_tz):
        raise HTTPException(status_code=400, detail="Service is not available at this time")

    schedule = db.execute(
        """
        SELECT id, timezone
        FROM staff_weekly_schedules
        WHERE staff_id = :staff_id
          AND (effective_from IS NULL OR effective_from <= :date)
          AND (effective_to IS NULL OR effective_to >= :date)
        ORDER BY is_default DESC, effective_from DESC NULLS LAST
        LIMIT 1
        """,
        {
            "staff_id": booking.staff_id,
            "date": local_date,
        },
    ).fetchone()

    if not schedule:
        raise HTTPException(status_code=400, detail="Staff schedule is not configured")
    weekday = (local_start.weekday() + 1) % 7

    now_local = datetime.now(schedule_tz)
    min_notice_cutoff = now_local + timedelta(minutes=settings.MIN_NOTICE_MINUTES)
    if local_start < min_notice_cutoff:
        raise HTTPException(status_code=400, detail="Booking does not meet minimum notice")

    max_booking_cutoff = now_local + timedelta(days=settings.MAX_BOOKING_DAYS)
    if local_start > max_booking_cutoff:
        raise HTTPException(status_code=400, detail="Booking exceeds maximum window")

    if not _service_allows_booking(db, booking.service_id, local_start, local_end, schedule_tz):
        raise HTTPException(status_code=400, detail="Service is not available at this time")

    work_blocks = db.execute(
        """
        SELECT start_time_local, end_time_local
        FROM staff_work_blocks
        WHERE schedule_id = :schedule_id AND weekday = :weekday
        """,
        {"schedule_id": schedule[0], "weekday": weekday},
    ).fetchall()

    if not work_blocks:
        raise HTTPException(status_code=400, detail="Staff is not available on this day")

    fits_work_block = False
    for block in work_blocks:
        block_start = datetime.combine(local_start.date(), block[0], tzinfo=schedule_tz)
        block_end = datetime.combine(local_start.date(), block[1], tzinfo=schedule_tz)
        if local_start >= block_start and local_end <= block_end:
            fits_work_block = True
            break

    if not fits_work_block:
        raise HTTPException(status_code=400, detail="Time is outside staff working hours")

    break_blocks = db.execute(
        """
        SELECT start_time_local, end_time_local
        FROM staff_break_blocks
        WHERE schedule_id = :schedule_id AND weekday = :weekday
        """,
        {"schedule_id": schedule[0], "weekday": weekday},
    ).fetchall()

    for block in break_blocks:
        block_start = datetime.combine(local_start.date(), block[0], tzinfo=schedule_tz)
        block_end = datetime.combine(local_start.date(), block[1], tzinfo=schedule_tz)
        if local_start < block_end and local_end > block_start:
            raise HTTPException(status_code=400, detail="Time overlaps a staff break")
    
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

    exception_result = db.execute(
        """
        SELECT id FROM staff_exceptions
        WHERE staff_id = :staff_id
          AND type IN ('time_off', 'blocked_time')
          AND start_utc < :end_time AND end_utc > :start_time
        """,
        {
            "staff_id": booking.staff_id,
            "start_time": booking.start_time_utc,
            "end_time": end_time_utc,
        },
    )

    if exception_result.fetchone():
        raise HTTPException(status_code=400, detail="Staff is unavailable for this time")

    hold_query = (
        "SELECT id FROM booking_holds "
        "WHERE staff_id = :staff_id "
        "AND expires_at_utc > NOW() "
        "AND start_utc < :end_time AND end_utc > :start_time"
    )
    hold_params = {
        "staff_id": booking.staff_id,
        "start_time": booking.start_time_utc,
        "end_time": end_time_utc,
    }
    if current_user.get("id"):
        hold_query += " AND (created_by IS NULL OR created_by <> :created_by)"
        hold_params["created_by"] = current_user.get("id")

    hold_result = db.execute(hold_query, hold_params)
    if hold_result.fetchone():
        raise HTTPException(status_code=400, detail="Time slot is on hold")
    
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

    db.execute(
        """
        DELETE FROM booking_holds
        WHERE staff_id = :staff_id
          AND start_utc < :end_time
          AND end_utc > :start_time
          AND (created_by IS NULL OR created_by = :created_by)
        """,
        {
            "staff_id": booking.staff_id,
            "start_time": booking.start_time_utc,
            "end_time": end_time_utc,
            "created_by": current_user.get("id"),
        },
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
