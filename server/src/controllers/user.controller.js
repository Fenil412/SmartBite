// src/controllers/user.controller.js

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"; // Importing the object { success, fail }
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  notifySignup,
  notifyLogin,
  notifyPasswordOtp,
  notifyPasswordChanged,
  notifyPasswordExpiry
} from "../services/notification.service.js";
import { syncUserContextToFlask, triggerUserContextSync } from "../services/aiSync.service.js";
import { buildUserMLContext } from "../services/mlContract.service.js";
import { Constraint } from "../models/constraint.model.js";
import { Feedback } from "../models/feedback.model.js";
import { MealPlan } from "../models/mealPlan.model.js";



// -------------------- CONSTANTS --------------------
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const PASSWORD_EXPIRY_DAYS = process.env.PASSWORD_EXPIRY_DAYS || 30;
const PASSWORD_REMINDER_DAYS_BEFORE = process.env.PASSWORD_REMINDER_DAYS_BEFORE || 5;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

// -------------------- HELPERS --------------------

const generateTokens = (user) => {
  const payload = {
    _id: user._id,
    role: user.roles,
    tokenVersion: user.tokenVersion || 0,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

const addActivity = async (user, action, metadata = {}) => {
  if (!user.activityHistory) {
    user.activityHistory = [];
  }
  user.activityHistory.push({ action, metadata, createdAt: new Date() });

  const MAX_HISTORY = 100;
  if (user.activityHistory.length > MAX_HISTORY) {
    user.activityHistory = user.activityHistory.slice(-MAX_HISTORY);
  }
};

const getSafeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetOtp;
  delete obj.passwordResetOtpExpiresAt;
  delete obj.activityHistory;
  return obj;
};

// -------------------- CONTROLLERS --------------------

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, profile, preferences, ...rest } = req.body;

  if (!fullName || !email || !password || !username) {
    throw new ApiError("fullName, email, username, and password are required", 400);
  }

  if (!profile || Object.keys(profile).length === 0) {
    throw new ApiError("User profile details are compulsory", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existedUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: username.trim() }]
  });

  if (existedUser) {
    throw new ApiError("User with this email or username already exists", 409);
  }

  const now = new Date();

  const user = await User.create({
    name: fullName,
    email: normalizedEmail,
    username: username.trim(),
    password,
    plainPassword: password,
    profile,
    preferences: preferences || {},
    tokenVersion: 0,
    passwordChangedAt: now,
    passwordExpiresAt: new Date(now.getTime() + PASSWORD_EXPIRY_DAYS * MS_IN_DAY),
    ...rest,
  });

  await addActivity(user, "REGISTER", {});
  await user.save({ validateBeforeSave: false });


  await notifySignup(user);


  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const safeUser = getSafeUser(user);

  // Response (Corrected: using ApiResponse.success)
  return ApiResponse.success(res, {
    user: safeUser,
    tokens: { accessToken, refreshToken },
    message: "User registered successfully"
  }, 201);
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("email and password are required", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +tokenVersion +refreshToken +passwordExpiresAt"
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid email or password", 401);
  }

  const now = new Date();
  if (user.passwordExpiresAt && user.passwordExpiresAt < now) {
    throw new ApiError("Password expired. Please reset your password via OTP.", 403);
  }

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;

  await addActivity(user, "LOGIN", { ip: req.ip });
  await user.save({ validateBeforeSave: false });


  await notifyLogin(user);

  const userContext = { user };
  try {
      await syncUserContextToFlask(userContext);
  } catch (err) {
      console.error("Failed to sync user context to Flask:", err.message);
      // We don't block login if sync fails, but we log it.
  }

  const safeUser = getSafeUser(user);

  return ApiResponse.success(res, {
    user: safeUser,
    tokens: { accessToken, refreshToken },
    message: "Login successful"
  }, 200);
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.refreshToken = null;

  await addActivity(user, "LOGOUT", { ip: req.ip });
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, { message: "Logout successful" }, 200);
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken =
    req.body?.refreshToken ||
    req.cookies?.refreshToken ||
    req.headers["x-refresh-token"];

  if (!incomingToken) {
    throw new ApiError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded._id).select(
    "+tokenVersion +refreshToken +roles"
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.tokenVersion !== decoded.tokenVersion) {
    throw new ApiError("Refresh token has been invalidated", 401);
  }

  if (!user.refreshToken || user.refreshToken !== incomingToken) {
    throw new ApiError("Refresh token mismatch", 401);
  }

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;

  await addActivity(user, "REFRESH_TOKEN", {});
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, { accessToken, refreshToken }, 200);
});

const requestPasswordOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError("email is required", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const now = new Date();

  user.passwordResetOtp = otp;
  user.passwordResetOtpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 min

  await addActivity(user, "REQUEST_PASSWORD_OTP", {});
  await user.save({ validateBeforeSave: false });


  await notifyPasswordOtp(user, otp);


  return ApiResponse.success(res, { message: "OTP sent to registered email" }, 200);
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError("email, otp, and newPassword are required", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordResetOtp +passwordResetOtpExpiresAt +tokenVersion"
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.passwordResetOtp || !user.passwordResetOtpExpiresAt || user.passwordResetOtp !== otp) {
    throw new ApiError("Invalid OTP", 400);
  }

  const now = new Date();
  if (user.passwordResetOtpExpiresAt < now) {
    throw new ApiError("OTP has expired", 400);
  }

  user.password = newPassword;
  user.passwordChangedAt = now;
  user.passwordExpiresAt = new Date(now.getTime() + PASSWORD_EXPIRY_DAYS * MS_IN_DAY);
  user.passwordResetOtp = null;
  user.passwordResetOtpExpiresAt = null;

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.refreshToken = null;

  await addActivity(user, "RESET_PASSWORD_OTP", {});
  await user.save();


  await notifyPasswordChanged(user);


  return ApiResponse.success(res, { message: "Password reset successfully" }, 200);
});

const sendPasswordExpiryReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  const reminderUpperBound = new Date(now.getTime() + PASSWORD_REMINDER_DAYS_BEFORE * MS_IN_DAY);

  const users = await User.find({
    passwordExpiresAt: { $gte: now, $lte: reminderUpperBound },
    passwordExpiryReminderSent: { $ne: true },
    isDeleted: false
  });


  let count = 0;

  for (const user of users) {
    try {
      await notifyPasswordExpiry(user, user.passwordExpiresAt);
      user.passwordExpiryReminderSent = true;
      await addActivity(user, "PASSWORD_EXPIRY_REMINDER_SENT", {});
      await user.save({ validateBeforeSave: false });
      count++;
    } catch (err) {
      console.error(`Error sending reminder to ${user.email}:`, err);
    }
  }

  return ApiResponse.success(res, { count, message: "Reminders sent" }, 200);
});

const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new ApiError("User not found", 404);
  }

  const userContext = { user };
  try {
      await syncUserContextToFlask(userContext);
  } catch (err) {
      console.error("Failed to sync user context to Flask:", err.message);
  }

  return ApiResponse.success(res, getSafeUser(user), 200);
});

const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!req.file || !req.file.path) {
    throw new ApiError("Avatar file is required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);

  if (!uploadResult || !uploadResult.secure_url) {
    throw new ApiError("Failed to upload avatar to Cloudinary", 500);
  }

  user.avatar = {
    publicId: uploadResult.public_id,
    url: uploadResult.secure_url,
  };

  await addActivity(user, "UPDATE_AVATAR", { avatarUrl: user.avatar.url });
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, getSafeUser(user), 200);
});

const deleteMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.refreshToken = null;
  try {
    await axios.delete(
      `${process.env.FLASK_AI_BASE_URL}/internal/delete-user/${userId}`
    );
  } catch (err) {
      console.error("Failed to delete user from Flask:", err.message);
  }

  await addActivity(user, "DELETE_PROFILE", {});
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, { message: "Profile deleted successfully" }, 200);
});

const getMyActivityHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId, { activityHistory: 1 });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return ApiResponse.success(res, { activityHistory: user.activityHistory || [] }, 200);
});

