from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import require_roles
from app.models.schemas import ServiceCreate, ServiceUpdate, ServiceResponse
import uuid

router = APIRouter()

@router.get("/", response_model=List[ServiceResponse])
async def get_services(
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all services"""
    query = "SELECT * FROM services"
    if active_only:
        query += " WHERE is_active = TRUE"
    query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {skip}"
    
    result = db.execute(query)
    services = result.fetchall()
    return [dict(row._mapping) for row in services]

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: str, db: Session = Depends(get_db)):
    """Get service by ID"""
    result = db.execute(
        "SELECT * FROM services WHERE id = :id",
        {"id": service_id}
    )
    service = result.fetchone()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return dict(service._mapping)

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db)
):
    """Create a new service (Admin only)"""
    service_id = str(uuid.uuid4())
    
    db.execute(
        """
        INSERT INTO services (id, admin_id, name, description, duration_minutes, 
                            price, deposit_amount, buffer_minutes, max_capacity, is_active)
        VALUES (:id, :admin_id, :name, :description, :duration_minutes, 
                :price, :deposit_amount, :buffer_minutes, :max_capacity, :is_active)
        """,
        {
            "id": service_id,
            "admin_id": current_user.get("id"),
            "name": service.name,
            "description": service.description,
            "duration_minutes": service.duration_minutes,
            "price": service.price,
            "deposit_amount": service.deposit_amount,
            "buffer_minutes": service.buffer_minutes,
            "max_capacity": service.max_capacity,
            "is_active": service.is_active,
        }
    )
    db.commit()
    
    return await get_service(service_id, db)

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    service: ServiceUpdate,
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db)
):
    """Update a service (Admin only)"""
    # Build update query dynamically
    updates = []
    params = {"id": service_id}
    
    if service.name is not None:
        updates.append("name = :name")
        params["name"] = service.name
    if service.description is not None:
        updates.append("description = :description")
        params["description"] = service.description
    if service.duration_minutes is not None:
        updates.append("duration_minutes = :duration_minutes")
        params["duration_minutes"] = service.duration_minutes
    if service.price is not None:
        updates.append("price = :price")
        params["price"] = service.price
    if service.deposit_amount is not None:
        updates.append("deposit_amount = :deposit_amount")
        params["deposit_amount"] = service.deposit_amount
    if service.buffer_minutes is not None:
        updates.append("buffer_minutes = :buffer_minutes")
        params["buffer_minutes"] = service.buffer_minutes
    if service.max_capacity is not None:
        updates.append("max_capacity = :max_capacity")
        params["max_capacity"] = service.max_capacity
    if service.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = service.is_active
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = f"UPDATE services SET {', '.join(updates)} WHERE id = :id"
    db.execute(query, params)
    db.commit()
    
    return await get_service(service_id, db)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    """Delete a service (Admin only)"""
    result = db.execute(
        "DELETE FROM services WHERE id = :id",
        {"id": service_id}
    )
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return None

@router.get("/{service_id}/staff")
async def get_service_staff(service_id: str, db: Session = Depends(get_db)):
    """Get staff assigned to a service"""
    result = db.execute(
        """
        SELECT u.id, u.full_name
        FROM staff_services ss
        JOIN users u ON u.id = ss.staff_id
        WHERE ss.service_id = :service_id AND u.is_active = TRUE
        ORDER BY u.full_name
        """,
        {"service_id": service_id},
    )

    return [
        {"id": row[0], "name": row[1] or "Staff Member"}
        for row in result.fetchall()
    ]
