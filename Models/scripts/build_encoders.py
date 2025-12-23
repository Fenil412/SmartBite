import pandas as pd
from app.learning.feature_builder import build_encoders

df = pd.read_csv("data/meals.csv")  # or your dataset
build_encoders(df)
