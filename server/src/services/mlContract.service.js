import { User } from "../models/user.model.js";
import { Meal } from "../models/meal.model.js";
import { MealPlan } from "../models/mealPlan.model.js";
import { Feedback } from "../models/feedback.model.js";
import { Constraint } from "../models/constraint.model.js";

/**
 * Build ML-ready user context
 */
export const buildUserMLContext = async (userId) => {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error("User not found");

    const constraints = await Constraint.findOne({ user: userId }).lean();
    const feedback = await Feedback.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    const recentPlans = await MealPlan.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    return {
        user: {
            id: user._id,
            age: user.profile.age,
            heightCm: user.profile.heightCm,
            weightKg: user.profile.weightKg,
            gender: user.profile.gender,
            activityLevel: user.profile.activityLevel,
            goal: user.profile.goal,

            dietaryPreferences: user.profile.dietaryPreferences,
            dietaryRestrictions: user.profile.dietaryRestrictions,
            allergies: user.profile.allergies,

            budgetTier: user.preferences.budgetTier,
            preferredCuisines: user.preferences.preferredCuisines,
        },

        constraints: constraints || user.constraints || {},

        feedback: feedback.map(f => ({
            type: f.type,
            rating: f.rating,
            meal: f.meal,
            createdAt: f.createdAt
        })),

        adherenceHistory: recentPlans.flatMap(plan =>
            plan.days.flatMap(d =>
                d.meals.map(m => ({
                    meal: m.meal,
                    status: m.adherence.status
                }))
            )
        )
    };
};

/**
 * Fetch meal catalog for ML
 */
export const fetchMealCatalogForML = async () => {
    const meals = await Meal.find({ isActive: true })
        .select(
            "name cuisine mealType nutrition ingredients allergens costLevel cookTime skillLevel appliances embeddingVector"
        )
        .lean();

    return meals.map(m => ({
        id: m._id,
        name: m.name,
        cuisine: m.cuisine,
        mealType: m.mealType,
        nutrition: m.nutrition,
        ingredients: m.ingredients,
        allergens: m.allergens,
        costLevel: m.costLevel,
        cookTime: m.cookTime,
        skillLevel: m.skillLevel,
        appliances: m.appliances,
        embedding: m.embeddingVector || []
    }));
};
