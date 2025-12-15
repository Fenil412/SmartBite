import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    generateMealPlan,
    getMealPlanHistory
} from "../controllers/recommendation.controller.js";

const router = Router();

router.post("/generate", authMiddleware, generateMealPlan);
router.get("/history", authMiddleware, getMealPlanHistory);

export default router;
