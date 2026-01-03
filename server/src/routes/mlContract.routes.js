import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    getUserMLContext,
    getMealCatalogML,
    getMealCatalogStatsML
} from "../controllers/mlContract.controller.js";
import { mlContractService } from '../services/mlContract.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

const router = Router();

/**
 * Internal ML APIs (Node → Flask)
 * These endpoints are for internal use only - not exposed to frontend
 */
router.get("/ml/user-context", authMiddleware, getUserMLContext);
router.get("/ml/meals", authMiddleware, getMealCatalogML);
router.get("/ml/meals/stats", authMiddleware, getMealCatalogStatsML);

/**
 * Analytics and Data Export APIs
 * These endpoints provide analytics and data export functionality
 */

// Get AI user context
router.get('/ai-user-context/:userId', authMiddleware, asyncHandler(async (req, res) => {
  const { userId } = req.params
  
  try {
    const context = await mlContractService.getAIUserContext(userId)
    return res.status(200).json(
      new ApiResponse(200, context, "AI user context retrieved successfully")
    )
  } catch (error) {
    throw new ApiError(`Failed to get AI user context: ${error.message}`, 500)
  }
}))

// Get Flask analytics
router.get('/analytics/:userId', authMiddleware, asyncHandler(async (req, res) => {
  const { userId } = req.params
  
  try {
    const analytics = await mlContractService.getAnalytics(userId)
    return res.status(200).json(
      new ApiResponse(200, analytics, "Flask analytics retrieved successfully")
    )
  } catch (error) {
    throw new ApiError(`Failed to get Flask analytics: ${error.message}`, 500)
  }
}))

// Export Flask data
router.get('/export-data/:userId', authMiddleware, asyncHandler(async (req, res) => {
  const { userId } = req.params
  
  try {
    const exportData = await mlContractService.exportUserData(userId)
    return res.status(200).json(
      new ApiResponse(200, exportData, "Flask data exported successfully")
    )
  } catch (error) {
    throw new ApiError(`Failed to export Flask data: ${error.message}`, 500)
  }
}))

export default router;
