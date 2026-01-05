import { Constraint } from "../models/constraint.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { triggerUserContextSync } from "../services/aiSync.service.js";

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

    // Trigger AI sync when constraints change
    triggerUserContextSync(userId);

    return ApiResponse.success(
        res,
        { constraint },
        200
    );
});

/* ===========================
   GET MY CONSTRAINTS
=========================== */
export const getMyConstraints = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    let constraint = await Constraint.findOne({
        user: userId
    });

    // If no constraints found, return default values instead of 404
    if (!constraint) {
        constraint = {
            user: userId,
            maxCookTime: 30,
            skillLevel: 'beginner',
            appliances: {
                hasGasStove: true,
                hasOven: false,
                hasMicrowave: true,
                hasAirFryer: false,
                hasBlender: false
            },
            cookingDays: []
        };
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
    const userId = req.user._id;
    
    const constraint = await Constraint.findOneAndDelete({
        user: userId
    });

    // Sync user context to Flask AI service
    try {
        const { syncUserContextToFlask } = await import("./aiSync.service.js");
        const updatedUserContext = {
            userId: userId,
            constraints: null
        };
        await syncUserContextToFlask(updatedUserContext);
    } catch (syncError) {
        // Don't fail the request if sync fails
    }

    return ApiResponse.success(
        res,
        { 
            message: constraint 
                ? "Constraints removed successfully" 
                : "No constraints found to remove"
        },
        200
    );
});
