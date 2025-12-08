// src/controllers/user.controller.js

import jwt from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Cloudinary util (uses your provided file)
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// -------------------- CONSTANTS --------------------

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const PASSWORD_EXPIRY_DAYS = 30;
const PASSWORD_REMINDER_DAYS_BEFORE = 5;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

// -------------------- HELPERS --------------------

// Dynamic import for mailer to avoid "does not provide an export named 'sendMail'"
const getMailSender = async () => {
  const mailerModule = await import("../utils/mailer.js").catch((err) => {
    console.error("Error importing mailer util:", err);
    return {};
  });

  const fn =
    mailerModule.sendMail ||
    mailerModule.mailSender ||
    mailerModule.default;

  if (typeof fn !== "function") {
    console.warn(
      "Mailer util not configured correctly (no sendMail/mailSender/default export function). " +
        "Emails will be skipped."
    );
    // No-op function to avoid breaking flow
    return async () => {};
  }

  return fn;
};

const generateTokens = (user) => {
  const payload = {
    _id: user._id,
    role: user.role,
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

  user.activityHistory.push({
    action,
    metadata,
    createdAt: new Date(),
  });

  // Keep last N entries to avoid huge docs
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
  return obj;
};

// -------------------- CONTROLLERS --------------------

/**
 * Signup / Register
 * - Create user
 * - Set password expiry 30 days
 * - Send welcome email
 * - Generate access + refresh tokens
 */
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, ...rest } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "fullName, email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existedUser = await User.findOne({ email: normalizedEmail });
  if (existedUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const now = new Date();

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password, // assume hashing in User model pre-save hook
    tokenVersion: 0,
    passwordChangedAt: now,
    passwordExpiresAt: new Date(now.getTime() + PASSWORD_EXPIRY_DAYS * MS_IN_DAY),
    ...rest,
  });

  await addActivity(user, "REGISTER", {});
  await user.save({ validateBeforeSave: false });

  // Send welcome email (non-blocking for main flow)
  try {
    const sendMail = await getMailSender();
    await sendMail(
      user.email,
      "Welcome to SmartBite",
      `Hi ${user.fullName || ""},\n\nYour SmartBite account has been created successfully.\n\nRegards,\nSmartBite`
    );
  } catch (err) {
    console.error("Error sending signup email:", err);
  }

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const safeUser = getSafeUser(user);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: safeUser,
        tokens: { accessToken, refreshToken },
      },
      "User registered successfully"
    )
  );
});

/**
 * Login
 * - Validate credentials
 * - Check password expiry
 * - Generate access + refresh tokens
 * - Send login email
 * - Add activity
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +tokenVersion +refreshToken +passwordExpiresAt"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (typeof user.isPasswordCorrect !== "function") {
    throw new ApiError(
      500,
      "User model is missing isPasswordCorrect method for password comparison"
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const now = new Date();
  if (user.passwordExpiresAt && user.passwordExpiresAt < now) {
    throw new ApiError(403, "Password expired. Please reset your password via OTP.");
  }

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;

  await addActivity(user, "LOGIN", { ip: req.ip });
  await user.save({ validateBeforeSave: false });

  // Send login mail (non-blocking)
  try {
    const sendMail = await getMailSender();
    await sendMail(
      user.email,
      "New SmartBite login",
      `Hi ${user.fullName || ""},\n\nYou just logged in to your SmartBite account.\nIf this wasn't you, please reset your password immediately.\n\nRegards,\nSmartBite`
    );
  } catch (err) {
    console.error("Error sending login email:", err);
  }

  const safeUser = getSafeUser(user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: safeUser,
        tokens: { accessToken, refreshToken },
      },
      "Login successful"
    )
  );
});

/**
 * Logout
 * - Invalidate refresh token via tokenVersion bump
 * - Clear stored refreshToken
 * - Add activity
 */
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.refreshToken = null;

  await addActivity(user, "LOGOUT", { ip: req.ip });
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logout successful"));
});

/**
 * Refresh Access Token
 * - Use refresh token to get new access + refresh
 * - Check tokenVersion for invalidation
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken =
    req.body?.refreshToken ||
    req.cookies?.refreshToken ||
    req.headers["x-refresh-token"];

  if (!incomingToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select(
    "+tokenVersion +refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.tokenVersion !== decoded.tokenVersion) {
    throw new ApiError(401, "Refresh token has been invalidated");
  }

  if (!user.refreshToken || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken;

  await addActivity(user, "REFRESH_TOKEN", {});
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken, refreshToken },
      "Access token refreshed successfully"
    )
  );
});

/**
 * Request OTP for password reset
 * - Generates OTP
 * - Stores OTP + expiry on user
 * - Sends email
 * - Adds activity
 */
const requestPasswordOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6-digit
  const now = new Date();

  user.passwordResetOtp = otp;
  user.passwordResetOtpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 min
  await addActivity(user, "REQUEST_PASSWORD_OTP", {});
  await user.save({ validateBeforeSave: false });

  try {
    const sendMail = await getMailSender();
    await sendMail(
      user.email,
      "SmartBite Password Reset OTP",
      `Hi ${user.fullName || ""},\n\nYour OTP for password reset is: ${otp}\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this mail.\n\nRegards,\nSmartBite`
    );
  } catch (err) {
    console.error("Error sending password OTP email:", err);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent to registered email"));
});

/**
 * Reset password using OTP
 * - Validates OTP + expiry
 * - Updates password
 * - Sets new password expiry (30 days)
 * - Invalidates all tokens (tokenVersion++)
 * - Sends confirmation email
 * - Adds activity
 */
const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "email, otp, and newPassword are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordResetOtp +passwordResetOtpExpiresAt +tokenVersion"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (
    !user.passwordResetOtp ||
    !user.passwordResetOtpExpiresAt ||
    user.passwordResetOtp !== otp
  ) {
    throw new ApiError(400, "Invalid OTP");
  }

  const now = new Date();
  if (user.passwordResetOtpExpiresAt < now) {
    throw new ApiError(400, "OTP has expired");
  }

  // Update password, expiry, and invalidate tokens
  user.password = newPassword; // assume hashing in pre-save
  user.passwordChangedAt = now;
  user.passwordExpiresAt = new Date(now.getTime() + PASSWORD_EXPIRY_DAYS * MS_IN_DAY);
  user.passwordResetOtp = null;
  user.passwordResetOtpExpiresAt = null;

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.refreshToken = null;

  await addActivity(user, "RESET_PASSWORD_OTP", {});
  await user.save();

  // Email confirmation
  try {
    const sendMail = await getMailSender();
    await sendMail(
      user.email,
      "SmartBite password changed",
      `Hi ${user.fullName || ""},\n\nYour SmartBite password was changed successfully.\nIf you did not perform this action, please contact support immediately.\n\nRegards,\nSmartBite`
    );
  } catch (err) {
    console.error("Error sending password changed email:", err);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully"));
});

/**
 * Send password expiry reminders (for CRON / admin route)
 * - Finds users with password expiring in [now, now+5 days]
 * - Sends reminder mail
 * - Marks that reminder was sent
 */
const sendPasswordExpiryReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  const reminderUpperBound = new Date(
    now.getTime() + PASSWORD_REMINDER_DAYS_BEFORE * MS_IN_DAY
  );

  const users = await User.find({
    passwordExpiresAt: { $gte: now, $lte: reminderUpperBound },
    passwordExpiryReminderSent: { $ne: true },
  });

  const sendMail = await getMailSender();

  for (const user of users) {
    try {
      await sendMail(
        user.email,
        "SmartBite password expiry reminder",
        `Hi ${user.fullName || ""},\n\nYour SmartBite password will expire on ${
          user.passwordExpiresAt?.toDateString?.() || user.passwordExpiresAt
        }.\nPlease update your password to continue secure access.\n\nRegards,\nSmartBite`
      );

      user.passwordExpiryReminderSent = true;
      await addActivity(user, "PASSWORD_EXPIRY_REMINDER_SENT", {});
      await user.save({ validateBeforeSave: false });
    } catch (err) {
      console.error(
        `Error sending password expiry reminder to ${user.email}:`,
        err
      );
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { count: users.length },
      "Password expiry reminder job executed"
    )
  );
});

/**
 * Get current user's profile
 */
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const safeUser = getSafeUser(user);

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "User profile fetched"));
});

/**
 * Update avatar using Cloudinary
 * - Uses multer middleware for file upload (req.file)
 */
const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!req.file || !req.file.path) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);

  if (!uploadResult || !uploadResult.secure_url) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  user.avatar = {
    publicId: uploadResult.public_id,
    url: uploadResult.secure_url,
  };

  await addActivity(user, "UPDATE_AVATAR", {
    avatarUrl: user.avatar.url,
  });

  await user.save({ validateBeforeSave: false });

  const safeUser = getSafeUser(user);

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "Avatar updated successfully"));
});

/**
 * Delete profile (soft delete recommended)
 * - Mark as deleted
 * - Invalidate tokens
 * - Send mail
 * - Add activity
 */
const deleteMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.refreshToken = null;

  await addActivity(user, "DELETE_PROFILE", {});
  await user.save({ validateBeforeSave: false });

  try {
    const sendMail = await getMailSender();
    await sendMail(
      user.email,
      "SmartBite account deleted",
      `Hi ${user.fullName || ""},\n\nYour SmartBite account has been deleted.\nIf this wasn't you, please contact support immediately.\n\nRegards,\nSmartBite`
    );
  } catch (err) {
    console.error("Error sending account deletion email:", err);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Profile deleted successfully"));
});

/**
 * Get activity history of current user
 */
const getMyActivityHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId, { activityHistory: 1 });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { activityHistory: user.activityHistory || [] },
      "Activity history fetched"
    )
  );
});

// -------------------- EXPORTS --------------------

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
