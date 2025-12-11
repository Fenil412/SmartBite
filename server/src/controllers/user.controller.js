// src/controllers/user.controller.js

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"; // Importing the object { success, fail }
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Dynamic import for mailer
const getMailSender = async () => {
  try {
    const mailerModule = await import("../utils/mailer.js");
    return mailerModule.sendMail;
  } catch (err) {
    console.warn("Error importing mailer util:", err.message);
    return async () => { };
  }
};

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

  // Send Email (Corrected: passing object)
  try {
    const sendMail = await getMailSender();
    await sendMail({
      to: user.email,
      subject: "Welcome to SmartBite",
      text: `Hi ${user.name},\n\nYour SmartBite account has been created successfully.\n\nRegards,\nSmartBite`
    });
  } catch (err) {
    console.error("Error sending signup email:", err);
  }

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

  try {
    const sendMail = await getMailSender();
    await sendMail({
      to: user.email,
      subject: "New SmartBite login",
      text: `Hi ${user.name},\n\nYou just logged in to your SmartBite account.\nIf this wasn't you, please reset your password immediately.\n\nRegards,\nSmartBite`
    });
  } catch (err) {
    console.error("Error sending login email:", err);
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

  try {
    const sendMail = await getMailSender();
    await sendMail({
      to: user.email,
      subject: "SmartBite Password Reset OTP",
      text: `Hi ${user.name},\n\nYour OTP for password reset is: ${otp}\nThis OTP is valid for 10 minutes.\n\nRegards,\nSmartBite`
    });
  } catch (err) {
    console.error("Error sending password OTP email:", err);
  }

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

  try {
    const sendMail = await getMailSender();
    await sendMail({
      to: user.email,
      subject: "SmartBite password changed",
      text: `Hi ${user.name},\n\nYour SmartBite password was changed successfully.\nRegards,\nSmartBite`
    });
  } catch (err) {
    console.error("Error sending password changed email:", err);
  }

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

  const sendMail = await getMailSender();
  let count = 0;

  for (const user of users) {
    try {
      await sendMail({
        to: user.email,
        subject: "SmartBite password expiry reminder",
        text: `Hi ${user.name},\n\nYour SmartBite password will expire on ${user.passwordExpiresAt}.\nPlease update it soon.\n\nRegards,\nSmartBite`
      });

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
};