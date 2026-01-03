import { User } from '../models/user.model.js'
import { MealPlan } from '../models/mealPlan.model.js'
import { Feedback } from '../models/feedback.model.js'
import { Constraint } from '../models/constraint.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { mlContractService } from '../services/mlContract.service.js'

// Get comprehensive analytics data
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    // Fetch all data in parallel
    const [
      user,
      mealPlans,
      feedbacks,
      constraints
    ] = await Promise.allSettled([
      User.findById(userId).select('-password -refreshToken'),
      MealPlan.find({ user: userId }).populate('meals.meal'),
      Feedback.find({ user: userId }),
      Constraint.find({ user: userId })
    ])

    // Try to get Flask analytics, but don't fail if Flask is not available
    let flaskData = null
    try {
      const flaskAnalytics = await mlContractService.getAnalytics(userId)
      flaskData = flaskAnalytics
    } catch (error) {
      console.log('Flask analytics not available:', error.message)
      // Continue without Flask data
    }

    // Process results
    const userData = user.status === 'fulfilled' ? user.value : null
    const mealPlansData = mealPlans.status === 'fulfilled' ? mealPlans.value : []
    const feedbacksData = feedbacks.status === 'fulfilled' ? feedbacks.value : []
    const constraintsData = constraints.status === 'fulfilled' ? constraints.value : []

    // Calculate statistics
    const totalMeals = mealPlansData.reduce((total, plan) => {
      return total + (plan.days?.reduce((dayTotal, day) => {
        return dayTotal + (day.meals?.length || 0)
      }, 0) || 0)
    }, 0)

    const accountAge = userData?.createdAt 
      ? Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Calculate activity days (days with any data creation)
    const activityDates = new Set()
    
    mealPlansData.forEach(plan => {
      if (plan.createdAt) {
        activityDates.add(new Date(plan.createdAt).toDateString())
      }
    })
    
    feedbacksData.forEach(feedback => {
      if (feedback.createdAt) {
        activityDates.add(new Date(feedback.createdAt).toDateString())
      }
    })

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

      // Data counts
      counts: {
        totalMealPlans: mealPlansData.length,
        totalMeals: totalMeals,
        totalFeedbacks: feedbacksData.length,
        totalConstraints: constraintsData.length,
        totalAiInteractions: flaskData?.totalInteractions || 0
      },

      // Statistics
      statistics: {
        accountAge: accountAge,
        activeDays: activityDates.size,
        averageMealsPerPlan: mealPlansData.length > 0 ? Math.round(totalMeals / mealPlansData.length) : 0,
        feedbackRate: totalMeals > 0 ? Math.round((feedbacksData.length / totalMeals) * 100) : 0
      },

      // Recent data
      recent: {
        latestMealPlan: mealPlansData[0] || null,
        latestFeedback: feedbacksData[0] || null,
        latestConstraint: constraintsData[0] || null
      },

      // Flask analytics (may be null if Flask is not available)
      flaskAnalytics: flaskData,

      // Data breakdown
      breakdown: {
        mealPlans: mealPlansData.map(plan => ({
          id: plan._id,
          title: plan.title,
          createdAt: plan.createdAt,
          mealCount: plan.days?.reduce((total, day) => total + (day.meals?.length || 0), 0) || 0
        })),
        feedbacks: feedbacksData.map(feedback => ({
          id: feedback._id,
          rating: feedback.rating,
          createdAt: feedback.createdAt,
          meal: feedback.meal
        })),
        constraints: constraintsData.map(constraint => ({
          id: constraint._id,
          type: constraint.type,
          value: constraint.value,
          createdAt: constraint.createdAt
        }))
      }
    }

    return res.status(200).json(
      new ApiResponse(200, analytics, "Analytics data retrieved successfully")
    )

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

    // Try to get Flask data, but don't fail if Flask is not available
    let flaskData = null
    try {
      const flaskExport = await mlContractService.exportUserData(userId)
      flaskData = flaskExport
    } catch (error) {
      console.log('Flask export not available:', error.message)
      // Continue without Flask data
    }

    const exportData = {
      exportInfo: {
        userId: userId,
        exportDate: new Date().toISOString(),
        version: '2.0',
        source: 'SmartBite Complete Data Export'
      },
      userData: user.status === 'fulfilled' ? user.value : null,
      mealPlans: mealPlans.status === 'fulfilled' ? mealPlans.value : [],
      feedbacks: feedbacks.status === 'fulfilled' ? feedbacks.value : [],
      constraints: constraints.status === 'fulfilled' ? constraints.value : [],
      flaskData: flaskData,
      summary: {
        totalMealPlans: mealPlans.status === 'fulfilled' ? mealPlans.value.length : 0,
        totalFeedbacks: feedbacks.status === 'fulfilled' ? feedbacks.value.length : 0,
        totalConstraints: constraints.status === 'fulfilled' ? constraints.value.length : 0,
        flaskDataAvailable: flaskData !== null
      },
      readme: {
        description: 'This file contains all your SmartBite data in a structured format.',
        sections: {
          userData: 'Your account information and preferences',
          mealPlans: 'All your created meal plans with detailed information',
          feedbacks: 'Your meal ratings and reviews',
          constraints: 'Your dietary constraints and preferences',
          flaskData: 'AI interactions and generated content (if available)'
        },
        note: flaskData ? 'Complete export including AI data' : 'Basic export - AI data not available (Flask service not running)',
        support: 'For questions about this data export, contact SmartBite support.'
      }
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="smartbite-data-${userId}-${Date.now()}.json"`)

    return res.status(200).json(exportData)

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

    return res.status(200).json(
      new ApiResponse(200, stats, "Feedback statistics retrieved successfully")
    )

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

    return res.status(200).json(
      new ApiResponse(200, stats, "Constraint statistics retrieved successfully")
    )

  } catch (error) {
    throw new ApiError(`Failed to fetch constraint stats: ${error.message}`, 500)
  }
})

export {
  getAnalytics,
  exportUserData,
  getFeedbackStats,
  getConstraintStats
}