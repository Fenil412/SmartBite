from app.db.mongo import history_collection
from datetime import datetime

def save_history(userId, type_, data):
    history_collection.insert_one({
        "userId": userId,
        "type": type_,
        "data": data,
        "createdAt": datetime.utcnow()
    })

def fetch_history(userId):
    return list(history_collection.find(
        {"userId": userId},
        {"_id": 0}
    ))
