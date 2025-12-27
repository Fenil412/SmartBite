import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { syncUserContextToFlask } from "../services/aiSync.service.js";

/* ===========================
   SUBMIT FEEDBACK
=========================== */
export const submitFeedback = asyncHandler(async (req, res) => {
  const { mealId, mealPlanId, type, rating, comment } = req.body;

  if (!type) {
    throw new ApiError(400, "Feedback type is required");
  }

  if (!mealId && !mealPlanId) {
    throw new ApiError(400, "Either mealId or mealPlanId is required");
  }

  const feedback = await Feedback.create({
    user: req.user._id,
    meal: mealId,
    mealPlan: mealPlanId,
    type,
    rating,
    comment
  });

  // Sync user context to Flask AI service
  try {
    const updatedUserContext = {
      userId: req.user._id,
      feedback: feedback
    };
    await syncUserContextToFlask(updatedUserContext);
  } catch (syncError) {
    console.error('Failed to sync user context:', syncError);
    // Don't fail the request if sync fails
  }

  return ApiResponse.success(
    res,
    {
      feedback,
      message: "Feedback submitted successfully"
    },
    201
  );
});

/* ===========================
   GET USER FEEDBACK HISTORY
=========================== */
export const getMyFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ user: req.user._id })
    .populate("meal", "name cuisine mealType")
    .populate("mealPlan", "title weekStartDate")
    .sort({ createdAt: -1 });

  return ApiResponse.success(
    res,
    {
      feedbacks,
      message: "Feedback history fetched"
    },
    200
  );
});
