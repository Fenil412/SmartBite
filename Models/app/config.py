# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://chodvadiyafenil_db_user:yC69C1QOgDzcDzfh@cluster0.yw8evxq.mongodb.net")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_DIR = os.path.join(BASE_DIR, "..", "models")

    RANKING_MODEL_PATH = os.path.join(MODEL_DIR, "ranking_model.pkl")
    ENCODERS_PATH = os.path.join(MODEL_DIR, "encoders.pkl")
