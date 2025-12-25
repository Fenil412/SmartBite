import { Constraint } from "../models/constraint.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { syncUserContextToFlask } from "../services/aiSync.service.js";

/* ===========================
   CREATE / UPDATE CONSTRAINTS
=========================== */
export const upsertConstraints = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
        maxCookTime,
        skillLevel,
        appliances,
        cookingDays
    } = req.body;

    const constraint = await Constraint.findOneAndUpdate(
        { user: userId },
        {
            maxCookTime,
            skillLevel,
            appliances,
            cookingDays
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    await syncUserContextToFlask(updatedUserContext);

    return ApiResponse.success(
        res,
        { constraint },
        200
    );
});

export const updateConstraints = asyncHandler(async (req, res) => {
    const { maxCookTime, skillLevel, appliances } = req.body;

    if (!maxCookTime && !skillLevel && !appliances) {
        throw new ApiError(400, "At least one constraint is required");
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    if (maxCookTime !== undefined) user.constraints.maxCookTime = maxCookTime;
    if (skillLevel) user.constraints.skillLevel = skillLevel;
    if (Array.isArray(appliances)) user.constraints.appliances = appliances;

    await user.save({ validateBeforeSave: false });

    await syncUserContextToFlask(updatedUserContext);

    return ApiResponse.success(
        res,
        {
            constraints: user.constraints,
            message: "Constraints updated successfully"
        },
        200
    );
});

/* ===========================
   GET MY CONSTRAINTS
=========================== */
export const getMyConstraints = asyncHandler(async (req, res) => {
    const constraint = await Constraint.findOne({
        user: req.user._id
    });

    if (!constraint) {
        throw new ApiError(404, "Constraints not set yet");
    }

    return ApiResponse.success(
        res,
        { constraint },
        200
    );
});

/* ===========================
   DELETE CONSTRAINTS
=========================== */
export const deleteConstraints = asyncHandler(async (req, res) => {
    await Constraint.findOneAndDelete({
        user: req.user._id
    });

    await syncUserContextToFlask(updatedUserContext);

    return ApiResponse.success(
        res,
        { message: "Constraints removed successfully" },
        200
    );
});
