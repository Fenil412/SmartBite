from app.services.user_context_service import (
    get_user_context,
    upsert_user_context
)
from app.services.node_client import fetch_user_context_from_node

def resolve_user_context(user_id: str):
    """
    1. Try Flask cache (Mongo)
    2. If missing → fetch from Node
    3. Store locally
    """

    local = get_user_context(user_id)
    if local:
        return local

    node_data = fetch_user_context_from_node(user_id)
    if not node_data:
        return None

    upsert_user_context(user_id, node_data)
    return node_data
