from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.auth import get_current_user, require_roles

router = APIRouter()


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserStatusUpdate(BaseModel):
    is_active: bool


def _ensure_self_or_admin(current_user: dict, user_id: str) -> None:
    if current_user.get("role") in {"admin", "superadmin"}:
        return
    if current_user.get("id") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("/users", response_model=List[UserResponse])
def list_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    query = """
        SELECT id, email, full_name, role, phone, avatar_url, timezone, is_active, created_at
        FROM users
        WHERE 1=1
    """
    params = {"skip": skip, "limit": limit}

    if role:
        query += " AND role = :role"
        params["role"] = role
    if is_active is not None:
        query += " AND is_active = :is_active"
        params["is_active"] = is_active

    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"

    result = db.execute(text(query), params)
    return [dict(row._mapping) for row in result.fetchall()]


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_self_or_admin(current_user, user_id)

    result = db.execute(
        text(
            """
            SELECT id, email, full_name, role, phone, avatar_url, timezone, is_active, created_at
            FROM users
            WHERE id = :id
            """
        ),
        {"id": user_id},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    return dict(result._mapping)


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_admin = current_user.get("role") in {"admin", "superadmin"}
    _ensure_self_or_admin(current_user, user_id)

    if not is_admin and (payload.role is not None or payload.is_active is not None):
        raise HTTPException(status_code=403, detail="Forbidden")

    updates = []
    params = {"id": user_id}

    if payload.full_name is not None:
        updates.append("full_name = :full_name")
        params["full_name"] = payload.full_name
    if payload.phone is not None:
        updates.append("phone = :phone")
        params["phone"] = payload.phone
    if payload.avatar_url is not None:
        updates.append("avatar_url = :avatar_url")
        params["avatar_url"] = payload.avatar_url
    if payload.timezone is not None:
        updates.append("timezone = :timezone")
        params["timezone"] = payload.timezone
    if is_admin and payload.role is not None:
        updates.append("role = :role")
        params["role"] = payload.role
    if is_admin and payload.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = payload.is_active

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    query = f"""
        UPDATE users
        SET {", ".join(updates)}
        WHERE id = :id
        RETURNING id, email, full_name, role, phone, avatar_url, timezone, is_active, created_at
    """
    updated = db.execute(text(query), params).fetchone()
    db.commit()

    return dict(updated._mapping)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    updated = db.execute(
        text(
            """
            UPDATE users
            SET is_active = :is_active
            WHERE id = :id
            RETURNING id, email, full_name, role, phone, avatar_url, timezone, is_active, created_at
            """
        ),
        {"id": user_id, "is_active": payload.is_active},
    ).fetchone()
    db.commit()

    if not updated:
        raise HTTPException(status_code=404, detail="User not found")

    return dict(updated._mapping)
