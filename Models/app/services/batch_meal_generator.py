import os
import requests
from app.constants.prompts import MEAL_GEN_PROMPT

def generate_weekly_meals_batch(distribution, profile, weekly_cals):
    """Generate all 7 days of meals in a single API call for better performance"""
    
    # Create the weekly meal request
    weekly_request = ""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for i, day in enumerate(days):
        daily_cals = weekly_cals[i] if i < len(weekly_cals) else weekly_cals[0]
        
        # Calculate daily macros based on distribution
        breakfast_cals = round(daily_cals * distribution['breakfast'] / 100)
        lunch_cals = round(daily_cals * distribution['lunch'] / 100)
        dinner_cals = round(daily_cals * distribution['dinner'] / 100)
        snack_cals = round(daily_cals * distribution['snacks'] / 100)
        
        week_position = "start" if i < 2 else "middle" if i < 5 else "weekend"
        
        weekly_request += f"""
**{day} (Day {i+1} - {week_position})**
Target Calories:
- Breakfast: {breakfast_cals} calories
- Lunch: {lunch_cals} calories  
- Dinner: {dinner_cals} calories
- Snack: {snack_cals} calories

"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": f"""{MEAL_GEN_PROMPT}

IMPORTANT: You are generating a COMPLETE 7-day meal plan. For each day, provide:
1. Day name as header
2. All 4 meals (Breakfast, Lunch, Dinner, Snack) with calorie counts
3. Consistent format and detail level for all days
4. Unique meals for each day - no repetition across the week
"""},
            {"role": "user", "content": f"""
Generate a complete 7-day meal plan with the following requirements:

{weekly_request}

User Profile:
- Diet: {profile['dietaryPreference']}
- Health Conditions: {profile.get('diseases', [])}
- Allergies: {profile.get('allergies', [])}

CRITICAL REQUIREMENTS:
1. Generate UNIQUE meals for each day - no repetition
2. Each meal MUST include: name with calories, 2-4 ingredients, brief preparation
3. Maintain CONSISTENT format and detail level across all 7 days
4. Ensure variety while respecting dietary preferences and restrictions
5. Format each day clearly with day name as header

Generate the complete weekly meal plan now:
"""}
        ],
        "temperature": 0.7,
        "max_tokens": 4000  # Increased for full week generation
    }

    try:
        res = requests.post(
            os.getenv("GROQ_API_URL"),
            headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"},
            json=payload,
            timeout=15  # Longer timeout for batch generation
        )
        
        if res.status_code == 200:
            weekly_content = res.json()["choices"][0]["message"]["content"]
            return parse_weekly_response(weekly_content, days, distribution, weekly_cals)
        else:
            return generate_fallback_weekly_plan(distribution, weekly_cals)
            
    except Exception:
        return generate_fallback_weekly_plan(distribution, weekly_cals)


def parse_weekly_response(content, days, distribution, weekly_cals):
    """Parse the AI response into individual day meal plans"""
    weekly_plan = {}
    
    # Split content by day headers
    sections = content.split("**")
    current_day = None
    current_content = ""
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
            
        # Check if this section is a day header
        day_found = None
        for day in days:
            if day.lower() in section.lower():
                day_found = day
                break
        
        if day_found:
            # Save previous day's content
            if current_day and current_content:
                weekly_plan[current_day] = current_content.strip()
            
            # Start new day
            current_day = day_found
            current_content = f"**{section}**"
        else:
            # Add to current day's content
            if current_day:
                current_content += f"**{section}**"
    
    # Save last day's content
    if current_day and current_content:
        weekly_plan[current_day] = current_content.strip()
    
    # Fill in any missing days with fallback
    for i, day in enumerate(days):
        if day not in weekly_plan:
            daily_cals = weekly_cals[i] if i < len(weekly_cals) else weekly_cals[0]
            macros = {
                'breakfast': round(daily_cals * distribution['breakfast'] / 100),
                'lunch': round(daily_cals * distribution['lunch'] / 100),
                'dinner': round(daily_cals * distribution['dinner'] / 100),
                'snacks': round(daily_cals * distribution['snacks'] / 100)
            }
            day_context = {'day': day, 'day_number': i + 1}
            weekly_plan[day] = generate_fallback_meals(macros, day_context)
    
    return weekly_plan


def generate_fallback_weekly_plan(distribution, weekly_cals):
    """Generate a complete fallback weekly plan"""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekly_plan = {}
    
    meal_templates = {
        0: {  # Monday
            'breakfast': 'Overnight oats with berries',
            'lunch': 'Grilled chicken Caesar salad',
            'dinner': 'Baked salmon with quinoa',
            'snack': 'Apple with almond butter'
        },
        1: {  # Tuesday
            'breakfast': 'Scrambled eggs with avocado toast',
            'lunch': 'Turkey and hummus wrap',
            'dinner': 'Stir-fried tofu with vegetables',
            'snack': 'Greek yogurt with granola'
        },
        2: {  # Wednesday
            'breakfast': 'Smoothie bowl with protein powder',
            'lunch': 'Quinoa Buddha bowl',
            'dinner': 'Grilled chicken with sweet potato',
            'snack': 'Mixed nuts and dried fruit'
        },
        3: {  # Thursday
            'breakfast': 'Whole grain pancakes with fruit',
            'lunch': 'Lentil soup with whole grain bread',
            'dinner': 'Baked cod with roasted vegetables',
            'snack': 'Cottage cheese with berries'
        },
        4: {  # Friday
            'breakfast': 'Chia pudding with mango',
            'lunch': 'Chicken and vegetable stir-fry',
            'dinner': 'Lean beef with brown rice',
            'snack': 'Protein smoothie'
        },
        5: {  # Saturday
            'breakfast': 'Weekend veggie omelet',
            'lunch': 'Grilled portobello burger',
            'dinner': 'Herb-crusted salmon with asparagus',
            'snack': 'Dark chocolate and almonds'
        },
        6: {  # Sunday
            'breakfast': 'French toast with fresh fruit',
            'lunch': 'Mediterranean chickpea salad',
            'dinner': 'Roasted chicken with root vegetables',
            'snack': 'Homemade trail mix'
        }
    }
    
    for i, day in enumerate(days):
        daily_cals = weekly_cals[i] if i < len(weekly_cals) else weekly_cals[0]
        macros = {
            'breakfast': round(daily_cals * distribution['breakfast'] / 100),
            'lunch': round(daily_cals * distribution['lunch'] / 100),
            'dinner': round(daily_cals * distribution['dinner'] / 100),
            'snacks': round(daily_cals * distribution['snacks'] / 100)
        }
        
        template = meal_templates[i]
        
        weekly_plan[day] = f"""
**{day} Meal Plan**

**Breakfast ({macros['breakfast']} calories)**
- {template['breakfast']}
- Nutritious and balanced start to your day
- Quick and easy preparation

**Lunch ({macros['lunch']} calories)**
- {template['lunch']}
- Satisfying midday meal with protein and vegetables
- Perfect for sustained energy

**Dinner ({macros['dinner']} calories)**
- {template['dinner']}
- Complete evening meal with lean protein
- Includes healthy sides and vegetables

**Snack ({macros['snacks']} calories)**
- {template['snack']}
- Healthy snack to maintain energy levels
- Balanced nutrition between meals
""".strip()
    
    return weekly_plan


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
""".strip()