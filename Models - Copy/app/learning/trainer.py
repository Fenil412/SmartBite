import os
import pickle
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(BASE_DIR, "models")

def train_ranking_model(csv_path: str):
    df = pd.read_csv(csv_path)

    X = df[["calories", "protein", "carbs", "fats"]]
    y = df["rating"] if "rating" in df else df["calories"]

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        random_state=42
    )
    model.fit(X, y)

    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(os.path.join(MODEL_DIR, "ranking_model.pkl"), "wb") as f:
        pickle.dump(model, f)

    print("✅ ranking_model.pkl trained")
