import { Router } from "express";
import { 
    getMyNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAsUnread, 
    markAllAsRead,
    getLatestNotifications
} from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/latest", authMiddleware, getLatestNotifications);
router.patch("/:notificationId/read", authMiddleware, markAsRead);
router.patch("/:notificationId/unread", authMiddleware, markAsUnread);
router.patch("/mark-all-read", authMiddleware, markAllAsRead);

export default router;
