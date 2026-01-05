import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { testSMS } from "../utils/sms.js";
import { notifyLogin } from "../services/notification.service.js";

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

/* ===========================
   GET SMS SYSTEM STATUS
=========================== */
export const getSMSStatus = asyncHandler(async (req, res) => {
    // Check Twilio configuration
    const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
    
    // Get users with phone numbers
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
    const usersWithPhone = await User.countDocuments({ 
        phone: { $exists: true, $ne: null, $ne: "" },
        isDeleted: { $ne: true }
    });
    
    // Get recent SMS notifications
    const recentSMSNotifications = await Notification.find({
        'channels.sms.status': { $exists: true }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('event channels.sms createdAt user')
    .populate('user', 'email phone');
    
    // Calculate SMS success rate
    const totalSMSAttempts = await Notification.countDocuments({
        'channels.sms.status': { $exists: true }
    });
    
    const successfulSMS = await Notification.countDocuments({
        'channels.sms.status': 'success'
    });
    
    const smsSuccessRate = totalSMSAttempts > 0 ? ((successfulSMS / totalSMSAttempts) * 100).toFixed(2) : 0;
    
    return ApiResponse.success(res, {
        configuration: {
            twilioConfigured,
            accountSid: process.env.TWILIO_ACCOUNT_SID ? `${process.env.TWILIO_ACCOUNT_SID.substring(0, 8)}...` : null,
            phoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
            authTokenSet: !!process.env.TWILIO_AUTH_TOKEN
        },
        statistics: {
            totalUsers,
            usersWithPhone,
            phoneNumberCoverage: totalUsers > 0 ? ((usersWithPhone / totalUsers) * 100).toFixed(2) : 0,
            totalSMSAttempts,
            successfulSMS,
            failedSMS: totalSMSAttempts - successfulSMS,
            smsSuccessRate: parseFloat(smsSuccessRate)
        },
        recentActivity: recentSMSNotifications,
        troubleshooting: {
            commonIssues: [
                {
                    code: "21608",
                    issue: "Phone number not verified",
                    solution: "For trial accounts, verify phone numbers at twilio.com/console/phone-numbers/verified"
                },
                {
                    code: "21211", 
                    issue: "Invalid phone number format",
                    solution: "Use international format like +1234567890"
                },
                {
                    code: "20003",
                    issue: "Authentication error", 
                    solution: "Check Twilio Account SID and Auth Token"
                }
            ],
            setupGuide: "See SMS_SETUP_GUIDE.md for detailed setup instructions"
        }
    }, 200);
});
export const testSMSNotification = asyncHandler(async (req, res) => {
    const user = req.user;
    
    if (!user.phone) {
        throw new ApiError(400, "No phone number found in your profile. Please add a phone number to test SMS notifications.");
    }

    try {
        // Test direct SMS
        const smsResult = await testSMS(user.phone);
        
        // Also test the notification system
        const notificationResult = await notifyLogin(user);
        
        return ApiResponse.success(res, {
            message: "SMS test completed successfully!",
            smsResult,
            notificationResult,
            userPhone: user.phone,
            twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
        }, 200);
        
    } catch (error) {
        console.error("❌ SMS test failed:", error);
        
        return ApiResponse.success(res, {
            message: "SMS test failed",
            error: error.message,
            userPhone: user.phone,
            twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
            troubleshooting: {
                checkPhone: "Ensure your phone number is in international format (+1234567890)",
                checkTwilio: "Verify Twilio credentials are properly configured",
                checkBalance: "Check if your Twilio account has sufficient balance",
                checkNumber: "Ensure the Twilio phone number is verified and active"
            }
        }, 200);
    }
});
