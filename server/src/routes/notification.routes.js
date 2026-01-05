import { Router } from "express";
import { 
    getMyNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAsUnread, 
    markAllAsRead,
    getLatestNotifications,
    testSMSNotification,
    getSMSStatus
} from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/latest", authMiddleware, getLatestNotifications);
router.patch("/:notificationId/read", authMiddleware, markAsRead);
router.patch("/:notificationId/unread", authMiddleware, markAsUnread);
router.patch("/mark-all-read", authMiddleware, markAllAsRead);

// Test SMS endpoint for debugging
router.post("/test-sms", authMiddleware, testSMSNotification);

// SMS system status (admin-like endpoint)
router.get("/sms-status", authMiddleware, getSMSStatus);

export default router;
