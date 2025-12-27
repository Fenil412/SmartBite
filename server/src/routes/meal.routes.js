import { Router } from "express";
import {
    createMeal,
    getMeals,
    getMealById,
    updateMeal,
    toggleLikeMeal,
    deleteMeal
} from "../controllers/meal.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/")
    .get(getMeals)
    .post(authMiddleware, upload.single("image"), createMeal);

router.route("/:mealId")
    .get(getMealById)
    .put(authMiddleware, upload.single("image"), updateMeal)
    .delete(authMiddleware, deleteMeal);

router.route("/:mealId/like")
    .post(authMiddleware, toggleLikeMeal);

export default router;
