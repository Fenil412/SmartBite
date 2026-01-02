import { MealPlan } from "../models/mealPlan.model.js";
import { Meal } from "../models/meal.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ===========================
   CREATE MEAL PLAN (MANUAL / AI RESULT)
=========================== */
export const createMealPlan = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { title, weekStartDate, days, nutritionSummary } = req.body;

    if (!weekStartDate || !days?.length) {
        throw new ApiError(400, "weekStartDate and days are required");
    }

    // Validate meals exist
    const mealIds = days.flatMap(d => d.meals.map(m => m.meal));
    const mealsCount = await Meal.countDocuments({ _id: { $in: mealIds } });

    if (mealsCount !== mealIds.length) {
        throw new ApiError(400, "One or more meals are invalid");
    }

    const planData = {
        user: userId,
        weekStartDate,
        days,
        nutritionSummary,
        generatedBy: "manual" // Changed from "ai" since user is creating manually
    };

    // Add title if provided, otherwise use model default
    if (title && title.trim()) {
        planData.title = title.trim();
    }

    const plan = await MealPlan.create(planData);

    // Save plan history on user
    await User.findByIdAndUpdate(userId, {
        $push: { planHistory: plan._id },
        lastActiveAt: new Date()
    });

    return ApiResponse.success(
        res,
        { plan },
        201
    );
});

/* ===========================
   UPDATE MEAL PLAN
=========================== */
export const updateMealPlan = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { planId } = req.params;
    const { title, weekStartDate, days, nutritionSummary } = req.body;

    const plan = await MealPlan.findOne({
        _id: planId,
        user: userId,
        isActive: true
    });

    if (!plan) {
        throw new ApiError(404, "Meal plan not found or not authorized");
    }

    // Update title if provided
    if (title !== undefined) {
        const newTitle = title.trim() || "Weekly Meal Plan";
        plan.title = newTitle;
    }

    // Validate meals if days are updated
    if (days?.length) {
        const mealIds = days.flatMap(d => d.meals.map(m => m.meal));
        const mealsCount = await Meal.countDocuments({ _id: { $in: mealIds } });

        if (mealsCount !== mealIds.length) {
            throw new ApiError(400, "One or more meals are invalid");
        }

        plan.days = days;
    }

    if (weekStartDate) plan.weekStartDate = weekStartDate;
    if (nutritionSummary) plan.nutritionSummary = nutritionSummary;

    await plan.save();

    return ApiResponse.success(
        res,
        {
            plan,
            message: "Meal plan updated successfully"
        },
        200
    );
});

const findMealInPlan = (plan, day, mealType) => {
    const dayPlan = plan.days.find(d => d.day === day);
    if (!dayPlan) return null;

    return dayPlan.meals.find(m => m.mealType === mealType);
};

export const adhereMeal = asyncHandler(async (req, res) => {
    const { planId } = req.params;
    const { day, mealType } = req.body;

    const plan = await MealPlan.findOne({
        _id: planId,
        user: req.user._id,
        isActive: true
    });

    if (!plan) throw new ApiError(404, "Meal plan not found");

    const meal = findMealInPlan(plan, day, mealType);
    if (!meal) throw new ApiError(400, "Meal not found for given day/type");

    meal.adherence.status = "eaten";
    meal.adherence.updatedAt = new Date();

    await plan.save();

    return ApiResponse.success(res, {
        message: "Meal marked as eaten"
    }, 200);
});


export const skipMeal = asyncHandler(async (req, res) => {
    const { planId } = req.params;
    const { day, mealType } = req.body;

    const plan = await MealPlan.findOne({
        _id: planId,
        user: req.user._id,
        isActive: true
    });

    if (!plan) throw new ApiError(404, "Meal plan not found");

    const meal = findMealInPlan(plan, day, mealType);
    if (!meal) throw new ApiError(400, "Meal not found");

    meal.adherence.status = "skipped";
    meal.adherence.updatedAt = new Date();

    await plan.save();

    return ApiResponse.success(res, {
        message: "Meal marked as skipped"
    }, 200);
});


export const replaceMeal = asyncHandler(async (req, res) => {
    const { planId } = req.params;
    const { day, mealType, replacedWith } = req.body;

    if (!replacedWith) {
        throw new ApiError(400, "replacedWith is required");
    }

    const plan = await MealPlan.findOne({
        _id: planId,
        user: req.user._id,
        isActive: true
    });

    if (!plan) throw new ApiError(404, "Meal plan not found");

    const meal = findMealInPlan(plan, day, mealType);
    if (!meal) throw new ApiError(400, "Meal not found");

    meal.adherence.status = "replaced";
    meal.adherence.replacedWith = replacedWith;
    meal.adherence.updatedAt = new Date();

    await plan.save();

    return ApiResponse.success(res, {
        message: "Meal marked as replaced"
    }, 200);
});


/* ===========================
   GET CURRENT USER MEAL PLANS
=========================== */
export const getMyMealPlans = asyncHandler(async (req, res) => {
    const plans = await MealPlan.find({
        user: req.user._id,
        isActive: true
    })
        .sort({ createdAt: -1 })
        .populate({
            path: "days.meals.meal",
            select: "name nutrition mealType image"
        });

    return ApiResponse.success(
        res,
        { plans },
        200
    );
});

/* ===========================
   GET SINGLE PLAN
=========================== */
export const getMealPlanById = asyncHandler(async (req, res) => {
    const plan = await MealPlan.findOne({
        _id: req.params.planId,
        user: req.user._id
    }).populate("days.meals.meal");

    if (!plan) {
        throw new ApiError(404, "Meal plan not found");
    }

    return ApiResponse.success(
        res,
        { plan },
        200
    );
});

/* ===========================
   DELETE MEAL PLAN (SOFT)
=========================== */
export const deleteMealPlan = asyncHandler(async (req, res) => {
    const plan = await MealPlan.findOne({
        _id: req.params.planId,
        user: req.user._id
    });

    if (!plan) {
        throw new ApiError(404, "Meal plan not found");
    }

    plan.isActive = false;
    await plan.save();

    return ApiResponse.success(
        res,
        { message: "Meal plan deleted successfully" },
        200
    );
});
