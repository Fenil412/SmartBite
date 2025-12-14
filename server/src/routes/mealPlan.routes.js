import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    createMealPlan,
    getMyMealPlans,
    getMealPlanById,
    deleteMealPlan,
    updateMealPlan
} from "../controllers/mealPlan.controller.js";

const router = Router();

router.use(authMiddleware);

router.route("/")
    .post(createMealPlan)
    .get(getMyMealPlans);

router.route("/:planId")
    .get(getMealPlanById)
    .put(updateMealPlan)
    .delete(deleteMealPlan);

export default router;
