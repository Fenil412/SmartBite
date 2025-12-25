import os
import requests
from app.constants.prompts import MEAL_GEN_PROMPT

def generate_meals(macros, profile):
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": MEAL_GEN_PROMPT},
            {"role": "user", "content": f"""
Calories:
Breakfast: {macros['breakfast']}
Lunch: {macros['lunch']}
Dinner: {macros['dinner']}
Snacks: {macros['snacks']}

Diet: {profile['dietaryPreference']}
Diseases: {profile['diseases']}
"""}
        ],
        "temperature": 0.4
    }

    res = requests.post(
        os.getenv("GROQ_API_URL"),
        headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"},
        json=payload
    )

    return res.json()["choices"][0]["message"]["content"]
