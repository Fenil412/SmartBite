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

    try:
        res = requests.post(
            os.getenv("GROQ_API_URL"),
            headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"},
            json=payload,
            timeout=5  # 5 second timeout per request
        )
        
        if res.status_code == 200:
            return res.json()["choices"][0]["message"]["content"]
        else:
            # Return fallback meal plan if API fails
            return generate_fallback_meals(macros, day_context)
            
    except Exception:
        # Return fallback meal plan if request fails or times out
        return generate_fallback_meals(macros, day_context)


def generate_fallback_meals(macros, day_context=None):
    """Generate a simple fallback meal plan when AI service is unavailable"""
    day_name = day_context['day'] if day_context else "Day"
    
    return f"""
**{day_name} Meal Plan**

**Breakfast ({macros['breakfast']} calories)**
- Oatmeal with fruits and nuts
- Ingredients: 1 cup oats, 1 banana, 2 tbsp almonds, 1 cup milk
- Preparation: Cook oats with milk, top with sliced banana and almonds

**Lunch ({macros['lunch']} calories)**
- Grilled chicken salad
- Ingredients: 150g chicken breast, mixed greens, 1 tbsp olive oil, vegetables
- Preparation: Grill chicken, toss with greens and dressing

**Dinner ({macros['dinner']} calories)**
- Baked salmon with vegetables
- Ingredients: 200g salmon fillet, broccoli, sweet potato, herbs
- Preparation: Bake salmon at 400°F for 15 minutes, steam vegetables

**Snack ({macros['snacks']} calories)**
- Greek yogurt with berries
- Ingredients: 1 cup Greek yogurt, 1/2 cup mixed berries
- Preparation: Mix yogurt with fresh berries
"""
