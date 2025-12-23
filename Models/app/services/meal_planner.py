import pandas as pd
import random

df = pd.read_csv("datasets/detailed_meals_macros_CLEANED.csv")

def generate_weekly_plan(payload):
    weekly = {}
    for day in ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:
        meals = df.sample(3).to_dict("records")
        weekly[day] = meals
    return weekly