export const getUserProfile = asyncHandler(async (req, res) => {
  // Security check for internal endpoint
  if (req.headers["x-internal-key"] !== process.env.NODE_INTERNAL_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized internal access" });
  }

  const userId = req.params.userId;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID required" });
  }

  try {
    // Build comprehensive ML-ready user context
    const userContext = await buildUserMLContext(userId);

    // 🔥 PUSH ONCE TO FLASK
    try {
      await syncUserContextToFlask(userContext);
      console.log(`✅ User context synced to Flask for user: ${userId}`);
    } catch (syncError) {
      console.error(`❌ Failed to sync user context to Flask for user ${userId}:`, syncError.message);
      // Continue execution - Flask sync failure should not break the API
    }

    return res.json({
      success: true,
      data: userContext,
      syncedToFlask: true
    });
  } catch (error) {
    console.error(`❌ Failed to build user context for user ${userId}:`, error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to build user context",
      error: error.message 
    });
  }
});


const storeAdditionalData = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { 
    budgetTier, 
    preferredCuisines, 
    units, 
    dietaryPreferences, 
    dietaryRestrictions, 
    allergies, 
    medicalNotes, 
    favoriteMeals 
  } = req.body;

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new ApiError("User not found", 404);
  }

  // Update preferences
  if (budgetTier !== undefined || preferredCuisines !== undefined || units !== undefined) {
    user.preferences = {
      ...user.preferences,
      ...(budgetTier !== undefined && { budgetTier }),
      ...(preferredCuisines !== undefined && { preferredCuisines }),
      ...(units !== undefined && { units })
    };
  }

  // Update profile dietary information
  if (dietaryPreferences !== undefined || dietaryRestrictions !== undefined || 
      allergies !== undefined || medicalNotes !== undefined) {
    user.profile = {
      ...user.profile,
      ...(dietaryPreferences !== undefined && { dietaryPreferences }),
      ...(dietaryRestrictions !== undefined && { dietaryRestrictions }),
      ...(allergies !== undefined && { allergies }),
      ...(medicalNotes !== undefined && { medicalNotes })
    };
  }

  // Update favorite meals
  if (favoriteMeals !== undefined) {
    user.favoriteMeals = favoriteMeals;
  }

  await addActivity(user, "STORE_ADDITIONAL_DATA", { dataKeys: Object.keys(req.body) });
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, getSafeUser(user), 200);
});

const updateUserData = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { fullName, phone, profile, preferences } = req.body;

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new ApiError("User not found", 404);
  }

  // Update basic user data
  if (fullName !== undefined) {
    user.name = fullName;
  }
  if (phone !== undefined) {
    user.phone = phone;
  }
  
  // Update profile data
  if (profile) {
    user.profile = {
      ...user.profile,
      ...profile
    };
  }

  // Update preferences
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
  }

  await addActivity(user, "UPDATE_USER_DATA", { updatedFields: Object.keys(req.body) });
  await user.save({ validateBeforeSave: false });

  // 🔥 Trigger AI sync when user data changes
  triggerUserContextSync(userId);

  return ApiResponse.success(res, getSafeUser(user), 200);
});

const getActivityStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select('activityHistory lastActiveAt createdAt');
    
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const activityHistory = user.activityHistory || [];
    
    // Calculate total activities
    const totalActivities = activityHistory.length;
    
    // Calculate active days (unique days with activities)
    const uniqueDays = new Set();
    activityHistory.forEach(activity => {
      const date = new Date(activity.createdAt).toDateString();
      uniqueDays.add(date);
    });
    const activeDays = uniqueDays.size;
    
    // Calculate this week's activities
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekActivities = activityHistory.filter(activity => 
      new Date(activity.createdAt) >= oneWeekAgo
    ).length;
    
    // Get last active date
    const lastActive = user.lastActiveAt || (activityHistory.length > 0 ? 
      activityHistory[activityHistory.length - 1].createdAt : null);

    const stats = {
      totalActivities,
      activeDays,
      thisWeek: thisWeekActivities,
      lastActive
    };

    return ApiResponse.success(res, stats, 200);
  } catch (error) {
    throw new ApiError("Failed to fetch activity stats", 500);
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordOtp,
  resetPasswordWithOtp,
  sendPasswordExpiryReminders,
  getMe,
  updateAvatar,
  deleteMyProfile,
  getMyActivityHistory,
  getActivityStats,
  storeAdditionalData,
  updateUserData,
};