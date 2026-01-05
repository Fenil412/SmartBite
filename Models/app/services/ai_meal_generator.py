import os
import requests
from app.constants.prompts import MEAL_GEN_PROMPT

def generate_meals(macros, profile, day_context=None):
    # Create day-specific prompt additions for variety
    day_info = ""
    if day_context:
        day_info = f"""
Day: {day_context['day']} (Day {day_context['day_number']} of 7)
Week Position: {day_context['week_position']}

IMPORTANT: Generate UNIQUE meals for this specific day with CONSISTENT detail level.
"""
    
    # Use consistent temperature for all days
    temperature = 0.7
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": MEAL_GEN_PROMPT},
            {"role": "user", "content": f"""
{day_info}
Target Calories:
Breakfast: {macros['breakfast']} calories
Lunch: {macros['lunch']} calories
Dinner: {macros['dinner']} calories
Snack: {macros['snacks']} calories

User Profile:
Diet: {profile['dietaryPreference']}
Health Conditions: {profile['diseases']}
Allergies: {profile.get('allergies', [])}

CRITICAL: Generate meals with CONSISTENT format and detail level. Each meal MUST include:
1. Meal name with calorie count in parentheses
2. 2-4 key ingredients with portions
3. Brief preparation instruction

Make this day's meals UNIQUE and DIFFERENT from other days while maintaining the EXACT SAME format and detail level.
"""}
        ],
        "temperature": temperature
    }

    res = requests.post(
        os.getenv("GROQ_API_URL"),
        headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"},
        json=payload
    )

    return res.json()["choices"][0]["message"]["content"]
