import { User } from "../models/user.model.js";
import { Meal } from "../models/meal.model.js";
import { MealPlan } from "../models/mealPlan.model.js";
import { Feedback } from "../models/feedback.model.js";
import { Constraint } from "../models/constraint.model.js";
import { Notification } from "../models/notification.model.js";
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

    // Previous periods for comparison
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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
    const mealsThisMonth = await Meal.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const mealsLastWeek = await Meal.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek }
    });
    const mealsLastMonth = await Meal.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Meal Plan Statistics
    const totalMealPlans = await MealPlan.countDocuments();
    const mealPlansToday = await MealPlan.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const mealPlansThisWeek = await MealPlan.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const mealPlansThisMonth = await MealPlan.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const mealPlansLastWeek = await MealPlan.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek }
    });
    const mealPlansLastMonth = await MealPlan.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Feedback Statistics
    const totalFeedback = await Feedback.countDocuments();
    const feedbackToday = await Feedback.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const feedbackThisWeek = await Feedback.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const feedbackThisMonth = await Feedback.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const feedbackLastWeek = await Feedback.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek }
    });
    const feedbackLastMonth = await Feedback.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Notification Statistics
    const totalNotifications = await Notification.countDocuments();
    const notificationsToday = await Notification.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const notificationsThisWeek = await Notification.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const notificationsThisMonth = await Notification.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const notificationsLastWeek = await Notification.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek }
    });
    const notificationsLastMonth = await Notification.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Constraint Statistics
    const totalConstraints = await Constraint.countDocuments();
    const constraintsToday = await Constraint.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const constraintsThisWeek = await Constraint.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const constraintsThisMonth = await Constraint.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const constraintsLastWeek = await Constraint.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek }
    });
    const constraintsLastMonth = await Constraint.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

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
        thisWeek: mealsThisWeek,
        thisMonth: mealsThisMonth,
        weeklyChange: calculatePercentageChange(mealsThisWeek, mealsLastWeek),
        monthlyChange: calculatePercentageChange(mealsThisMonth, mealsLastMonth)
      },
      mealPlans: {
        total: totalMealPlans,
        today: mealPlansToday,
        thisWeek: mealPlansThisWeek,
        thisMonth: mealPlansThisMonth,
        weeklyChange: calculatePercentageChange(mealPlansThisWeek, mealPlansLastWeek),
        monthlyChange: calculatePercentageChange(mealPlansThisMonth, mealPlansLastMonth)
      },
      feedback: {
        total: totalFeedback,
        today: feedbackToday,
        thisWeek: feedbackThisWeek,
        thisMonth: feedbackThisMonth,
        weeklyChange: calculatePercentageChange(feedbackThisWeek, feedbackLastWeek),
        monthlyChange: calculatePercentageChange(feedbackThisMonth, feedbackLastMonth)
      },
      constraints: {
        total: totalConstraints,
        today: constraintsToday,
        thisWeek: constraintsThisWeek,
        thisMonth: constraintsThisMonth,
        weeklyChange: calculatePercentageChange(constraintsThisWeek, constraintsLastWeek),
        monthlyChange: calculatePercentageChange(constraintsThisMonth, constraintsLastMonth)
      },
      notifications: {
        total: totalNotifications,
        today: notificationsToday,
        thisWeek: notificationsThisWeek,
        thisMonth: notificationsThisMonth,
        weeklyChange: calculatePercentageChange(notificationsThisWeek, notificationsLastWeek),
        monthlyChange: calculatePercentageChange(notificationsThisMonth, notificationsLastMonth)
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
      { path: "user", select: "name email username" }
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

// -------------------- MEAL PLANS MANAGEMENT --------------------

const getAllMealPlans = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { 
    page = 1, 
    limit = 20, 
    search = "", 
    isActive = "",
    userId = ""
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } }
    ];
  }

  if (isActive !== "") {
    query.isActive = isActive === "true";
  }

  if (userId) {
    query.user = userId;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "user", select: "name email username" },
      { path: "days.meals.meal", select: "name cuisine" }
    ]
  };

  try {
    const mealPlans = await MealPlan.paginate(query, options);
    
    return ApiResponse.success(res, {
      mealPlans: mealPlans.docs,
      pagination: {
        currentPage: mealPlans.page,
        totalPages: mealPlans.totalPages,
        totalMealPlans: mealPlans.totalDocs,
        hasNextPage: mealPlans.hasNextPage,
        hasPrevPage: mealPlans.hasPrevPage
      }
    }, 200);
  } catch (error) {
    console.error('MealPlan paginate error:', error);
    throw new ApiError("Failed to fetch meal plans", 500);
  }
});

