from app.db.mongo import history_collection
from datetime import datetime

def save_history(username: str, action: str, data: dict):
    history_collection.insert_one({
        "username": username,     # ✅ username instead of userId
        "action": action,
        "data": data,
        "createdAt": datetime.utcnow()
    })


def fetch_history(username: str):
    return list(
        history_collection.find(
            {"username": username},
            {"_id": 0}
        ).sort("createdAt", -1)  # Sort by newest first
    )
