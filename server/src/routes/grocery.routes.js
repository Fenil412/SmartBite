import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    getGroceryList,
    getCostEstimate,
    getMissingGroceryItems,
    getGrocerySummaryCtrl,
    markPurchased,
    getStoreSuggestionsCtrl,
    getBudgetAlternativesCtrl
} from "../controllers/grocery.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/meal-plans/:id/grocery-list", getGroceryList);
router.get("/meal-plans/:id/cost-estimate", getCostEstimate);
router.post("/meal-plans/:id/missing-items", getMissingGroceryItems);
router.get("/meal-plans/:id/grocery-summary", getGrocerySummaryCtrl);
router.post("/meal-plans/:id/mark-purchased", markPurchased);
router.get("/meal-plans/:id/store-suggestions", getStoreSuggestionsCtrl);
router.get("/meal-plans/:id/budget-alternatives", getBudgetAlternativesCtrl);

export default router;
