from app.db.mongo import user_collection
from datetime import datetime

def upsert_user_context(user_id: str, node_payload: dict):
    user = node_payload.get("user", {})

    user_collection.update_one(
        {"userId": user_id},
        {
            "$set": {
                "userId": user_id,
                "username": user.get("username"),   # ✅ STORE USERNAME
                "nodeData": node_payload,
                "updatedAt": datetime.utcnow()
            }
        },
        upsert=True
    )


def get_user_context(user_id: str):
    return user_collection.find_one(
        {"userId": user_id},
        {"_id": 0}
    )
