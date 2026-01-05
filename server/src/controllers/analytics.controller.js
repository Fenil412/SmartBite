import { User } from '../models/user.model.js'
import { Meal } from '../models/meal.model.js'
import { MealPlan } from '../models/mealPlan.model.js'
import { Feedback } from '../models/feedback.model.js'
import { Constraint } from '../models/constraint.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { AiHistoryService } from '../services/aiHistory.service.js'

// Get comprehensive analytics data
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    // Fetch all data in parallel
    const [
      user,
      totalMeals,
      totalMealPlans,
      feedbacks,
      constraints,
      latestMealPlan
    ] = await Promise.allSettled([
      User.findById(userId).select('-password -refreshToken'),
      Meal.countDocuments({ createdBy: userId }),
      MealPlan.countDocuments({ user: userId }),
      Feedback.find({ user: userId }).sort({ createdAt: -1 }),
      Constraint.find({ user: userId }).sort({ createdAt: -1 }),
      MealPlan.findOne({ user: userId }).sort({ createdAt: -1 }).select('title createdAt weekStartDate')
    ])

    // Get AI interactions directly from MongoDB ai_history collection
    let aiStats = {
      totalInteractions: 0,
      successfulInteractions: 0,
      failedInteractions: 0,
      successRate: 0,
      interactionsByType: [],
      recentInteractions: []
    }
    let totalAiInteractions = 0
    
    try {
      const fetchedAiStats = await AiHistoryService.getUserAiStats(userId)
      if (fetchedAiStats) {
        aiStats = fetchedAiStats
        totalAiInteractions = fetchedAiStats.totalInteractions || 0
      }
    } catch (error) {
      console.error('❌ Error fetching AI history:', error.message)
      // aiStats already has default values
    }

    // Process results
    const userData = user.status === 'fulfilled' ? user.value : null
    const mealCount = totalMeals.status === 'fulfilled' ? totalMeals.value : 0
    const mealPlanCount = totalMealPlans.status === 'fulfilled' ? totalMealPlans.value : 0
    const feedbacksData = feedbacks.status === 'fulfilled' ? feedbacks.value : []
    const constraintsData = constraints.status === 'fulfilled' ? constraints.value : []
    const latestMealPlanData = latestMealPlan.status === 'fulfilled' ? latestMealPlan.value : null

    const accountAge = userData?.createdAt 
      ? Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Calculate activity days (days with any data creation)
    const activityDates = new Set()
    
    // Add meal creation dates
    if (userData?.createdAt) {
      activityDates.add(new Date(userData.createdAt).toDateString())
    }
    
    feedbacksData.forEach(feedback => {
      if (feedback.createdAt) {
        activityDates.add(new Date(feedback.createdAt).toDateString())
      }
    })

    constraintsData.forEach(constraint => {
      if (constraint.createdAt) {
        activityDates.add(new Date(constraint.createdAt).toDateString())
      }
    })

    // Add AI interaction dates to activity
    if (aiStats?.interactionsByDate) {
      aiStats.interactionsByDate.forEach(day => {
        activityDates.add(new Date(day._id).toDateString())
      })
    }

    const analytics = {
      // User information
      user: {
        id: userData?._id,
        name: userData?.fullName || userData?.name,
        email: userData?.email,
        isVerified: userData?.isVerified || false,
        createdAt: userData?.createdAt,
        lastActiveAt: userData?.updatedAt,
        avatar: userData?.avatar
      },

      // Data counts - Using MongoDB AI data only
      counts: {
        totalMealPlans: mealPlanCount,
        totalMeals: mealCount,
        totalFeedbacks: feedbacksData.length,
        totalConstraints: constraintsData.length,
        totalAiInteractions: totalAiInteractions // Direct from MongoDB ai_history collection
      },

      // Statistics
      statistics: {
        accountAge: accountAge,
        activeDays: activityDates.size,
        averageMealsPerPlan: mealPlanCount > 0 ? Math.round(mealCount / mealPlanCount) : 0,
        feedbackRate: mealCount > 0 ? Math.round((feedbacksData.length / mealCount) * 100) : 0,
        aiSuccessRate: aiStats?.successRate || 0
      },

      // Recent data
      recent: {
        latestMealPlan: latestMealPlanData ? {
          title: latestMealPlanData.title,
          createdAt: latestMealPlanData.createdAt,
          weekStartDate: latestMealPlanData.weekStartDate
        } : null,
        latestFeedback: feedbacksData.length > 0 ? feedbacksData[0] : null,
        latestConstraint: constraintsData.length > 0 ? constraintsData[0] : null,
        recentAiInteractions: aiStats?.recentInteractions || []
      },

      // AI Analytics from MongoDB (always available)
      aiAnalytics: {
        totalInteractions: aiStats.totalInteractions || 0,
        successfulInteractions: aiStats.successfulInteractions || 0,
        failedInteractions: aiStats.failedInteractions || 0,
        successRate: aiStats.successRate || 0,
        interactionsByType: aiStats.interactionsByType || [],
        favoriteService: (aiStats.interactionsByType && aiStats.interactionsByType.length > 0) ? aiStats.interactionsByType[0] : null,
        recentActivity: (aiStats.recentInteractions || []).slice(0, 5),
        isOnline: true, // Always true since we're using MongoDB directly
        source: 'MongoDB'
      },

      // Data breakdown
      breakdown: {
        mealPlans: {
          total: mealPlanCount,
          description: 'All meal plans created (past, current, and future)'
        },
        meals: {
          total: mealCount,
          description: 'All individual meals created by user'
        },
        feedbacks: {
          total: feedbacksData.length,
          description: 'All meal ratings and reviews'
        },
        constraints: {
          total: constraintsData.length,
          description: 'All dietary constraints and preferences'
        },
        aiInteractions: {
          total: totalAiInteractions,
          description: 'All AI interactions from MongoDB ai_history collection',
          source: 'MongoDB',
          isOnline: true,
          breakdown: aiStats.interactionsByType || []
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: analytics,
      message: "Analytics data retrieved successfully"
    })

  } catch (error) {
    console.error('Analytics error:', error)
    throw new ApiError(`Failed to fetch analytics: ${error.message}`, 500)
  }
})

