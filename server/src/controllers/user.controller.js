// src/controllers/user.controller.js

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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
    roles: user.roles, // Changed from role to roles
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
  const { fullName, email, username, password, profile, preferences, adminCode, requestAdminRole, ...rest } = req.body;

  if (!fullName || !email || !password || !username) {
    throw new ApiError("fullName, email, username, and password are required", 400);
  }

  if (!profile || Object.keys(profile).length === 0) {
    throw new ApiError("User profile details are compulsory", 400);
  }

  // Admin registration code validation
  let userRoles = ["user"]; // Default role
  
  if (requestAdminRole) {
    if (!adminCode) {
      throw new ApiError("Admin registration code is required for admin accounts", 400);
    }

    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE;
    const validSuperAdminCode = process.env.SUPER_ADMIN_REGISTRATION_CODE;

    if (adminCode === validSuperAdminCode) {
      userRoles = ["user", "admin", "super_admin"];
    } else if (adminCode === validAdminCode) {
      userRoles = ["user", "admin"];
    } else {
      throw new ApiError("Invalid admin registration code", 401);
    }
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing user before creating
  const existedUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: username.trim() }]
  });

  if (existedUser) {
    throw new ApiError("User with this email or username already exists", 409);
  }

  const now = new Date();

  try {
    const user = await User.create({
      name: fullName,
      email: normalizedEmail,
      username: username.trim(),
      password,
      plainPassword: password,
      profile,
      preferences: preferences || {},
      roles: userRoles, // Set the appropriate roles
      tokenVersion: 0,
      passwordChangedAt: now,
      passwordExpiresAt: new Date(now.getTime() + PASSWORD_EXPIRY_DAYS * MS_IN_DAY),
      ...rest,
    });

    await addActivity(user, "REGISTER", { roles: userRoles });
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
      message: requestAdminRole 
        ? `Admin account registered successfully with ${userRoles.includes('super_admin') ? 'Super Admin' : 'Admin'} privileges`
        : "User registered successfully"
    }, 201);

  } catch (error) {
    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      const duplicateError = User.handleDuplicateError(error);
      if (duplicateError) {
        throw new ApiError(duplicateError.message, 409);
      }
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      throw new ApiError(messages.join(', '), 400);
    }
    
    // Re-throw other errors
    throw error;
  }
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
      // We don't block login if sync fails
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
      // Continue with next user if notification fails
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
      // Continue if sync fails
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
      // Continue if Flask deletion fails
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
    } catch (syncError) {
      // Continue execution - Flask sync failure should not break the API
    }

    return res.json({
      success: true,
      data: userContext,
      syncedToFlask: true
    });
  } catch (error) {
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

// -------------------- ADMIN FUNCTIONS --------------------

const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, role = "admin" } = req.body;

  // Only super_admin can create other admins
  if (!req.user.isSuperAdmin) {
    throw new ApiError("Only super administrators can create admin accounts", 403);
  }

  if (!fullName || !email || !password || !username) {
    throw new ApiError("fullName, email, username, and password are required", 400);
  }

  if (!["admin", "super_admin"].includes(role)) {
    throw new ApiError("Invalid admin role specified", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existedUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: username.trim() }]
  });

  if (existedUser) {
    throw new ApiError("User with this email or username already exists", 409);
  }

  const now = new Date();

  // Create admin with minimal profile (admins don't need full health profiles)
  const adminProfile = {
    age: 30,
    heightCm: 170,
    weightKg: 70,
    gender: "other",
    activityLevel: "moderate",
    goal: "maintenance"
  };

  const admin = await User.create({
    name: fullName,
    email: normalizedEmail,
    username: username.trim(),
    password,
    plainPassword: password,
    roles: [role],
    profile: adminProfile,
    isVerified: true, // Admins are auto-verified
    tokenVersion: 0,
    passwordChangedAt: now,
    passwordExpiresAt: new Date(now.getTime() + PASSWORD_EXPIRY_DAYS * MS_IN_DAY),
  });

  await addActivity(admin, "ADMIN_REGISTER", { createdBy: req.user._id, role });
  await admin.save({ validateBeforeSave: false });

  const safeAdmin = getSafeUser(admin);

  return ApiResponse.success(res, {
    admin: safeAdmin,
    message: `${role} account created successfully`
  }, 201);
});

