import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ===========================
   GET MY NOTIFICATIONS
=========================== */
export const getMyNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, unreadOnly = false } = req.query;
    
    const filter = { user: req.user._id };
    if (unreadOnly === 'true') {
        filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
        user: req.user._id, 
        isRead: false 
    });

    return ApiResponse.success(res, { 
        notifications, 
        totalCount,
        unreadCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit))
    }, 200);
});

/* ===========================
   GET UNREAD COUNT
=========================== */
export const getUnreadCount = asyncHandler(async (req, res) => {
    const unreadCount = await Notification.countDocuments({ 
        user: req.user._id, 
        isRead: false 
    });

    return ApiResponse.success(res, { unreadCount }, 200);
});

/* ===========================
   MARK NOTIFICATION AS READ
=========================== */
export const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user._id },
        { 
            isRead: true, 
            readAt: new Date() 
        },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return ApiResponse.success(res, { notification }, 200);
});

/* ===========================
   MARK NOTIFICATION AS UNREAD
=========================== */
export const markAsUnread = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user._id },
        { 
            isRead: false, 
            $unset: { readAt: 1 }
        },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return ApiResponse.success(res, { notification }, 200);
});

/* ===========================
   MARK ALL AS READ
=========================== */
export const markAllAsRead = asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { 
            isRead: true, 
            readAt: new Date() 
        }
    );

    return ApiResponse.success(res, { 
        message: `${result.modifiedCount} notifications marked as read` 
    }, 200);
});

/* ===========================
   GET LATEST NOTIFICATIONS (for real-time updates)
=========================== */
export const getLatestNotifications = asyncHandler(async (req, res) => {
    const { since } = req.query;
    
    const filter = { user: req.user._id };
    if (since) {
        filter.createdAt = { $gt: new Date(since) };
    }

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(10);

    return ApiResponse.success(res, { notifications }, 200);
});
