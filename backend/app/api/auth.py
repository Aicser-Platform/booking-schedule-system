from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Response,
    Header,
    Body,
)
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets

from app.core.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SESSION_DAYS = 30


# =========================
# Schemas
# =========================

class SignupBody(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "customer"
    phone: Optional[str] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


# =========================
# Helpers
# =========================

def create_session_token() -> str:
    return secrets.token_hex(32)


# =========================
# Signup
# =========================

@router.post("/signup")
def signup(
    payload: SignupBody = Body(...),
    response: Response = None,
    db: Session = Depends(get_db),
):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    exists = db.execute(
        text("SELECT 1 FROM users WHERE email = :email"),
        {"email": payload.email},
    ).fetchone()

    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")

    password_hash = pwd_context.hash(payload.password)

    user = db.execute(
        text("""
            INSERT INTO users (email, full_name, role, phone, password_hash)
            VALUES (:email, :full_name, :role, :phone, :password_hash)
            RETURNING id, email, full_name, role, phone, avatar_url
        """),
        {
            "email": payload.email,
            "full_name": payload.full_name,
            "role": payload.role,
            "phone": payload.phone,
            "password_hash": password_hash,
        },
    ).fetchone()

    token = create_session_token()
    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)

    db.execute(
        text("""
            INSERT INTO sessions (user_id, token, expires_at)
            VALUES (:user_id, :token, :expires_at)
        """),
        {
            "user_id": user.id,
            "token": token,
            "expires_at": expires_at,
        },
    )
    db.commit()

    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,   # set True in production (HTTPS)
        path="/",
        max_age=SESSION_DAYS * 24 * 60 * 60,
    )

    return {"user": dict(user._mapping)}


# =========================
# Login
# =========================

@router.post("/login")
def login(
    payload: LoginBody = Body(...),
    response: Response = None,
    db: Session = Depends(get_db),
):
    user = db.execute(
        text("""
            SELECT id, email, full_name, role, phone, avatar_url, password_hash
            FROM users
            WHERE email = :email
        """),
        {"email": payload.email},
    ).fetchone()

    if not user or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_session_token()
    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)

    db.execute(
        text("""
            INSERT INTO sessions (user_id, token, expires_at)
            VALUES (:user_id, :token, :expires_at)
        """),
        {
            "user_id": user.id,
            "token": token,
            "expires_at": expires_at,
        },
    )
    db.commit()

    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
        max_age=SESSION_DAYS * 24 * 60 * 60,
    )

    return {"user": dict(user._mapping)}


# =========================
# Get current user
# =========================

@router.get("/me")
def me(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.replace("Bearer ", "")

    user = db.execute(
        text("""
            SELECT u.id, u.email, u.full_name, u.role, u.phone, u.avatar_url
            FROM users u
            JOIN sessions s ON s.user_id = u.id
            WHERE s.token = :token AND s.expires_at > NOW()
        """),
        {"token": token},
    ).fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    return dict(user._mapping)


# =========================
# Logout
# =========================

@router.post("/logout")
def logout(
    response: Response,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        db.execute(
            text("DELETE FROM sessions WHERE token = :token"),
            {"token": token},
        )
        db.commit()

    response.delete_cookie("auth_token", path="/")
    return {"success": True}
