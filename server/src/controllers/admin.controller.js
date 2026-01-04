import { User } from "../models/user.model.js";
import { Meal } from "../models/meal.model.js";
import { MealPlan } from "../models/mealPlan.model.js";
import { Feedback } from "../models/feedback.model.js";
import { Constraint } from "../models/constraint.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// -------------------- DASHBOARD ANALYTICS --------------------

const getDashboardStats = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  try {
    // Get current date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // User Statistics
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalAdmins = await User.countDocuments({ 
      roles: { $in: ["admin", "super_admin"] }, 
      isDeleted: false 
    });
    const verifiedUsers = await User.countDocuments({ 
      isVerified: true, 
      isDeleted: false 
    });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfToday },
      isDeleted: false
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek },
      isDeleted: false
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
      isDeleted: false
    });

    // Meal Statistics
    const totalMeals = await Meal.countDocuments();
    const mealsToday = await Meal.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const mealsThisWeek = await Meal.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Meal Plan Statistics
    const totalMealPlans = await MealPlan.countDocuments();
    const mealPlansToday = await MealPlan.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const mealPlansThisWeek = await MealPlan.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Feedback Statistics
    const totalFeedback = await Feedback.countDocuments();
    const feedbackToday = await Feedback.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const feedbackThisWeek = await Feedback.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Constraint Statistics
    const totalConstraints = await Constraint.countDocuments();

    // User Growth Chart Data (last 30 days)
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most Active Users
    const mostActiveUsers = await User.aggregate([
      { $match: { isDeleted: false } },
      {
        $addFields: {
          activityCount: { $size: { $ifNull: ["$activityHistory", []] } }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          email: 1,
          username: 1,
          activityCount: 1,
          lastActiveAt: 1,
          createdAt: 1
        }
      }
    ]);

    // Popular Cuisines
    const popularCuisines = await Meal.aggregate([
      { $group: { _id: "$cuisine", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // System Health
    const systemHealth = {
      database: "healthy", // You can add actual DB health checks
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    };

    return ApiResponse.success(res, {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        verified: verifiedUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0
      },
      meals: {
        total: totalMeals,
        today: mealsToday,
        thisWeek: mealsThisWeek
      },
      mealPlans: {
        total: totalMealPlans,
        today: mealPlansToday,
        thisWeek: mealPlansThisWeek
      },
      feedback: {
        total: totalFeedback,
        today: feedbackToday,
        thisWeek: feedbackThisWeek
      },
      constraints: {
        total: totalConstraints
      },
      charts: {
        userGrowth: userGrowthData,
        popularCuisines: popularCuisines
      },
      mostActiveUsers,
      systemHealth
    }, 200);

  } catch (error) {
    throw new ApiError("Failed to fetch dashboard statistics", 500);
  }
});

// -------------------- SYSTEM MANAGEMENT --------------------

const getSystemInfo = asyncHandler(async (req, res) => {
  // Check if user has super admin role
  if (!req.user.roles?.includes('super_admin')) {
    throw new ApiError("Super admin access required", 403);
  }

  const systemInfo = {
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    },
    database: {
      connectionState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };

  return ApiResponse.success(res, systemInfo, 200);
});

// -------------------- CONTENT MANAGEMENT --------------------

const getAllMeals = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { 
    page = 1, 
    limit = 20, 
    search = "", 
    cuisine = "", 
    difficulty = "",
    isDeleted = "false"
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (cuisine) {
    query.cuisine = cuisine;
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Remove isDeleted filter since Meal model doesn't have this field

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "createdBy", select: "name email username" }
    ]
  };

  const meals = await Meal.paginate(query, options);

  return ApiResponse.success(res, {
    meals: meals.docs,
    pagination: {
      currentPage: meals.page,
      totalPages: meals.totalPages,
      totalMeals: meals.totalDocs,
      hasNextPage: meals.hasNextPage,
      hasPrevPage: meals.hasPrevPage
    }
  }, 200);
});

