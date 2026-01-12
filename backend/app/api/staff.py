from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.schemas import StaffServiceCreate, StaffServiceResponse
import uuid

router = APIRouter()

@router.post("/services", response_model=StaffServiceResponse)
async def assign_staff_to_service(
    assignment: StaffServiceCreate,
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
async def get_staff_services(staff_id: str, db: Session = Depends(get_db)):
    """Get all services assigned to a staff member"""
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
async def remove_staff_from_service(assignment_id: str, db: Session = Depends(get_db)):
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
        SELECT up.*, ss.id as assignment_id
        FROM user_profiles up
        JOIN staff_services ss ON up.id = ss.staff_id
        WHERE ss.service_id = :service_id AND up.is_active = TRUE
        """,
        {"service_id": service_id}
    )
    
    staff = result.fetchall()
    return [dict(row._mapping) for row in staff]
