import { Meal } from "../models/meal.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ===========================
   CREATE MEAL
=========================== */
export const createMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.create({
    ...req.body,
    createdBy: req.user._id
  });

  return ApiResponse.success(
    res,
    {
      meal,
      message: "Meal created successfully"
    },
    201
  );

});

/* ===========================
   GET ALL MEALS (FILTERABLE)
=========================== */
export const getMeals = asyncHandler(async (req, res) => {
  const {
    cuisine,
    mealType,
    costLevel,
    vegetarian,
    page = 1,
    limit = 10
  } = req.query;

  const query = { isActive: true };

  if (cuisine) query.cuisine = cuisine;
  if (mealType) query.mealType = mealType;
  if (costLevel) query.costLevel = costLevel;
  if (vegetarian === "true") query.isVegetarian = true;

  const meals = await Meal.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: { path: "createdBy", select: "name email" }
  });

  return ApiResponse.success(
    res,
    {
      meals,
      message: "Meal fetched successfully"
    },
    200
  );
});

/* ===========================
   GET SINGLE MEAL
=========================== */
export const getMealById = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.mealId)
    .populate("createdBy", "name email");

  if (!meal || !meal.isActive) {
    throw new ApiError(404, "Meal not found");
  }

  return ApiResponse.success(
    res,
    {
      meal,
      message: "Meal fetched successfully"
    },
    200
  );
});

/* ===========================
   UPDATE MEAL
=========================== */
export const updateMeal = asyncHandler(async (req, res) => {
  const { mealId } = req.params;
  const userId = req.user._id;

  // Block sensitive fields from update
  const forbiddenFields = ["createdBy", "likedBy", "isActive", "_id"];
  forbiddenFields.forEach(field => delete req.body[field]);

  const meal = await Meal.findOne({
    _id: mealId,
    createdBy: userId,
    isActive: true
  });

  if (!meal) {
    throw new ApiError(404, "Meal not found or not authorized");
  }

  // Apply updates
  Object.assign(meal, req.body);
  await meal.save();

  return ApiResponse.success(
    res,
    {
      meal,
      message: "Meal updated successfully"
    },
    200
  );
});


/* ===========================
   LIKE / UNLIKE MEAL
=========================== */
export const toggleLikeMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.mealId);
  if (!meal) throw new ApiError(404, "Meal not found");

  const userId = req.user._id;
  const index = meal.likedBy.indexOf(userId);

  if (index === -1) {
    meal.likedBy.push(userId);
  } else {
    meal.likedBy.splice(index, 1);
  }

  await meal.save();

  return ApiResponse.success(
    res,
    {
      meal,
      message: "Meal liked updated successfully"
    },
    200
  );
});

/* ===========================
   DELETE MEAL (SOFT)
=========================== */
export const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOne({
    _id: req.params.mealId,
    createdBy: req.user._id
  });

  if (!meal) throw new ApiError(404, "Meal not found");

  meal.isActive = false;
  await meal.save();

  return ApiResponse.success(
    res,
    {
      meal: null,
      message: "Meal deleted successfully"
    },
    200
  );
});
