import pandas as pd
from app.learning.trainer import train_ranking_model

df = pd.read_csv("data/meals.csv")

X = df[["calories", "protein", "carbs", "fats"]]
y = df["rating"] if "rating" in df else df["calories"] * -1

train_ranking_model(X, y)
