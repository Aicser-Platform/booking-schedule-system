from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db

router = APIRouter()


class UserProfileCreate(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None
    role: str = "customer"
    phone: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    full_name: Optional[str]
    role: str
    phone: Optional[str]
    avatar_url: Optional[str]


@router.post("/users/profile")
async def create_user_profile(profile: UserProfileCreate):
    """Create a user profile in PostgreSQL after Supabase auth signup"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            INSERT INTO user_profiles (id, full_name, phone, role, is_active)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE
            SET full_name = EXCLUDED.full_name,
                phone = EXCLUDED.phone,
                role = EXCLUDED.role
            RETURNING id, full_name, role, phone, avatar_url
        """, (profile.user_id, profile.full_name, profile.phone, profile.role, True))
        
        result = cur.fetchone()
        conn.commit()
        
        return {
            "id": result[0],
            "full_name": result[1],
            "role": result[2],
            "phone": result[3],
            "avatar_url": result[4],
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@router.get("/users/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str):
    """Get user profile from PostgreSQL"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, full_name, role, phone, avatar_url
            FROM user_profiles
            WHERE id = %s
        """, (user_id,))
        
        result = cur.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return {
            "id": result[0],
            "full_name": result[1],
            "role": result[2],
            "phone": result[3],
            "avatar_url": result[4],
        }
    finally:
        cur.close()
        conn.close()
