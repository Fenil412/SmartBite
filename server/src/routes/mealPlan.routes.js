import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    createMealPlan,
    getMyMealPlans,
    getMealPlanById,
    deleteMealPlan,
    updateMealPlan,
    adhereMeal,
    skipMeal,
    replaceMeal
} from "../controllers/mealPlan.controller.js";

const router = Router();

router.use(authMiddleware);

router.route("/")
    .post(createMealPlan)
    .get(getMyMealPlans);

router.post("/:planId/adhere", adhereMeal);
router.post("/:planId/skip", skipMeal);
router.post("/:planId/replace", replaceMeal);


router.route("/:planId")
    .get(getMealPlanById)
    .put(updateMealPlan)
    .delete(deleteMealPlan);

export default router;
