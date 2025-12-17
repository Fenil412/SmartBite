import { MealPlan } from "../models/mealPlan.model.js";
import { ApiError } from "../utils/ApiError.js";

/* ===========================
   HELPERS
=========================== */

const normalizeIngredientName = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value.toLowerCase().trim();
    if (typeof value === "object" && value.name) {
        return value.name.toLowerCase().trim();
    }
    return null;
};

/* ===========================
   AGGREGATE INGREDIENTS
=========================== */
export const buildGroceryList = async (mealPlanId, userId) => {
    const plan = await MealPlan.findOne({
        _id: mealPlanId,
        user: userId
    }).populate("days.meals.meal");

    if (!plan) throw new ApiError(404, "Meal plan not found");

    const map = new Map();

    plan.days.forEach(day => {
        day.meals.forEach(({ meal }) => {
            meal.ingredients?.forEach(ing => {
                const key = `${ing.name}-${ing.unit}`;

                if (!map.has(key)) {
                    map.set(key, {
                        name: ing.name,
                        unit: ing.unit,
                        quantity: 0,
                        estimatedCost: 0,
                        category: ing.category || "other"
                    });
                }

                const item = map.get(key);
                item.quantity += ing.quantity || 0;
                item.estimatedCost += (ing.cost || 0) * (ing.quantity || 0);
            });
        });
    });

    return Array.from(map.values());
};

/* ===========================
   COST ESTIMATION
=========================== */
export const estimateWeeklyCost = async (mealPlanId, userId) => {
    const list = await buildGroceryList(mealPlanId, userId);

    const totalCost = list.reduce(
        (sum, item) => sum + item.estimatedCost,
        0
    );

    return {
        items: list,
        totalCost: Number(totalCost.toFixed(2))
    };
};

/* ===========================
   MISSING ITEMS
=========================== */
export const getMissingItems = async (mealPlanId, userId, pantryItems = []) => {
    const groceryList = await buildGroceryList(mealPlanId, userId);

    const pantrySet = new Set(
        pantryItems
            .map(normalizeIngredientName)
            .filter(Boolean)
    );

    return groceryList.filter(
        item => !pantrySet.has(normalizeIngredientName(item.name))
    );
};

/* ===========================
   GROCERY SUMMARY
=========================== */
export const getGrocerySummary = async (mealPlanId, userId) => {
    const list = await buildGroceryList(mealPlanId, userId);

    const summary = {
        totalItems: list.length,
        totalCost: 0,
        categories: {}
    };

    list.forEach(item => {
        summary.totalCost += item.estimatedCost;
        summary.categories[item.category] =
            (summary.categories[item.category] || 0) + 1;
    });

    summary.totalCost = Number(summary.totalCost.toFixed(2));
    return summary;
};

/* ===========================
   MARK PURCHASED
=========================== */
export const markPurchasedItems = async (mealPlanId, userId, items = []) => {
    // Non-persistent on purpose (frontend state / future DB)
    return {
        purchased: items,
        progress: `${items.length} items marked as purchased`
    };
};

/* ===========================
   STORE SUGGESTIONS
=========================== */
export const getStoreSuggestions = async () => {
    return [
        { name: "Local Vegetable Market", type: "fresh" },
        { name: "Reliance Smart", type: "supermarket" },
        { name: "Online Grocery App", type: "online" }
    ];
};

/* ===========================
   BUDGET ALTERNATIVES
=========================== */
export const getBudgetAlternatives = async (mealPlanId, userId) => {
    const list = await buildGroceryList(mealPlanId, userId);

    return list.map(item => ({
        ingredient: item.name,
        cheaperAlternative: `Seasonal ${item.name}`,
        estimatedSavings: Number((item.estimatedCost * 0.25).toFixed(2))
    }));
};
