import os
import pickle
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(BASE_DIR, "models")

def build_encoders(csv_path: str):
    df = pd.read_csv(csv_path)

    encoders = {}
    for col in ["cuisine", "mealType", "skillLevel"]:
        le = LabelEncoder()
        df[col] = df[col].astype(str)
        le.fit(df[col])
        encoders[col] = le

    scaler = StandardScaler()
    scaler.fit(df[["calories", "protein", "carbs", "fats"]])
    encoders["scaler"] = scaler

    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(os.path.join(MODEL_DIR, "encoders.pkl"), "wb") as f:
        pickle.dump(encoders, f)

    print("✅ encoders.pkl created")
