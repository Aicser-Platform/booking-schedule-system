from passlib.context import CryptContext
from sqlalchemy import create_engine, text
import uuid

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROLE_DEFINITIONS = [
    {"name": "customer", "description": "Default customer role", "is_unique": False},
    {"name": "staff", "description": "Staff member role", "is_unique": False},
    {"name": "admin", "description": "Administrator role", "is_unique": True},
    {"name": "superadmin", "description": "Super administrator role", "is_unique": True},
]

PERMISSIONS = {
    "services:read": "View services",
    "services:manage": "Create, update, and delete services",
    "staff:manage": "Assign and manage staff",
    "availability:manage_own": "Manage own availability",
    "bookings:create": "Create bookings",
    "bookings:read_own": "View own bookings",
    "bookings:read_assigned": "View assigned bookings",
    "bookings:manage": "Manage all bookings",
    "payments:read_own": "View own payments",
    "payments:manage": "Manage all payments",
    "customers:read_own": "View own customer profile",
    "customers:manage": "Manage all customers",
    "reviews:create": "Create reviews",
    "reviews:manage": "Moderate reviews",
    "analytics:read": "View analytics",
    "roles:assign": "Assign and change user roles",
    "roles:promote_staff": "Promote customer to staff",
    "roles:promote_admin": "Promote staff to admin",
    "roles:promote_superadmin": "Promote admin to superadmin",
}

ROLE_PERMISSIONS = {
    "customer": [
        "services:read",
        "bookings:create",
        "bookings:read_own",
        "payments:read_own",
        "customers:read_own",
        "reviews:create",
    ],
    "staff": [
        "services:read",
        "availability:manage_own",
        "bookings:read_assigned",
    ],
    "admin": [
        "services:manage",
        "staff:manage",
        "bookings:manage",
        "payments:manage",
        "customers:manage",
        "reviews:manage",
        "analytics:read",
        "roles:assign",
        "roles:promote_staff",
    ],
    "superadmin": [
        "services:manage",
        "staff:manage",
        "bookings:manage",
        "payments:manage",
        "customers:manage",
        "reviews:manage",
        "analytics:read",
        "roles:assign",
        "roles:promote_staff",
        "roles:promote_admin",
        "roles:promote_superadmin",
    ],
}

SEED_USERS = [
    {
        "email": "superadmin@example.com",
        "full_name": "Super Admin",
        "role": "superadmin",
        "phone": None,
        "password": "SuperAdmin123!",
    },
    {
        "email": "admin@example.com",
        "full_name": "Admin User",
        "role": "admin",
        "phone": None,
        "password": "Admin123!",
    },
]


def _upsert_roles(conn) -> None:
    for role in ROLE_DEFINITIONS:
        conn.execute(
            text(
                """
                INSERT INTO roles (name, description, is_unique)
                VALUES (:name, :description, :is_unique)
                ON CONFLICT (name)
                DO UPDATE SET description = EXCLUDED.description,
                              is_unique = EXCLUDED.is_unique
                """
            ),
            role,
        )


def _upsert_permissions(conn) -> None:
    for code, description in PERMISSIONS.items():
        conn.execute(
            text(
                """
                INSERT INTO permissions (code, description)
                VALUES (:code, :description)
                ON CONFLICT (code)
                DO UPDATE SET description = EXCLUDED.description
                """
            ),
            {"code": code, "description": description},
        )


def _assign_role_permissions(conn) -> None:
    for role_name, permission_codes in ROLE_PERMISSIONS.items():
        for code in permission_codes:
            conn.execute(
                text(
                    """
                    INSERT INTO role_permissions (role_name, permission_code)
                    VALUES (:role_name, :permission_code)
                    ON CONFLICT (role_name, permission_code) DO NOTHING
                    """
                ),
                {"role_name": role_name, "permission_code": code},
            )


def _seed_admin_account(conn, user: dict) -> None:
    existing_role = conn.execute(
        text("SELECT id FROM users WHERE role = :role LIMIT 1"),
        {"role": user["role"]},
    ).fetchone()
    if existing_role:
        return

    existing_email = conn.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": user["email"]},
    ).fetchone()

    if existing_email:
        conn.execute(
            text("UPDATE users SET role = :role WHERE id = :id"),
            {"role": user["role"], "id": existing_email.id},
        )
        return

    password_hash = pwd_context.hash(user["password"])
    conn.execute(
        text(
            """
            INSERT INTO users (id, email, full_name, role, phone, password_hash)
            VALUES (:id, :email, :full_name, :role, :phone, :password_hash)
            """
        ),
        {
            "id": str(uuid.uuid4()),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "phone": user["phone"],
            "password_hash": password_hash,
        },
    )


def main() -> None:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

    with engine.begin() as conn:
        _upsert_roles(conn)
        _upsert_permissions(conn)
        _assign_role_permissions(conn)
        for user in SEED_USERS:
            _seed_admin_account(conn, user)


if __name__ == "__main__":
    main()
