from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.schemas import PaymentCreate, PaymentResponse, PaymentIntent
import uuid
import hashlib
import time

router = APIRouter()

def generate_mock_payment_url(payment_id: str, amount: float) -> str:
    """Generate mock ABA Payway payment URL"""
    transaction_id = hashlib.md5(f"{payment_id}{time.time()}".encode()).hexdigest()
    return f"https://checkout-sandbox.payway.com.kh/payments/{transaction_id}"

@router.post("/create-intent", response_model=PaymentIntent)
async def create_payment_intent(
    payment: PaymentCreate,
    db: Session = Depends(get_db)
):
    """Create a payment intent with ABA Payway (Mock)"""
    payment_id = str(uuid.uuid4())
    transaction_id = hashlib.md5(f"{payment_id}{time.time()}".encode()).hexdigest()
    
    # Create payment record
    db.execute(
        """
        INSERT INTO payments (id, booking_id, provider, provider_reference, 
                            amount, currency, status)
        VALUES (:id, :booking_id, :provider, :provider_reference, 
                :amount, :currency, 'pending')
        """,
        {
            "id": payment_id,
            "booking_id": payment.booking_id,
            "provider": payment.provider,
            "provider_reference": transaction_id,
            "amount": payment.amount,
            "currency": payment.currency,
        }
    )
    db.commit()
    
    payment_url = generate_mock_payment_url(payment_id, float(payment.amount))
    
    return {
        "payment_url": payment_url,
        "payment_id": payment_id,
        "transaction_id": transaction_id,
    }

@router.post("/{payment_id}/confirm")
async def confirm_payment(
    payment_id: str,
    transaction_status: str = "success",
    db: Session = Depends(get_db)
):
    """Confirm payment (webhook simulation)"""
    status = "completed" if transaction_status == "success" else "failed"
    
    db.execute(
        "UPDATE payments SET status = :status WHERE id = :id",
        {"status": status, "id": payment_id}
    )
    
    # Update booking payment status
    if status == "completed":
        db.execute(
            """
            UPDATE bookings SET payment_status = 'paid', status = 'confirmed'
            WHERE id = (SELECT booking_id FROM payments WHERE id = :payment_id)
            """,
            {"payment_id": payment_id}
        )
    
    db.commit()
    
    return {"message": "Payment status updated", "status": status}

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: str, db: Session = Depends(get_db)):
    """Get payment by ID"""
    result = db.execute(
        "SELECT * FROM payments WHERE id = :id",
        {"id": payment_id}
    )
    
    payment = result.fetchone()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return dict(payment._mapping)

@router.get("/booking/{booking_id}", response_model=List[PaymentResponse])
async def get_booking_payments(booking_id: str, db: Session = Depends(get_db)):
    """Get all payments for a booking"""
    result = db.execute(
        "SELECT * FROM payments WHERE booking_id = :booking_id ORDER BY created_at DESC",
        {"booking_id": booking_id}
    )
    
    payments = result.fetchall()
    return [dict(row._mapping) for row in payments]

@router.post("/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    amount: float,
    reason: str = None,
    db: Session = Depends(get_db)
):
    """Process refund (Mock)"""
    refund_id = str(uuid.uuid4())
    provider_refund_id = hashlib.md5(f"{refund_id}{time.time()}".encode()).hexdigest()
    
    db.execute(
        """
        INSERT INTO refunds (id, payment_id, amount, reason, provider_refund_id, status)
        VALUES (:id, :payment_id, :amount, :reason, :provider_refund_id, 'completed')
        """,
        {
            "id": refund_id,
            "payment_id": payment_id,
            "amount": amount,
            "reason": reason,
            "provider_refund_id": provider_refund_id,
        }
    )
    
    # Update payment status
    db.execute(
        "UPDATE payments SET status = 'refunded' WHERE id = :id",
        {"id": payment_id}
    )
    
    # Update booking
    db.execute(
        """
        UPDATE bookings SET payment_status = 'refunded', status = 'cancelled'
        WHERE id = (SELECT booking_id FROM payments WHERE id = :payment_id)
        """,
        {"payment_id": payment_id}
    )
    
    db.commit()
    
    return {
        "message": "Refund processed",
        "refund_id": refund_id,
        "provider_refund_id": provider_refund_id,
    }
