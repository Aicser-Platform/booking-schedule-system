from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Response,
    Header,
    Body,
    Cookie,
)
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets
import uuid
import hashlib
import httpx

from app.core.database import get_db
from app.core.auth import get_current_user, resolve_token
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SESSION_DAYS = 30
RESET_TOKEN_MINUTES = 60


# =========================
# Schemas
# =========================

class SignupBody(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequestBody(BaseModel):
    email: EmailStr


class PasswordResetConfirmBody(BaseModel):
    token: str
    new_password: str


class ProfileUpdateBody(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str


class GoogleLoginBody(BaseModel):
    credential: Optional[str] = None
    id_token: Optional[str] = None


# =========================
# Helpers
# =========================

def create_session_token() -> str:
    return secrets.token_hex(32)


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_google_token(id_token: str) -> dict:
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google login is not configured")

    try:
        res = httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
            timeout=10.0,
        )
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Unable to verify Google token")

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    payload = res.json()
    if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google token missing email")

    email_verified = payload.get("email_verified")
    if email_verified not in (True, "true", "True", "1", 1):
        raise HTTPException(status_code=401, detail="Google email not verified")

    return payload


# =========================
# Signup
# =========================

@router.post("/signup")
def signup(
    response: Response,
    payload: SignupBody = Body(...),
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

    user_id = str(uuid.uuid4())
    role = "customer"

    role_exists = db.execute(
        text("SELECT 1 FROM roles WHERE name = :role"),
        {"role": role},
    ).fetchone()
    if not role_exists:
        raise HTTPException(status_code=500, detail="Default role is not configured")

    user = db.execute(
        text("""
            INSERT INTO users (id, email, full_name, role, phone, timezone, password_hash)
            VALUES (:id, :email, :full_name, :role, :phone, :timezone, :password_hash)
            RETURNING id, email, full_name, role, phone, avatar_url, timezone
        """),
        {
            "id": user_id,
            "email": payload.email,
            "full_name": payload.full_name,
            "role": role,
            "phone": payload.phone,
            "timezone": payload.timezone,
            "password_hash": password_hash,
        },
    ).fetchone()

    token = create_session_token()
    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)

    db.execute(
        text("""
            INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (:id, :user_id, :token, :expires_at)
        """),
        {
            "id": str(uuid.uuid4()),
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
    response: Response,
    payload: LoginBody = Body(...),
    db: Session = Depends(get_db),
):
    user = db.execute(
        text("""
            SELECT id, email, full_name, role, phone, avatar_url, timezone, password_hash, is_active
            FROM users
            WHERE email = :email
        """),
        {"email": payload.email},
    ).fetchone()

    if not user or not user.password_hash or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_session_token()
    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)

    db.execute(
        text("""
            INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (:id, :user_id, :token, :expires_at)
        """),
        {
            "id": str(uuid.uuid4()),
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
# Google login
# =========================

@router.post("/google")
def google_login(
    response: Response,
    payload: GoogleLoginBody = Body(...),
    db: Session = Depends(get_db),
):
    token = payload.credential or payload.id_token
    if not token:
        raise HTTPException(status_code=400, detail="Missing Google credential")

    data = verify_google_token(token)

    email = data.get("email")
    full_name = data.get("name")
    avatar_url = data.get("picture")

    user = db.execute(
        text(
            """
            SELECT id, email, full_name, role, phone, avatar_url, timezone, password_hash, is_active
            FROM users
            WHERE email = :email
            """
        ),
        {"email": email},
    ).fetchone()

    if not user:
        role = "customer"
        role_exists = db.execute(
            text("SELECT 1 FROM roles WHERE name = :role"),
            {"role": role},
        ).fetchone()
        if not role_exists:
            raise HTTPException(status_code=500, detail="Default role is not configured")

        user_id = str(uuid.uuid4())
        user = db.execute(
            text(
                """
                INSERT INTO users (id, email, full_name, role, avatar_url)
                VALUES (:id, :email, :full_name, :role, :avatar_url)
                RETURNING id, email, full_name, role, phone, avatar_url, timezone
                """
            ),
            {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "role": role,
                "avatar_url": avatar_url,
            },
        ).fetchone()
    else:
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is disabled")
        if avatar_url and not user.avatar_url:
            db.execute(
                text("UPDATE users SET avatar_url = :avatar_url WHERE id = :id"),
                {"avatar_url": avatar_url, "id": user.id},
            )

    token = create_session_token()
    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)

    db.execute(
        text(
            """
            INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (:id, :user_id, :token, :expires_at)
            """
        ),
        {
            "id": str(uuid.uuid4()),
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
    current_user: dict = Depends(get_current_user),
):
    return current_user


@router.patch("/me")
def update_me(
    payload: ProfileUpdateBody,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updates = []
    params = {"id": current_user["id"]}

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

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    query = f"""
        UPDATE users
        SET {", ".join(updates)}
        WHERE id = :id
        RETURNING id, email, full_name, role, phone, avatar_url, timezone
    """
    updated = db.execute(text(query), params).fetchone()
    db.commit()

    return dict(updated._mapping)


@router.post("/change-password")
def change_password(
    response: Response,
    payload: ChangePasswordBody,
    current_user: dict = Depends(get_current_user),
    authorization: Optional[str] = Header(None),
    auth_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    record = db.execute(
        text("SELECT password_hash FROM users WHERE id = :id"),
        {"id": current_user["id"]},
    ).fetchone()

    if not record or not record.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(payload.current_password, record.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    password_hash = pwd_context.hash(payload.new_password)
    db.execute(
        text("UPDATE users SET password_hash = :password_hash WHERE id = :id"),
        {"password_hash": password_hash, "id": current_user["id"]},
    )

    token = resolve_token(authorization, auth_token)
    if token:
        db.execute(
            text(
                """
                DELETE FROM sessions
                WHERE user_id = :user_id AND token != :token
                """
            ),
            {"user_id": current_user["id"], "token": token},
        )
    else:
        db.execute(
            text("DELETE FROM sessions WHERE user_id = :user_id"),
            {"user_id": current_user["id"]},
        )

    db.commit()

    response.delete_cookie("auth_token", path="/")
    response.set_cookie(
        key="auth_token",
        value=token or "",
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
        max_age=SESSION_DAYS * 24 * 60 * 60,
    )

    return {"message": "Password updated"}


@router.post("/password-reset/request")
def request_password_reset(
    payload: PasswordResetRequestBody,
    db: Session = Depends(get_db),
):
    user = db.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": payload.email},
    ).fetchone()

    reset_token = None
    if user:
        reset_token = secrets.token_urlsafe(32)
        token_hash = hash_reset_token(reset_token)
        expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_MINUTES)

        db.execute(
            text(
                """
                INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
                VALUES (:id, :user_id, :token_hash, :expires_at)
                """
            ),
            {
                "id": str(uuid.uuid4()),
                "user_id": user.id,
                "token_hash": token_hash,
                "expires_at": expires_at,
            },
        )
        db.commit()

    response = {"message": "If the account exists, a reset link will be sent."}
    if settings.DEBUG and reset_token:
        response["reset_token"] = reset_token
        response["expires_in_minutes"] = RESET_TOKEN_MINUTES

    return response


@router.post("/password-reset/confirm")
def confirm_password_reset(
    payload: PasswordResetConfirmBody,
    db: Session = Depends(get_db),
):
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    token_hash = hash_reset_token(payload.token)
    record = db.execute(
        text(
            """
            SELECT id, user_id, expires_at, used_at
            FROM password_reset_tokens
            WHERE token_hash = :token_hash
            """
        ),
        {"token_hash": token_hash},
    ).fetchone()

    if not record or record.used_at is not None or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    password_hash = pwd_context.hash(payload.new_password)

    db.execute(
        text("UPDATE users SET password_hash = :password_hash WHERE id = :user_id"),
        {"password_hash": password_hash, "user_id": record.user_id},
    )
    db.execute(
        text("UPDATE password_reset_tokens SET used_at = :used_at WHERE id = :id"),
        {"used_at": datetime.utcnow(), "id": record.id},
    )
    db.execute(
        text("DELETE FROM sessions WHERE user_id = :user_id"),
        {"user_id": record.user_id},
    )
    db.commit()

    return {"message": "Password updated"}


# =========================
# Logout
# =========================

@router.post("/logout")
def logout(
    response: Response,
    authorization: Optional[str] = Header(None),
    auth_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    token = resolve_token(authorization, auth_token)
    if token:
        db.execute(text("DELETE FROM sessions WHERE token = :token"), {"token": token})
        db.commit()

    response.delete_cookie("auth_token", path="/")
    return {"success": True}


@router.post("/logout-all")
def logout_all(
    response: Response,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(
        text("DELETE FROM sessions WHERE user_id = :user_id"),
        {"user_id": current_user["id"]},
    )
    db.commit()
    response.delete_cookie("auth_token", path="/")
    return {"success": True}
