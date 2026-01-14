from passlib.context import CryptContext
from sqlalchemy import create_engine, text
import uuid

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def main() -> None:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    users = [
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
        {
            "email": "staff@example.com",
            "full_name": "Staff User",
            "role": "staff",
            "phone": None,
            "password": "Staff123!",
        },
        {
            "email": "customer@example.com",
            "full_name": "Customer User",
            "role": "customer",
            "phone": None,
            "password": "Customer123!",
        },
    ]

    with engine.begin() as conn:
        for user in users:
            password_hash = pwd_context.hash(user["password"])
            conn.execute(
                text(
                    """
                    INSERT INTO users (id, email, full_name, role, phone, password_hash)
                    VALUES (:id, :email, :full_name, :role, :phone, :password_hash)
                    ON CONFLICT (email) DO NOTHING
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


if __name__ == "__main__":
    main()
