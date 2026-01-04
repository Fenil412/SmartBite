import json
import os
import requests
from app.constants.prompts import NUTRITION_IMPACT_PROMPT

def generate_nutrition_impact(user_ctx: dict, weekly_plan: dict, health_risk: dict) -> dict:
    prompt = f"""
{NUTRITION_IMPACT_PROMPT}

User Profile:
Age: {user_ctx.get("age")}
Gender: {user_ctx.get("gender")}
Weight: {user_ctx.get("weight")} kg
Height: {user_ctx.get("height")} cm
Activity Level: {user_ctx.get("activityLevel")}
Goal: {user_ctx.get("goal")}
Dietary Preferences: {user_ctx.get("dietaryPreferences")}
Allergies: {user_ctx.get("allergies")}

Weekly Meal Plan:
{json.dumps(weekly_plan, indent=2)}

Health Risk Report:
{json.dumps(health_risk, indent=2)}

TASK:
1. Explain what happens if user follows this plan for 1 week
2. Explain improvements in energy, digestion, sugar, BP, muscle, fat
3. Explain which health risks reduce and by how much (qualitative)
4. Estimate how long user should follow this diet to reduce health burden significantly
5. Give practical advice (not medical diagnosis)
"""

    response = requests.post(
        os.getenv("GROQ_API_URL"),
        headers={
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 900
        },
        timeout=40
    )

    result = response.json()

    text = (
        result.get("choices", [{}])[0]
        .get("message", {})
        .get("content")
    )

    if not text:
        raise RuntimeError("Groq failed to generate nutrition impact summary")

    return {
        "summary": text,
        "timeframe": "weekly → multi-week impact",
        "note": "This is not medical advice"
    }
