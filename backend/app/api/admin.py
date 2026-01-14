import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.core.database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _csv_response(rows: list[list[str]], filename: str) -> Response:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerows(rows)
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/staff")
def list_staff(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT id, full_name, avatar_url, phone, role, is_active
        FROM users
        WHERE role IN ('staff', 'admin', 'superadmin')
        ORDER BY full_name
        """
    )
    staff_rows = result.fetchall()

    return [
        {
            "id": row[0],
            "full_name": row[1],
            "avatar_url": row[2],
            "phone": row[3],
            "role": "admin" if row[4] == "superadmin" else row[4],
            "is_active": bool(row[5]),
        }
        for row in staff_rows
    ]


@router.get("/services")
def list_services(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT id, name, description, is_active, duration_minutes, price, deposit_amount, max_capacity
        FROM services
        ORDER BY created_at DESC
        """
    )
    return [dict(row._mapping) for row in result.fetchall()]


@router.get("/bookings")
def list_bookings(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT b.id, b.start_time_utc, b.status, b.payment_status,
               s.id as service_id, s.name as service_name, s.price, s.duration_minutes,
               u.id as staff_id, u.full_name as staff_name,
               c.id as customer_id, c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN users u ON b.staff_id = u.id
        LEFT JOIN customers c ON b.customer_id = c.id
        ORDER BY b.start_time_utc DESC
        """
    )
    rows = result.fetchall()

    return [
        {
            "id": row[0],
            "start_time_utc": row[1],
            "status": row[2],
            "payment_status": row[3],
            "service": {
                "id": row[4],
                "name": row[5],
                "price": row[6],
                "duration_minutes": row[7],
            },
            "staff": {"id": row[8], "full_name": row[9]},
            "customer": {
                "id": row[10],
                "full_name": row[11],
                "email": row[12],
                "phone": row[13],
            },
        }
        for row in rows
    ]


@router.get("/payments")
def list_payments(
    limit: int = 50,
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT p.id, p.created_at, p.amount, p.status, p.provider,
               b.id as booking_id, s.name as service_name, c.full_name as customer_name
        FROM payments p
        LEFT JOIN bookings b ON p.booking_id = b.id
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN customers c ON b.customer_id = c.id
        ORDER BY p.created_at DESC
        LIMIT :limit
        """,
        {"limit": limit},
    )
    rows = result.fetchall()

    return [
        {
            "id": row[0],
            "created_at": row[1],
            "amount": row[2],
            "status": row[3],
            "payment_method": row[4],
            "booking": {
                "id": row[5],
                "service": {"name": row[6]},
                "customer": {"full_name": row[7]},
            },
        }
        for row in rows
    ]


@router.get("/reviews")
def list_reviews(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT r.id, r.rating, r.comment, r.is_approved, r.created_at,
               c.full_name as customer_name, s.name as service_name
        FROM reviews r
        LEFT JOIN bookings b ON r.booking_id = b.id
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN services s ON b.service_id = s.id
        ORDER BY r.created_at DESC
        """
    )
    rows = result.fetchall()

    return [
        {
            "id": row[0],
            "rating": row[1],
            "comment": row[2],
            "is_visible": bool(row[3]),
            "created_at": row[4],
            "customer": {"full_name": row[5]},
            "service": {"name": row[6]},
        }
        for row in rows
    ]


@router.get("/reports/bookings.csv")
def report_bookings(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT b.id, b.start_time_utc, b.status, b.payment_status,
               s.name as service_name,
               u.full_name as staff_name,
               c.full_name as customer_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN users u ON b.staff_id = u.id
        LEFT JOIN customers c ON b.customer_id = c.id
        ORDER BY b.start_time_utc DESC
        """
    )
    rows = [["booking_id", "start_time_utc", "status", "payment_status", "service", "staff", "customer"]]
    rows.extend([list(map(str, row)) for row in result.fetchall()])
    return _csv_response(rows, "bookings.csv")


@router.get("/reports/financial.csv")
def report_financial(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT p.id, p.booking_id, p.amount, p.currency, p.status, p.provider, p.created_at
        FROM payments p
        ORDER BY p.created_at DESC
        """
    )
    rows = [["payment_id", "booking_id", "amount", "currency", "status", "provider", "created_at"]]
    rows.extend([list(map(str, row)) for row in result.fetchall()])
    return _csv_response(rows, "financial.csv")


@router.get("/reports/customers.csv")
def report_customers(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT id, full_name, email, phone, timezone, is_blocked, created_at
        FROM customers
        ORDER BY created_at DESC
        """
    )
    rows = [["customer_id", "full_name", "email", "phone", "timezone", "is_blocked", "created_at"]]
    rows.extend([list(map(str, row)) for row in result.fetchall()])
    return _csv_response(rows, "customers.csv")


@router.get("/reports/staff.csv")
def report_staff(
    current_user: dict = Depends(require_roles("admin", "superadmin")),
    db: Session = Depends(get_db),
):
    result = db.execute(
        """
        SELECT id, full_name, email, role, phone, is_active, created_at
        FROM users
        WHERE role IN ('staff', 'admin', 'superadmin')
        ORDER BY full_name
        """
    )
    rows = [["staff_id", "full_name", "email", "role", "phone", "is_active", "created_at"]]
    rows.extend([list(map(str, row)) for row in result.fetchall()])
    return _csv_response(rows, "staff.csv")