// Export user data
const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    // Fetch all user data
    const [
      user,
      mealPlans,
      feedbacks,
      constraints
    ] = await Promise.allSettled([
      User.findById(userId).select('-password -refreshToken'),
      MealPlan.find({ user: userId }).populate('meals.meal'),
      Feedback.find({ user: userId }).populate('meal'),
      Constraint.find({ user: userId })
    ])

    // Get AI data from MongoDB
    let aiData = null
    try {
      aiData = await AiHistoryService.getUserAiStats(userId)
    } catch (error) {
      console.error('Error fetching AI data for export:', error.message)
    }

    const exportData = {
      exportInfo: {
        userId: userId,
        exportDate: new Date().toISOString(),
        version: '3.0',
        source: 'SmartBite Complete Data Export (MongoDB Direct)'
      },
      userData: user.status === 'fulfilled' ? user.value : null,
      mealPlans: mealPlans.status === 'fulfilled' ? mealPlans.value : [],
      feedbacks: feedbacks.status === 'fulfilled' ? feedbacks.value : [],
      constraints: constraints.status === 'fulfilled' ? constraints.value : [],
      aiData: aiData,
      summary: {
        totalMealPlans: mealPlans.status === 'fulfilled' ? mealPlans.value.length : 0,
        totalFeedbacks: feedbacks.status === 'fulfilled' ? feedbacks.value.length : 0,
        totalConstraints: constraints.status === 'fulfilled' ? constraints.value.length : 0,
        totalAiInteractions: aiData?.totalInteractions || 0,
        aiDataAvailable: aiData !== null
      },
      readme: {
        description: 'This file contains all your SmartBite data in a structured format.',
        sections: {
          userData: 'Your account information and preferences',
          mealPlans: 'All your created meal plans with detailed information',
          feedbacks: 'Your meal ratings and reviews',
          constraints: 'Your dietary constraints and preferences',
          aiData: 'AI interactions and usage statistics from MongoDB'
        },
        note: aiData ? 'Complete export including AI interaction data' : 'Basic export - AI data not available',
        support: 'For questions about this data export, contact SmartBite support.'
      }
    }

    return res.status(200).json({
      success: true,
      data: exportData,
      message: "Data exported successfully"
    })

  } catch (error) {
    console.error('Export error:', error)
    throw new ApiError(`Failed to export data: ${error.message}`, 500)
  }
})

