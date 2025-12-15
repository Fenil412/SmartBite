import axios from "axios";
import { Meal } from "../models/meal.model.js";
import { MealPlan } from "../models/mealPlan.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * STEP 1: Fetch candidate meals based on user profile
 */
export const fetchCandidateMeals = async (user) => {
    const { profile, preferences } = user;

    const query = {
        isActive: true,
    };

    // Dietary restrictions
    if (profile.dietaryRestrictions?.includes("vegetarian")) {
        query.isVegetarian = true;
    }
    if (profile.dietaryRestrictions?.includes("vegan")) {
        query.isVegan = true;
    }
    if (profile.dietaryRestrictions?.includes("gluten_free")) {
        query.isGlutenFree = true;
    }

    // Budget
    if (preferences?.budgetTier) {
        query.costLevel = preferences.budgetTier;
    }

    return Meal.find(query).limit(200);
};

/**
 * STEP 2: Call Python AI service (ranking + clustering)
 * (Safe wrapper – backend will still work if AI service is down)
 */
export const rankMealsWithAI = async (meals, user) => {
    try {
        const response = await axios.post(
            `${process.env.PYTHON_SERVICE_URL}/recommend`,
            {
                meals,
                userProfile: user.profile,
                preferences: user.preferences,
            },
            { timeout: 15000 }
        );

        return response.data.rankedMeals;
    } catch (err) {
        // Graceful fallback
        return meals;
    }
};

/**
 * STEP 3: Build weekly structure
 */
export const buildWeeklyPlan = (meals) => {
    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
    let index = 0;

    return days.map((day) => ({
        day,
        meals: mealTypes.map((type) => ({
            mealType: type,
            meal: meals[index++ % meals.length]._id,
        })),
    }));
};

/**
 * STEP 4: Save meal plan
 */
export const saveMealPlan = async (userId, days) => {
    return MealPlan.create({
        user: userId,
        weekStartDate: new Date(),
        days,
        generatedBy: "ai",
    });
};
