from typing import Optional, Dict, Any
import uuid
from sqlalchemy.orm import Session


def log_audit(
    db: Session,
    actor_id: Optional[str],
    action: str,
    entity_type: str,
    entity_id: Optional[str],
    changes: Optional[Dict[str, Any]] = None,
) -> None:
    db.execute(
        """
        INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, changes)
        VALUES (:id, :actor_id, :action, :entity_type, :entity_id, :changes)
        """,
        {
            "id": str(uuid.uuid4()),
            "actor_id": actor_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "changes": changes,
        },
    )