const deleteMealPlan = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { mealPlanId } = req.params;

  const mealPlan = await MealPlan.findById(mealPlanId);
  if (!mealPlan) {
    throw new ApiError("Meal plan not found", 404);
  }

  await MealPlan.findByIdAndDelete(mealPlanId);
  return ApiResponse.success(res, { message: "Meal plan deleted successfully" }, 200);
});

// -------------------- CONSTRAINTS MANAGEMENT --------------------

const getAllConstraints = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { 
    page = 1, 
    limit = 20, 
    userId = ""
  } = req.query;

  const query = {};

  if (userId) {
    query.user = userId;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "user", select: "name email username" }
    ]
  };

  const constraints = await Constraint.paginate(query, options);

  return ApiResponse.success(res, {
    constraints: constraints.docs,
    pagination: {
      currentPage: constraints.page,
      totalPages: constraints.totalPages,
      totalConstraints: constraints.totalDocs,
      hasNextPage: constraints.hasNextPage,
      hasPrevPage: constraints.hasPrevPage
    }
  }, 200);
});

const deleteConstraint = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { constraintId } = req.params;

  const constraint = await Constraint.findById(constraintId);
  if (!constraint) {
    throw new ApiError("Constraint not found", 404);
  }

  await Constraint.findByIdAndDelete(constraintId);
  return ApiResponse.success(res, { message: "Constraint deleted successfully" }, 200);
});

// -------------------- NOTIFICATIONS MANAGEMENT --------------------

const getAllNotifications = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { 
    page = 1, 
    limit = 20, 
    type = "",
    isRead = "",
    userId = ""
  } = req.query;

  const query = {};

  if (type) {
    query.type = type;
  }

  if (isRead !== "") {
    query.isRead = isRead === "true";
  }

  if (userId) {
    query.user = userId;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "user", select: "name email username" }
    ]
  };

  const notifications = await Notification.paginate(query, options);

  return ApiResponse.success(res, {
    notifications: notifications.docs,
    pagination: {
      currentPage: notifications.page,
      totalPages: notifications.totalPages,
      totalNotifications: notifications.totalDocs,
      hasNextPage: notifications.hasNextPage,
      hasPrevPage: notifications.hasPrevPage
    }
  }, 200);
});

const deleteNotification = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  await Notification.findByIdAndDelete(notificationId);
  return ApiResponse.success(res, { message: "Notification deleted successfully" }, 200);
});

const deleteFeedback = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { feedbackId } = req.params;

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    throw new ApiError("Feedback not found", 404);
  }

  await Feedback.findByIdAndDelete(feedbackId);
  return ApiResponse.success(res, { message: "Feedback deleted successfully" }, 200);
});

// -------------------- DATA EXPORT --------------------

