def normalize_user_context(node_payload: dict) -> dict:
    # Handle None input gracefully
    if node_payload is None:
        return {
            "userId": None,
            "age": None,
            "gender": None,
            "height": None,
            "weight": None,
            "activityLevel": None,
            "goal": None,
            "dietaryPreferences": [],
            "dietaryRestrictions": [],
            "allergies": [],
            "preferredCuisines": [],
            "budgetTier": None,
            "appliances": [],
            "maxCookTime": None,
            "skillLevel": None,
            "cookingDays": [],
            "likedMeals": [],
            "skippedMeals": []
        }
    
    user = node_payload.get("user", {})
    constraints = node_payload.get("constraints", {})
    feedback = node_payload.get("feedback", [])
    adherence = node_payload.get("adherenceHistory", [])

    return {
        "userId": user.get("id"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "height": user.get("heightCm"),
        "weight": user.get("weightKg"),
        "activityLevel": user.get("activityLevel"),
        "goal": user.get("goal"),

        "dietaryPreferences": user.get("dietaryPreferences", []),
        "dietaryRestrictions": user.get("dietaryRestrictions", []),
        "allergies": user.get("allergies", []),
        "preferredCuisines": user.get("preferredCuisines", []),
        "budgetTier": user.get("budgetTier"),

        "appliances": constraints.get("appliances", []),
        "maxCookTime": constraints.get("maxCookTime"),
        "skillLevel": constraints.get("skillLevel"),
        "cookingDays": constraints.get("cookingDays", []),

        "likedMeals": [f["meal"] for f in feedback if f["type"] == "liked"],
        "skippedMeals": [a["meal"] for a in adherence if a["status"] == "skipped"]
    }
