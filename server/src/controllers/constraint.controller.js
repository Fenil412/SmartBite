import { Constraint } from "../models/constraint.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
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

    console.log('🔍 DEBUG: Upserting constraints for user:', userId);
    console.log('🔍 DEBUG: Request body:', req.body);

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

    console.log('🔍 DEBUG: Upserted constraint:', constraint);

    // Sync user context to Flask AI service
    try {
        const updatedUserContext = {
            userId,
            constraints: constraint
        };
        await syncUserContextToFlask(updatedUserContext);
        console.log('🔍 DEBUG: Successfully synced to Flask');
    } catch (syncError) {
        console.error('🔍 DEBUG: Failed to sync user context:', syncError);
        // Don't fail the request if sync fails
    }

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
    console.log('🔍 DEBUG: Getting constraints for user:', userId);
    
    let constraint = await Constraint.findOne({
        user: userId
    });

    console.log('🔍 DEBUG: Found constraint:', constraint);

    // If no constraints found, return default values instead of 404
    if (!constraint) {
        console.log('🔍 DEBUG: No constraints found, returning defaults');
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

    console.log('🔍 DEBUG: Returning constraint:', constraint);

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
    console.log('🔍 DEBUG: Deleting constraints for user:', userId);
    
    const constraint = await Constraint.findOneAndDelete({
        user: userId
    });

    console.log('🔍 DEBUG: Deleted constraint:', constraint);

    // Sync user context to Flask AI service
    try {
        const updatedUserContext = {
            userId: userId,
            constraints: null
        };
        await syncUserContextToFlask(updatedUserContext);
        console.log('🔍 DEBUG: Successfully synced deletion to Flask');
    } catch (syncError) {
        console.error('🔍 DEBUG: Failed to sync user context:', syncError);
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
