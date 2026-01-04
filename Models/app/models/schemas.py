from pydantic import BaseModel
from typing import List, Optional


class Nutrition(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float
    sugar: float
    sodium: float
    glycemicIndex: Optional[float] = None


class Meal(BaseModel):
    id: str
    name: str
    cuisine: str
    mealType: str
    nutrition: Nutrition
    ingredients: List[str]
    allergens: List[str]
    costLevel: str
    embedding: List[float] = []


class MealPayload(BaseModel):
    success: bool
    count: int
    data: List[Meal]