const exportData = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { type } = req.params;
  const validTypes = ['users', 'meals', 'meal-plans', 'constraints', 'notifications', 'feedback'];
  
  if (!validTypes.includes(type)) {
    throw new ApiError("Invalid export type", 400);
  }

  try {
    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
      case 'users':
        const users = await User.find({ isDeleted: false })
          .select('name email username roles isVerified createdAt')
          .lean();
        
        headers = ['Name', 'Email', 'Username', 'Roles', 'Verified', 'Created At'];
        data = users.map(user => [
          user.name || '',
          user.email || '',
          user.username || '',
          (user.roles || []).join(', '),
          user.isVerified ? 'Yes' : 'No',
          new Date(user.createdAt).toLocaleDateString()
        ]);
        filename = 'users_export';
        break;

      case 'meals':
        const meals = await Meal.find()
          .populate('createdBy', 'name email')
          .select('name cuisine mealType nutrition.calories status createdAt')
          .lean();
        
        headers = ['Name', 'Cuisine', 'Meal Type', 'Calories', 'Status', 'Created By', 'Created At'];
        data = meals.map(meal => [
          meal.name || '',
          meal.cuisine || '',
          meal.mealType || '',
          meal.nutrition?.calories || 0,
          meal.status || 'approved',
          meal.createdBy?.name || 'Unknown',
          new Date(meal.createdAt).toLocaleDateString()
        ]);
        filename = 'meals_export';
        break;

      case 'meal-plans':
        const mealPlans = await MealPlan.find()
          .populate('user', 'name email')
          .select('title weekStartDate isActive generatedBy createdAt')
          .lean();
        
        headers = ['Title', 'Week Start', 'Status', 'Generated By', 'User', 'Created At'];
        data = mealPlans.map(plan => [
          plan.title || '',
          new Date(plan.weekStartDate).toLocaleDateString(),
          plan.isActive ? 'Active' : 'Inactive',
          plan.generatedBy || 'ai',
          plan.user?.name || 'Unknown',
          new Date(plan.createdAt).toLocaleDateString()
        ]);
        filename = 'meal_plans_export';
        break;

      case 'constraints':
        const constraints = await Constraint.find()
          .populate('user', 'name email')
          .select('maxCookTime skillLevel appliances user createdAt')
          .lean();
        
        headers = ['User', 'Max Cook Time', 'Skill Level', 'Appliances', 'Created At'];
        data = constraints.map(constraint => [
          constraint.user?.name || 'Unknown',
          `${constraint.maxCookTime || 0} minutes`,
          constraint.skillLevel || 'beginner',
          Object.entries(constraint.appliances || {})
            .filter(([key, value]) => value)
            .map(([key]) => key.replace('has', ''))
            .join(', ') || 'None',
          new Date(constraint.createdAt).toLocaleDateString()
        ]);
        filename = 'constraints_export';
        break;

      case 'notifications':
        const notifications = await Notification.find()
          .populate('user', 'name email')
          .select('event status isRead user createdAt')
          .lean();
        
        headers = ['User', 'Event', 'Status', 'Read Status', 'Created At'];
        data = notifications.map(notification => [
          notification.user?.name || 'Unknown',
          notification.event || '',
          notification.status || 'pending',
          notification.isRead ? 'Read' : 'Unread',
          new Date(notification.createdAt).toLocaleDateString()
        ]);
        filename = 'notifications_export';
        break;

      case 'feedback':
        const feedback = await Feedback.find()
          .populate('user', 'name email')
          .populate('meal', 'name')
          .populate('mealPlan', 'title')
          .select('type rating comment user meal mealPlan createdAt')
          .lean();
        
        headers = ['User', 'Type', 'Rating', 'Comment', 'Related To', 'Created At'];
        data = feedback.map(fb => [
          fb.user?.name || 'Unknown',
          fb.type || '',
          fb.rating || 0,
          (fb.comment || '').substring(0, 100) + (fb.comment?.length > 100 ? '...' : ''),
          fb.meal?.name || fb.mealPlan?.title || 'General',
          new Date(fb.createdAt).toLocaleDateString()
        ]);
        filename = 'feedback_export';
        break;

      default:
        throw new ApiError("Invalid export type", 400);
    }

    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
    
    return res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    throw new ApiError("Failed to export data", 500);
  }
});

export {
  getDashboardStats,
  getSystemInfo,
  getAllMeals,
  updateMealStatus,
  deleteMeal,
  getAllMealPlans,
  deleteMealPlan,
  getAllConstraints,
  deleteConstraint,
  getAllNotifications,
  deleteNotification,
  getAllFeedback,
  deleteFeedback,
  getRecentActivity,
  getAdminCodes,
  regenerateAdminCodes,
  exportData
};