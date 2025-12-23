import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    getUserMLContext,
    getMealCatalogML
} from "../controllers/mlContract.controller.js";

const router = Router();

/**
 * Internal ML APIs (Node → Flask)
 */
router.get("/ml/user-context", authMiddleware, getUserMLContext);
router.get("/ml/meals", authMiddleware, getMealCatalogML);

export default router;