const getAllUsers = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { 
    page = 1, 
    limit = 20, 
    search = "", 
    role = "", 
    isVerified = "", 
    isDeleted = "false" 
  } = req.query;

  const query = {};

  // Search by name, email, or username
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } }
    ];
  }

  // Filter by role
  if (role) {
    query.roles = { $in: [role] };
  }

  // Filter by verification status
  if (isVerified !== "") {
    query.isVerified = isVerified === "true";
  }

  // Filter by deletion status
  query.isDeleted = isDeleted === "true";

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    select: "-password -refreshToken -passwordResetOtp -passwordResetOtpExpiresAt -activityHistory"
  };

  const users = await User.paginate(query, options);

  return ApiResponse.success(res, {
    users: users.docs,
    pagination: {
      currentPage: users.page,
      totalPages: users.totalPages,
      totalUsers: users.totalDocs,
      hasNextPage: users.hasNextPage,
      hasPrevPage: users.hasPrevPage
    }
  }, 200);
});

const getUserById = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { userId } = req.params;
  const user = await User.findById(userId).select("-password -refreshToken -passwordResetOtp -passwordResetOtpExpiresAt");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return ApiResponse.success(res, user, 200);
});

const updateUserRole = asyncHandler(async (req, res) => {
  // Check if user has super admin role
  if (!req.user.roles?.includes('super_admin')) {
    throw new ApiError("Super admin access required", 403);
  }

  const { userId } = req.params;
  const { roles } = req.body;

  if (!roles || !Array.isArray(roles)) {
    throw new ApiError("Valid roles array is required", 400);
  }

  const validRoles = ["user", "admin", "super_admin"];
  const invalidRoles = roles.filter(role => !validRoles.includes(role));
  
  if (invalidRoles.length > 0) {
    throw new ApiError(`Invalid roles: ${invalidRoles.join(", ")}`, 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Prevent removing super_admin from the last super admin
  if (user.roles.includes("super_admin") && !roles.includes("super_admin")) {
    const superAdminCount = await User.countDocuments({ roles: "super_admin", isDeleted: false });
    if (superAdminCount <= 1) {
      throw new ApiError("Cannot remove the last super administrator", 400);
    }
  }

  user.roles = roles;
  await addActivity(user, "ROLE_UPDATE", { 
    updatedBy: req.user._id, 
    oldRoles: user.roles, 
    newRoles: roles 
  });
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, {
    user: getSafeUser(user),
    message: "User roles updated successfully"
  }, 200);
});

const deleteUser = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { userId } = req.params;
  const { permanent = false } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Prevent deleting super admins unless you're a super admin
  if (user.roles.includes("super_admin") && !req.user.isSuperAdmin) {
    throw new ApiError("Cannot delete super administrator", 403);
  }

  // Prevent deleting the last super admin
  if (user.roles.includes("super_admin")) {
    const superAdminCount = await User.countDocuments({ roles: "super_admin", isDeleted: false });
    if (superAdminCount <= 1) {
      throw new ApiError("Cannot delete the last super administrator", 400);
    }
  }

  if (permanent && req.user.isSuperAdmin) {
    // Permanent deletion (only super admin)
    await User.findByIdAndDelete(userId);
    return ApiResponse.success(res, { message: "User permanently deleted" }, 200);
  } else {
    // Soft deletion
    user.isDeleted = true;
    user.deletedAt = new Date();
    await addActivity(user, "SOFT_DELETE", { deletedBy: req.user._id });
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { message: "User deactivated successfully" }, 200);
  }
});

const updateUserStatus = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { userId } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'inactive'].includes(status)) {
    throw new ApiError("Valid status (active/inactive) is required", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Prevent deactivating super admins unless you're a super admin
  if (user.roles.includes("super_admin") && !req.user.isSuperAdmin && status === 'inactive') {
    throw new ApiError("Cannot deactivate super administrator", 403);
  }

  // Prevent deactivating the last super admin
  if (user.roles.includes("super_admin") && status === 'inactive') {
    const activeSuperAdminCount = await User.countDocuments({ 
      roles: "super_admin", 
      isDeleted: false,
      _id: { $ne: userId }
    });
    if (activeSuperAdminCount === 0) {
      throw new ApiError("Cannot deactivate the last super administrator", 400);
    }
  }

  const isActive = status === 'active';
  user.isDeleted = !isActive;
  if (!isActive) {
    user.deletedAt = new Date();
  } else {
    user.deletedAt = null;
  }

  await addActivity(user, status === 'active' ? "ACTIVATE" : "DEACTIVATE", { 
    updatedBy: req.user._id 
  });
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, {
    user: getSafeUser(user),
    message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`
  }, 200);
});

const restoreUser = asyncHandler(async (req, res) => {
  // Check if user has admin role
  if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('super_admin')) {
    throw new ApiError("Admin access required", 403);
  }

  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.isDeleted) {
    throw new ApiError("User is not deleted", 400);
  }

  user.isDeleted = false;
  user.deletedAt = null;
  await addActivity(user, "RESTORE", { restoredBy: req.user._id });
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, {
    user: getSafeUser(user),
    message: "User restored successfully"
  }, 200);
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
  // Admin functions
  registerAdmin,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  restoreUser
};