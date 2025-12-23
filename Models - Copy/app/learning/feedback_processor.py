from utils.mongo_client import db

def process_feedback(feedback):
    db.feedback.insert_one(feedback)
