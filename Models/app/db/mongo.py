from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["Mined_Sprint"]

history_collection = db["ai_history"]
analysis_collection = db["meal_analysis"]
