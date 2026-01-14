from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user, is_admin
from app.models.schemas import NotificationCreate, NotificationResponse
import uuid
from datetime import datetime

router = APIRouter()

def _get_customer_id(db: Session, user_id: str) -> str | None:
    record = db.execute(
        "SELECT id FROM customers WHERE user_id = :user_id",
        {"user_id": user_id},
    ).fetchone()
    return record[0] if record else None

def _ensure_booking_access(db: Session, booking_id: str, current_user: dict) -> None:
    record = db.execute(
        "SELECT staff_id, customer_id FROM bookings WHERE id = :id",
        {"id": booking_id},
    ).fetchone()

    if not record:
        raise HTTPException(status_code=404, detail="Booking not found")

    if is_admin(current_user):
        return

    role = current_user.get("role")
    if role == "staff":
        if record[0] != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Forbidden")
        return

    if role == "customer":
        customer_id = _get_customer_id(db, current_user.get("id"))
        if not customer_id or record[1] != customer_id:
            raise HTTPException(status_code=403, detail="Forbidden")
        return

    raise HTTPException(status_code=403, detail="Forbidden")

@router.post("/", response_model=NotificationResponse)
async def send_notification(
    notification: NotificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a notification (Mock - just logs to database)"""
    if current_user.get("role") not in {"staff", "admin", "superadmin"}:
        raise HTTPException(status_code=403, detail="Forbidden")
    notification_id = str(uuid.uuid4())
    
    # In production, this would integrate with email/SMS providers
    # For now, we'll just log it as "sent"
    db.execute(
        """
        INSERT INTO notifications (id, booking_id, channel, type, recipient, status, sent_at)
        VALUES (:id, :booking_id, :channel, :type, :recipient, 'sent', :sent_at)
        """,
        {
            "id": notification_id,
            "booking_id": notification.booking_id,
            "channel": notification.channel,
            "type": notification.type,
            "recipient": notification.recipient,
            "sent_at": datetime.utcnow(),
        }
    )
    db.commit()
    
    result = db.execute(
        "SELECT * FROM notifications WHERE id = :id",
        {"id": notification_id}
    )
    return dict(result.fetchone()._mapping)

@router.get("/booking/{booking_id}")
async def get_booking_notifications(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all notifications for a booking"""
    _ensure_booking_access(db, booking_id, current_user)
    result = db.execute(
        "SELECT * FROM notifications WHERE booking_id = :booking_id ORDER BY created_at DESC",
        {"booking_id": booking_id}
    )
    
    notifications = result.fetchall()
    return [dict(row._mapping) for row in notifications]
