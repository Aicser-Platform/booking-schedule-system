from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user, require_permissions, require_roles, is_admin
from app.models.schemas import StaffServiceCreate, StaffServiceResponse
import uuid

router = APIRouter()

def _ensure_staff_or_admin(current_user: dict, staff_id: str) -> None:
    if is_admin(current_user):
        return
    if current_user.get("id") != staff_id:
        raise HTTPException(status_code=403, detail="Forbidden")

@router.get("/dashboard")
async def staff_dashboard(
    current_user: dict = Depends(require_roles("staff", "admin", "superadmin")),
    db: Session = Depends(get_db),
):
    """Staff dashboard summary (staff/admin only)"""
    staff_id = current_user.get("id")

    today_result = db.execute(
        """
        SELECT b.id, b.start_time_utc, b.status,
               s.name as service_name, s.duration_minutes, s.price,
               c.full_name as customer_name, c.phone as customer_phone, c.email as customer_email
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE b.staff_id = :staff_id
          AND DATE(b.start_time_utc) = CURRENT_DATE
        ORDER BY b.start_time_utc ASC
        """,
        {"staff_id": staff_id},
    )

    upcoming_result = db.execute(
        """
        SELECT b.id, b.start_time_utc, b.status,
               s.name as service_name, s.duration_minutes, s.price,
               c.full_name as customer_name, c.phone as customer_phone, c.email as customer_email
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE b.staff_id = :staff_id
          AND b.start_time_utc > NOW()
        ORDER BY b.start_time_utc ASC
        LIMIT 20
        """,
        {"staff_id": staff_id},
    )

    stats_result = db.execute(
        """
        SELECT COUNT(*) as total_bookings,
               COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN s.price ELSE 0 END), 0) as total_revenue
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.staff_id = :staff_id
        """,
        {"staff_id": staff_id},
    ).fetchone()

    def format_booking(row):
        return {
            "id": row[0],
            "start_time_utc": row[1],
            "status": row[2],
            "services": {
                "name": row[3],
                "duration_minutes": row[4],
                "price": row[5],
            },
            "customers": {
                "full_name": row[6],
                "phone": row[7],
                "email": row[8],
            },
        }

    return {
        "todayBookings": [format_booking(row) for row in today_result.fetchall()],
        "upcomingBookings": [format_booking(row) for row in upcoming_result.fetchall()],
        "totalRevenue": float(stats_result[1] or 0),
        "totalBookings": int(stats_result[0] or 0),
    }

@router.post("/services", response_model=StaffServiceResponse)
async def assign_staff_to_service(
    assignment: StaffServiceCreate,
    current_user: dict = Depends(require_permissions("staff:manage")),
    db: Session = Depends(get_db)
):
    """Assign a staff member to a service (Admin only)"""
    assignment_id = str(uuid.uuid4())
    
    try:
        db.execute(
            """
            INSERT INTO staff_services (id, staff_id, service_id)
            VALUES (:id, :staff_id, :service_id)
            """,
            {
                "id": assignment_id,
                "staff_id": assignment.staff_id,
                "service_id": assignment.service_id,
            }
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Assignment already exists or invalid IDs")
    
    result = db.execute(
        "SELECT * FROM staff_services WHERE id = :id",
        {"id": assignment_id}
    )
    return dict(result.fetchone()._mapping)

@router.get("/services/{staff_id}", response_model=List[dict])
async def get_staff_services(
    staff_id: str,
    current_user: dict = Depends(require_roles("staff", "admin", "superadmin")),
    db: Session = Depends(get_db),
):
    """Get all services assigned to a staff member"""
    _ensure_staff_or_admin(current_user, staff_id)
    result = db.execute(
        """
        SELECT s.*, ss.id as assignment_id
        FROM services s
        JOIN staff_services ss ON s.id = ss.service_id
        WHERE ss.staff_id = :staff_id AND s.is_active = TRUE
        """,
        {"staff_id": staff_id}
    )
    
    services = result.fetchall()
    return [dict(row._mapping) for row in services]

@router.delete("/services/{assignment_id}")
async def remove_staff_from_service(
    assignment_id: str,
    current_user: dict = Depends(require_permissions("staff:manage")),
    db: Session = Depends(get_db),
):
    """Remove a staff member from a service (Admin only)"""
    result = db.execute(
        "DELETE FROM staff_services WHERE id = :id",
        {"id": assignment_id}
    )
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    return {"message": "Staff removed from service"}

@router.get("/{service_id}/staff", response_model=List[dict])
async def get_service_staff(service_id: str, db: Session = Depends(get_db)):
    """Get all staff members assigned to a service"""
    result = db.execute(
        """
        SELECT u.id, u.full_name, u.phone, u.avatar_url, u.role, ss.id as assignment_id
        FROM users u
        JOIN staff_services ss ON u.id = ss.staff_id
        WHERE ss.service_id = :service_id AND u.is_active = TRUE
        """,
        {"service_id": service_id}
    )
    
    staff = result.fetchall()
    return [
        {
            "id": row[0],
            "full_name": row[1],
            "phone": row[2],
            "avatar_url": row[3],
            "role": row[4],
            "assignment_id": row[5],
        }
        for row in staff
    ]
