import os
import json
import requests
from datetime import datetime
from app.constants.prompts import WEEKLY_MEAL_SUMMARY_PROMPT
from app.db.mongo import meal_analysis_collection


def generate_weekly_summary(user_id, weekly_plan):
    # ✅ Convert to readable JSON (critical)
    weekly_plan_text = json.dumps(weekly_plan, indent=2)[:12000]

    headers = {
        "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": WEEKLY_MEAL_SUMMARY_PROMPT},
            {
                "role": "user",
                "content": f"Analyze this weekly meal plan:\n{weekly_plan_text}"
            }
        ],
        "temperature": 0.3
    }

    res = requests.post(
        os.getenv("GROQ_API_URL"),
        headers=headers,
        json=body,
        timeout=45
    )

    data = res.json()

    # ✅ Graceful handling (NO hard crash)
    summary_text = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content")
    )

    if not summary_text:
        summary_text = (
            "Unable to generate detailed summary due to data size. "
            "Meal plan saved successfully."
        )

    # ✅ Store in MongoDB
    meal_analysis_collection.insert_one({
        "userId": user_id,
        "type": "weekly_summary",
        "summary": summary_text,
        "createdAt": datetime.utcnow()
    })

    return summary_text
