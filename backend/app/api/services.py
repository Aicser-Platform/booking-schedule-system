from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
from app.core.database import get_db
from app.core.auth import require_permissions
from app.models.schemas import ServiceCreate, ServiceUpdate, ServiceResponse
import uuid

router = APIRouter()

_uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
_uploads_dir.mkdir(parents=True, exist_ok=True)


def _normalize_service_row(row: dict) -> dict:
    if row.get("id") is not None:
        row["id"] = str(row["id"])
    if row.get("admin_id") is not None:
        row["admin_id"] = str(row["admin_id"])
    return row

@router.get("/", response_model=List[ServiceResponse])
async def get_services(
    active_only: bool = True,
    search: str | None = None,
    category: str | None = None,
    tag: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_duration: int | None = None,
    max_duration: int | None = None,
    require_staff: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all services"""
    conditions = ["is_archived = FALSE"]
    params: dict[str, object] = {"limit": limit, "skip": skip}
    if active_only:
        conditions.append(
            "is_active = TRUE"
            " AND NOT (paused_from IS NOT NULL"
            " AND paused_from <= NOW()"
            " AND (paused_until IS NULL OR paused_until >= NOW()))"
        )
    if search:
        params["search"] = f"%{search}%"
        conditions.append(
            "(name ILIKE :search"
            " OR COALESCE(public_name, '') ILIKE :search"
            " OR COALESCE(description, '') ILIKE :search)"
        )
    if category:
        params["category"] = category
        conditions.append("category = :category")
    if tag:
        params["tag"] = tag
        conditions.append(":tag = ANY(tags)")
    if min_price is not None:
        params["min_price"] = min_price
        conditions.append("price >= :min_price")
    if max_price is not None:
        params["max_price"] = max_price
        conditions.append("price <= :max_price")
    if min_duration is not None:
        params["min_duration"] = min_duration
        conditions.append("duration_minutes >= :min_duration")
    if max_duration is not None:
        params["max_duration"] = max_duration
        conditions.append("duration_minutes <= :max_duration")
    if require_staff:
        conditions.append(
            "EXISTS ("
            "SELECT 1 FROM staff_services ss "
            "JOIN users u ON u.id = ss.staff_id "
            "WHERE ss.service_id = services.id "
            "AND u.is_active = TRUE "
            "AND ss.is_bookable = TRUE "
            "AND ss.is_temporarily_unavailable = FALSE "
            "AND ss.admin_only = FALSE)"
        )

    query = "SELECT * FROM services WHERE " + " AND ".join(conditions)
    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"

    result = db.execute(text(query), params)
    services = result.fetchall()
    return [_normalize_service_row(dict(row._mapping)) for row in services]

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: str, db: Session = Depends(get_db)):
    """Get service by ID"""
    result = db.execute(
        text("SELECT * FROM services WHERE id = :id AND is_archived = FALSE"),
        {"id": service_id},
    )
    service = result.fetchone()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return _normalize_service_row(dict(service._mapping))

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    current_user: dict = Depends(require_permissions("services:manage")),
    db: Session = Depends(get_db)
):
    """Create a new service (Admin only)"""
    service_id = str(uuid.uuid4())
    
    db.execute(
        text(
            """
            INSERT INTO services (
                id, admin_id, name, public_name, internal_name, category, tags,
                description, inclusions, prep_notes, duration_minutes,
                price, deposit_amount, buffer_minutes, max_capacity, is_active, image_url,
                is_archived, paused_from, paused_until
            )
            VALUES (
                :id, :admin_id, :name, :public_name, :internal_name, :category, :tags,
                :description, :inclusions, :prep_notes, :duration_minutes,
                :price, :deposit_amount, :buffer_minutes, :max_capacity, :is_active, :image_url,
                :is_archived, :paused_from, :paused_until
            )
            """
        ),
        {
            "id": service_id,
            "admin_id": current_user.get("id"),
            "name": service.name,
            "public_name": service.public_name,
            "internal_name": service.internal_name,
            "category": service.category,
            "tags": service.tags,
            "description": service.description,
            "inclusions": service.inclusions,
            "prep_notes": service.prep_notes,
            "duration_minutes": service.duration_minutes,
            "price": service.price,
            "deposit_amount": service.deposit_amount,
            "buffer_minutes": service.buffer_minutes,
            "max_capacity": service.max_capacity,
            "is_active": service.is_active,
            "image_url": service.image_url,
            "is_archived": False,
            "paused_from": None,
            "paused_until": None,
        },
    )
    db.commit()
    
    return await get_service(service_id, db)

@router.post("/upload-image")
async def upload_service_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_permissions("services:manage")),
):
    """Upload a service image and return its URL (Admin only)"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    extension = Path(file.filename or "").suffix.lower()
    if extension == "":
        extension = ".jpg"

    filename = f"{uuid.uuid4()}{extension}"
    destination = _uploads_dir / filename

    contents = await file.read()
    destination.write_bytes(contents)

    base_url = str(request.base_url).rstrip("/")
    return {"image_url": f"{base_url}/uploads/{filename}"}

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    service: ServiceUpdate,
    current_user: dict = Depends(require_permissions("services:manage")),
    db: Session = Depends(get_db)
):
    """Update a service (Admin only)"""
    # Build update query dynamically
    updates = []
    params = {"id": service_id}
    
    if service.name is not None:
        updates.append("name = :name")
        params["name"] = service.name
    if service.public_name is not None:
        updates.append("public_name = :public_name")
        params["public_name"] = service.public_name
    if service.internal_name is not None:
        updates.append("internal_name = :internal_name")
        params["internal_name"] = service.internal_name
    if service.category is not None:
        updates.append("category = :category")
        params["category"] = service.category
    if service.tags is not None:
        updates.append("tags = :tags")
        params["tags"] = service.tags
    if service.description is not None:
        updates.append("description = :description")
        params["description"] = service.description
    if service.inclusions is not None:
        updates.append("inclusions = :inclusions")
        params["inclusions"] = service.inclusions
    if service.prep_notes is not None:
        updates.append("prep_notes = :prep_notes")
        params["prep_notes"] = service.prep_notes
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
    if service.image_url is not None:
        updates.append("image_url = :image_url")
        params["image_url"] = service.image_url
    if service.paused_from is not None:
        updates.append("paused_from = :paused_from")
        params["paused_from"] = service.paused_from
    if service.paused_until is not None:
        updates.append("paused_until = :paused_until")
        params["paused_until"] = service.paused_until
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = f"UPDATE services SET {', '.join(updates)} WHERE id = :id"
    db.execute(text(query), params)
    db.commit()
    
    return await get_service(service_id, db)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    current_user: dict = Depends(require_permissions("services:manage")),
    db: Session = Depends(get_db),
):
    """Archive a service (Admin only)"""
    upcoming = db.execute(
        text(
            """
            SELECT COUNT(1)
            FROM bookings
            WHERE service_id = :id
              AND start_time_utc > NOW()
              AND status IN ('pending', 'confirmed')
            """
        ),
        {"id": service_id},
    ).scalar()

    if upcoming and upcoming > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot archive service with future bookings",
        )

    result = db.execute(
        text(
            """
            UPDATE services
            SET is_archived = TRUE,
                archived_at = NOW(),
                is_active = FALSE
            WHERE id = :id AND is_archived = FALSE
            """
        ),
        {"id": service_id},
    )
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Service not found")

    return None

@router.get("/{service_id}/staff")
async def get_service_staff(service_id: str, db: Session = Depends(get_db)):
    """Get staff assigned to a service"""
    result = db.execute(
        text(
            """
            SELECT u.id, u.full_name
            FROM staff_services ss
            JOIN users u ON u.id = ss.staff_id
            WHERE ss.service_id = :service_id AND u.is_active = TRUE
              AND ss.is_bookable = TRUE
              AND ss.is_temporarily_unavailable = FALSE
              AND ss.admin_only = FALSE
            ORDER BY u.full_name
            """
        ),
        {"service_id": service_id},
    )

    return [
        {"id": row[0], "name": row[1] or "Staff Member"}
        for row in result.fetchall()
    ]
