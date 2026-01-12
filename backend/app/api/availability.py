from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date, time, timedelta
from app.core.database import get_db
from app.models.schemas import (
    AvailabilityRuleCreate, AvailabilityRuleResponse,
    AvailabilityExceptionCreate, AvailabilityExceptionResponse,
    AvailableSlot
)
import uuid

router = APIRouter()

@router.post("/rules", response_model=AvailabilityRuleResponse)
async def create_availability_rule(
    rule: AvailabilityRuleCreate,
    db: Session = Depends(get_db)
):
    """Create availability rule for staff"""
    rule_id = str(uuid.uuid4())
    
    db.execute(
        """
        INSERT INTO availability_rules (id, staff_id, service_id, day_of_week, 
                                       start_time, end_time, timezone)
        VALUES (:id, :staff_id, :service_id, :day_of_week, :start_time, :end_time, :timezone)
        """,
        {
            "id": rule_id,
            "staff_id": rule.staff_id,
            "service_id": rule.service_id,
            "day_of_week": rule.day_of_week,
            "start_time": rule.start_time,
            "end_time": rule.end_time,
            "timezone": rule.timezone,
        }
    )
    db.commit()
    
    result = db.execute(
        "SELECT * FROM availability_rules WHERE id = :id",
        {"id": rule_id}
    )
    return dict(result.fetchone()._mapping)

@router.get("/rules/{staff_id}", response_model=List[AvailabilityRuleResponse])
async def get_staff_availability_rules(staff_id: str, db: Session = Depends(get_db)):
    """Get all availability rules for a staff member"""
    result = db.execute(
        "SELECT * FROM availability_rules WHERE staff_id = :staff_id ORDER BY day_of_week, start_time",
        {"staff_id": staff_id}
    )
    
    rules = result.fetchall()
    return [dict(row._mapping) for row in rules]

@router.delete("/rules/{rule_id}")
async def delete_availability_rule(rule_id: str, db: Session = Depends(get_db)):
    """Delete an availability rule"""
    result = db.execute(
        "DELETE FROM availability_rules WHERE id = :id",
        {"id": rule_id}
    )
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    return {"message": "Availability rule deleted"}

@router.post("/exceptions", response_model=AvailabilityExceptionResponse)
async def create_availability_exception(
    exception: AvailabilityExceptionCreate,
    db: Session = Depends(get_db)
):
    """Create availability exception (holiday, blocked time, etc.)"""
    exception_id = str(uuid.uuid4())
    
    db.execute(
        """
        INSERT INTO availability_exceptions (id, staff_id, service_id, date, 
                                            is_available, start_time, end_time, reason)
        VALUES (:id, :staff_id, :service_id, :date, :is_available, :start_time, :end_time, :reason)
        """,
        {
            "id": exception_id,
            "staff_id": exception.staff_id,
            "service_id": exception.service_id,
            "date": exception.date,
            "is_available": exception.is_available,
            "start_time": exception.start_time,
            "end_time": exception.end_time,
            "reason": exception.reason,
        }
    )
    db.commit()
    
    result = db.execute(
        "SELECT * FROM availability_exceptions WHERE id = :id",
        {"id": exception_id}
    )
    return dict(result.fetchone()._mapping)

@router.get("/exceptions/{staff_id}", response_model=List[AvailabilityExceptionResponse])
async def get_staff_availability_exceptions(
    staff_id: str,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db)
):
    """Get availability exceptions for a staff member"""
    query = "SELECT * FROM availability_exceptions WHERE staff_id = :staff_id"
    params = {"staff_id": staff_id}
    
    if start_date:
        query += " AND date >= :start_date"
        params["start_date"] = start_date
    if end_date:
        query += " AND date <= :end_date"
        params["end_date"] = end_date
    
    query += " ORDER BY date"
    
    result = db.execute(query, params)
    exceptions = result.fetchall()
    return [dict(row._mapping) for row in exceptions]

@router.get("/slots", response_model=List[AvailableSlot])
async def get_available_slots(
    service_id: str,
    date: date,
    staff_id: str = None,
    db: Session = Depends(get_db)
):
    """Get available time slots for a service on a specific date"""
    # Get service details
    service_result = db.execute(
        "SELECT duration_minutes, buffer_minutes FROM services WHERE id = :id",
        {"id": service_id}
    )
    service = service_result.fetchone()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    duration = service[0]
    buffer = service[1]
    total_slot_time = duration + buffer
    
    # Get staff assigned to this service
    staff_query = "SELECT staff_id FROM staff_services WHERE service_id = :service_id"
    params = {"service_id": service_id}
    
    if staff_id:
        staff_query += " AND staff_id = :staff_id"
        params["staff_id"] = staff_id
    
    staff_result = db.execute(staff_query, params)
    staff_ids = [row[0] for row in staff_result.fetchall()]
    
    if not staff_ids:
        return []
    
    # Get day of week (0 = Sunday)
    day_of_week = date.weekday()
    if day_of_week == 6:  # Python's Monday=0, Sunday=6
        day_of_week = 0
    else:
        day_of_week += 1
    
    available_slots = []
    
    for staff_id in staff_ids:
        # Get availability rules for this staff on this day
        rules_result = db.execute(
            """
            SELECT start_time, end_time, timezone
            FROM availability_rules
            WHERE staff_id = :staff_id AND day_of_week = :day_of_week
            """,
            {"staff_id": staff_id, "day_of_week": day_of_week}
        )
        rules = rules_result.fetchall()
        
        # Check for exceptions on this date
        exception_result = db.execute(
            """
            SELECT is_available, start_time, end_time
            FROM availability_exceptions
            WHERE staff_id = :staff_id AND date = :date
            """,
            {"staff_id": staff_id, "date": date}
        )
        exception = exception_result.fetchone()
        
        # If there's an exception and staff is not available, skip
        if exception and not exception[0]:
            continue
        
        # Use exception times if available, otherwise use rules
        time_ranges = []
        if exception and exception[1] and exception[2]:
            time_ranges = [(exception[1], exception[2])]
        else:
            time_ranges = [(rule[0], rule[1]) for rule in rules]
        
        # Get existing bookings for this staff on this date
        bookings_result = db.execute(
            """
            SELECT start_time_utc, end_time_utc
            FROM bookings
            WHERE staff_id = :staff_id 
            AND DATE(start_time_utc) = :date
            AND status NOT IN ('cancelled', 'no-show')
            """,
            {"staff_id": staff_id, "date": date}
        )
        booked_times = [(row[0], row[1]) for row in bookings_result.fetchall()]
        
        # Generate available slots
        for start_time, end_time in time_ranges:
            current_time = datetime.combine(date, start_time)
            end_datetime = datetime.combine(date, end_time)
            
            while current_time + timedelta(minutes=total_slot_time) <= end_datetime:
                slot_end = current_time + timedelta(minutes=duration)
                
                # Check if slot conflicts with existing bookings
                is_available = True
                for booked_start, booked_end in booked_times:
                    if (current_time < booked_end and slot_end > booked_start):
                        is_available = False
                        break
                
                if is_available:
                    available_slots.append({
                        "start_time": current_time,
                        "end_time": slot_end,
                        "staff_id": staff_id,
                        "staff_name": None  # Can be joined from user_profiles
                    })
                
                current_time += timedelta(minutes=total_slot_time)
    
    return available_slots
