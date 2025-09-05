import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { deleteFromCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"

// Get all users with pagination and filtering
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query
  const filter = {}

  if (role) filter.role = role
  if (status) filter.status = status

  // Add search functionality
  if (search && search.trim().length >= 3) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
    ]
  }

  const options = {
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    sort: { createdAt: -1 },
    select: "-password -refreshToken",
  }

  const users = await User.paginate(filter, options)

  return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"))
})

// Get detailed user information
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID")
  }

  const user = await User.findById(id)
    .select("-password -refreshToken")
    .populate({
      path: "blogs",
      select: "title slug views likesCount createdAt",
      options: { limit: 5, sort: { createdAt: -1 } },
    })

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const userData = {
    ...user.toObject()
  }

  return res.status(200).json(new ApiResponse(200, userData, "User details fetched"))
})

// Update user details (admin) - Fixed to handle fullName properly
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { fullName, role, status, isVerified } = req.body

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID")
  }

  const updateData = {}
  if (fullName !== undefined) updateData.fullName = fullName
  if (role) updateData.role = role
  if (status) updateData.status = status
  if (isVerified !== undefined) updateData.isVerified = isVerified

  // Add updatedAt timestamp
  updateData.updatedAt = new Date()

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields to update")
  }

  const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).select(
    "-password -refreshToken",
  )

  if (!updatedUser) {
    throw new ApiError(404, "User not found")
  }

  return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"))
})

// Toggle user active status
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID")
  }

  const user = await User.findById(id)
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  user.status = user.status === "active" ? "suspended" : "active"
  user.updatedAt = new Date()
  await user.save()

  return res.status(200).json(new ApiResponse(200, user, "User status updated"))
})

// Delete user (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID")
  }

  const user = await User.findByIdAndDelete(id)
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  // Delete user assets from Cloudinary
  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id)
  }
  if (user.coverImage?.public_id) {
    await deleteFromCloudinary(user.coverImage.public_id)
  }

  return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"))
})

// Enhanced platform statistics
const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalUsers, adminUsers, activeUsers, suspendedUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "suspended" })
  ])

  const newUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })

  const stats = {
    users: {
      total: totalUsers,
      admins: adminUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      new: newUsers,
    }
  }

  return res.status(200).json(new ApiResponse(200, stats, "Platform stats fetched"))
})

// Search users - Enhanced to work with getAllUsers
const searchUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query

  if (!search || search.trim().length < 3) {
    throw new ApiError(400, "Search query must be at least 3 characters")
  }

  const options = {
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    select: "-password -refreshToken",
    sort: { createdAt: -1 },
  }

  const users = await User.paginate(
    {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ],
    },
    options,
  )

  return res.status(200).json(new ApiResponse(200, users, "Users search results"))
})

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPlatformStats,
  searchUsers,
  toggleUserStatus,
}
