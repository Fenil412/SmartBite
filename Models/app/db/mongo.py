from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGODB_URI")

if not MONGO_URI:
    raise RuntimeError("MONGODB_URI not set")

client = MongoClient(MONGO_URI)

# ✅ MUST MATCH ATLAS DATABASE NAME
db = client["Mined_Sprint"]

history_collection = db["ai_history"]
analysis_collection = db["meal_analysis"]
