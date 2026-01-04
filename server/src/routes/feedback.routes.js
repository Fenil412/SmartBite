import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    submitFeedback,
    getMyFeedback
} from "../controllers/feedback.controller.js";

const router = Router();

/* ===========================
   ROUTES
=========================== */

router
    .route("/")
    .post(authMiddleware, submitFeedback)
    .get(authMiddleware, getMyFeedback);

export default router;
