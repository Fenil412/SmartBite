import { User } from "../models/user.model.js";
import {
    fetchCandidateMeals,
    rankMealsWithAI,
    buildWeeklyPlan,
    saveMealPlan
} from "../services/recommendation.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyConstraints } from "../services/constraints.service.js";

/**
 * GENERATE WEEKLY MEAL PLAN
 */
export const generateMealPlan = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found");
    }

    // 1. Candidate meals
    const meals = await fetchCandidateMeals(user);
    if (!meals.length) {
        throw new ApiError(404, "No meals available for your preferences");
    }
    const constrainedMeals = applyConstraints(
        meals,
        user.constraints || {}
    );

    if (!constrainedMeals.length) {
        throw new ApiError(
            404,
            "No meals match your real-world constraints"
        );
    }
    // 2. Rank meals with AI
    const rankedMeals = await rankMealsWithAI(constrainedMeals, user);

    // 3. Build weekly plan
    const days = buildWeeklyPlan(rankedMeals);

    // 4. Save plan
    const mealPlan = await saveMealPlan(user._id, days);

    // 5. Update user history
    user.planHistory.push(mealPlan._id);
    user.activityHistory.push({
        action: "GENERATE_MEAL_PLAN",
        metadata: { mealPlanId: mealPlan._id }
    });
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    return ApiResponse.success(
        res,
        {
            mealPlan,
            message: "Weekly meal plan generated successfully"
        },
        201
    );
});

/**
 * GET USER MEAL PLAN HISTORY
 */
export const getMealPlanHistory = asyncHandler(async (req, res) => {
    const plans = await MealPlan.find({ user: req.user._id })
        .populate("days.meals.meal", "name nutrition image")
        .sort({ createdAt: -1 });

    return ApiResponse.success(
        res,
        { plans },
        200
    );
});
