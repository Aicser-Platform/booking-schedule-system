from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import NotificationCreate, NotificationResponse
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=NotificationResponse)
async def send_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):
    """Send a notification (Mock - just logs to database)"""
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
async def get_booking_notifications(booking_id: str, db: Session = Depends(get_db)):
    """Get all notifications for a booking"""
    result = db.execute(
        "SELECT * FROM notifications WHERE booking_id = :booking_id ORDER BY created_at DESC",
        {"booking_id": booking_id}
    )
    
    notifications = result.fetchall()
    return [dict(row._mapping) for row in notifications]