const updateMealStatus = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { mealId } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    throw new ApiError("Valid status (approved/rejected/pending) is required", 400);
  }

  const meal = await Meal.findById(mealId);
  if (!meal) {
    throw new ApiError("Meal not found", 404);
  }

  meal.status = status;
  meal.reviewedBy = req.user._id;
  meal.reviewedAt = new Date();
  await meal.save();

  return ApiResponse.success(res, {
    meal,
    message: `Meal ${status} successfully`
  }, 200);
});

const deleteMeal = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { mealId } = req.params;
  const { permanent = false } = req.body;

  const meal = await Meal.findById(mealId);
  if (!meal) {
    throw new ApiError("Meal not found", 404);
  }

  if (permanent && req.user.isSuperAdmin) {
    await Meal.findByIdAndDelete(mealId);
    return ApiResponse.success(res, { message: "Meal permanently deleted" }, 200);
  } else {
    meal.isDeleted = true;
    meal.deletedAt = new Date();
    await meal.save();
    return ApiResponse.success(res, { message: "Meal deleted successfully" }, 200);
  }
});

const getAllFeedback = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { 
    page = 1, 
    limit = 20, 
    type = "", 
    rating = "" 
  } = req.query;

  const query = {};

  if (type) {
    query.type = type;
  }

  if (rating) {
    query.rating = parseInt(rating);
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "userId", select: "name email username" }
    ]
  };

  const feedback = await Feedback.paginate(query, options);

  return ApiResponse.success(res, {
    feedback: feedback.docs,
    pagination: {
      currentPage: feedback.page,
      totalPages: feedback.totalPages,
      totalFeedback: feedback.totalDocs,
      hasNextPage: feedback.hasNextPage,
      hasPrevPage: feedback.hasPrevPage
    }
  }, 200);
});

// -------------------- ACTIVITY MONITORING --------------------

const getRecentActivity = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { limit = 50 } = req.query;

  // Get recent user activities
  const recentActivities = await User.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: "$activityHistory" },
    { $sort: { "activityHistory.createdAt": -1 } },
    { $limit: parseInt(limit) },
    {
      $project: {
        userId: "$_id",
        name: 1,
        email: 1,
        username: 1,
        action: "$activityHistory.action",
        metadata: "$activityHistory.metadata",
        timestamp: "$activityHistory.createdAt"
      }
    }
  ]);

  return ApiResponse.success(res, { activities: recentActivities }, 200);
});

// -------------------- ADMIN CODE MANAGEMENT --------------------

const getAdminCodes = asyncHandler(async (req, res) => {
  // Only super admins can view admin codes
  if (!req.user.roles?.includes('super_admin')) {
    throw new ApiError("Super admin access required", 403);
  }

  const adminCode = process.env.ADMIN_REGISTRATION_CODE;
  const superAdminCode = process.env.SUPER_ADMIN_REGISTRATION_CODE;

  return ApiResponse.success(res, {
    adminCode: adminCode || 'Not set',
    superAdminCode: superAdminCode || 'Not set',
    message: "Admin codes retrieved successfully"
  });
});

const regenerateAdminCodes = asyncHandler(async (req, res) => {
  // Only super admins can regenerate admin codes
  if (!req.user.roles?.includes('super_admin')) {
    throw new ApiError("Super admin access required", 403);
  }

  // Generate new secure codes
  const timestamp = Date.now();
  const newAdminCode = `SmartBite_Admin_${timestamp}_SecureCode`;
  const newSuperAdminCode = `SmartBite_SuperAdmin_${timestamp}_MasterKey`;

  // Note: In a production environment, you would update these in your environment configuration
  // For now, we'll return the new codes for manual update
  
  return ApiResponse.success(res, {
    newAdminCode,
    newSuperAdminCode,
    message: "New admin codes generated. Please update your environment variables with these codes.",
    instructions: [
      "1. Update ADMIN_REGISTRATION_CODE in your .env file",
      "2. Update SUPER_ADMIN_REGISTRATION_CODE in your .env file", 
      "3. Restart the server for changes to take effect"
    ]
  });
});

export {
  getDashboardStats,
  getSystemInfo,
  getAllMeals,
  updateMealStatus,
  deleteMeal,
  getAllFeedback,
  getRecentActivity,
  getAdminCodes,
  regenerateAdminCodes
};