// Get feedback statistics
const getFeedbackStats = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const feedbacks = await Feedback.find({ user: userId }).populate('meal')
    
    const stats = {
      total: feedbacks.length,
      averageRating: feedbacks.length > 0 
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
        : 0,
      ratingDistribution: {
        1: feedbacks.filter(f => f.rating === 1).length,
        2: feedbacks.filter(f => f.rating === 2).length,
        3: feedbacks.filter(f => f.rating === 3).length,
        4: feedbacks.filter(f => f.rating === 4).length,
        5: feedbacks.filter(f => f.rating === 5).length
      },
      recent: feedbacks.slice(0, 10)
    }

    return res.status(200).json({
      success: true,
      data: stats,
      message: "Feedback statistics retrieved successfully"
    })

  } catch (error) {
    throw new ApiError(`Failed to fetch feedback stats: ${error.message}`, 500)
  }
})

// Get constraint statistics
const getConstraintStats = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const constraints = await Constraint.find({ user: userId })
    
    const stats = {
      total: constraints.length,
      byType: constraints.reduce((acc, constraint) => {
        acc[constraint.type] = (acc[constraint.type] || 0) + 1
        return acc
      }, {}),
      recent: constraints.slice(0, 10)
    }

    return res.status(200).json({
      success: true,
      data: stats,
      message: "Constraint statistics retrieved successfully"
    })

  } catch (error) {
    throw new ApiError(`Failed to fetch constraint stats: ${error.message}`, 500)
  }
})

// Get AI interaction statistics
const getAiInteractionStats = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const aiStats = await AiHistoryService.getUserAiStats(userId)
    
    return res.status(200).json({
      success: true,
      data: aiStats,
      message: "AI interaction statistics retrieved successfully"
    })

  } catch (error) {
    console.error('AI stats error:', error)
    throw new ApiError(`Failed to fetch AI interaction stats: ${error.message}`, 500)
  }
})

// Get AI interaction history with pagination
const getAiInteractionHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { page = 1, limit = 20, type, startDate, endDate, success } = req.query

  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      startDate,
      endDate,
      success: success !== undefined ? success === 'true' : null
    }

    const history = await AiHistoryService.getUserAiHistory(userId, options)
    
    return res.status(200).json({
      success: true,
      data: history,
      message: "AI interaction history retrieved successfully"
    })

  } catch (error) {
    console.error('AI history error:', error)
    throw new ApiError(`Failed to fetch AI interaction history: ${error.message}`, 500)
  }
})

// Get AI dashboard summary
const getAiDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const summary = await AiHistoryService.getDashboardSummary(userId)
    
    return res.status(200).json({
      success: true,
      data: summary,
      message: "AI dashboard summary retrieved successfully"
    })

  } catch (error) {
    console.error('AI dashboard summary error:', error)
    throw new ApiError(`Failed to fetch AI dashboard summary: ${error.message}`, 500)
  }
})

export {
  getAnalytics,
  exportUserData,
  getFeedbackStats,
  getConstraintStats,
  getAiInteractionStats,
  getAiInteractionHistory,
  getAiDashboardSummary
}