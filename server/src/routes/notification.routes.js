import { Router } from "express";
import { getMyNotifications } from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getMyNotifications);

export default router;
