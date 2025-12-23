from typing import Dict, List


class ValidationError(Exception):
    pass


def require_fields(data: Dict, fields: List[str]):
    missing = [f for f in fields if f not in data]
    if missing:
        raise ValidationError(f"Missing required fields: {missing}")


def validate_profile(profile: Dict):
    require_fields(profile, [
        "age",
        "heightCm",
        "weightKg",
        "activityLevel",
        "goal"
    ])

    if not (10 <= profile["age"] <= 100):
        raise ValidationError("Age must be between 10 and 100")

    if profile["heightCm"] <= 0 or profile["weightKg"] <= 0:
        raise ValidationError("Height and weight must be positive")

    if profile["activityLevel"] not in [
        "sedentary", "light", "moderate", "active", "very_active"
    ]:
        raise ValidationError("Invalid activityLevel")

    if profile["goal"] not in [
        "fat_loss", "muscle_gain", "maintenance"
    ]:
        raise ValidationError("Invalid goal")


def validate_constraints(constraints: Dict):
    if "maxCookTime" in constraints and constraints["maxCookTime"] <= 0:
        raise ValidationError("maxCookTime must be positive")

    if "skillLevel" in constraints and constraints["skillLevel"] not in [
        "beginner", "intermediate", "advanced"
    ]:
        raise ValidationError("Invalid skillLevel")


def validate_recommend_request(payload: Dict):
    require_fields(payload, [
        "user",
        "meals"
    ])

    validate_profile(payload["user"]["profile"])

    if not isinstance(payload["meals"], list) or len(payload["meals"]) == 0:
        raise ValidationError("Meals list cannot be empty")
