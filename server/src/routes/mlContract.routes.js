import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    getUserMLContext,
    getMealCatalogML,
    getMealCatalogStatsML
} from "../controllers/mlContract.controller.js";

const router = Router();

/**
 * Internal ML APIs (Node → Flask)
 * These endpoints are for internal use only - not exposed to frontend
 */
router.get("/ml/user-context", authMiddleware, getUserMLContext);
router.get("/ml/meals", authMiddleware, getMealCatalogML);
router.get("/ml/meals/stats", authMiddleware, getMealCatalogStatsML);

export default router;
