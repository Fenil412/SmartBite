import {
    buildGroceryList,
    estimateWeeklyCost,
    getMissingItems,
    getGrocerySummary,
    markPurchasedItems,
    getStoreSuggestions,
    getBudgetAlternatives
} from "../services/grocery.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getGroceryList = asyncHandler(async (req, res) => {
    const list = await buildGroceryList(req.params.id, req.user._id);
    return ApiResponse.success(res, { list }, 200);
});

export const getCostEstimate = asyncHandler(async (req, res) => {
    const data = await estimateWeeklyCost(req.params.id, req.user._id);
    return ApiResponse.success(res, data, 200);
});

export const getMissingGroceryItems = asyncHandler(async (req, res) => {
    const { pantryItems = [] } = req.body;
    const missing = await getMissingItems(
        req.params.id,
        req.user._id,
        pantryItems
    );
    return ApiResponse.success(res, { missing }, 200);
});

export const getGrocerySummaryCtrl = asyncHandler(async (req, res) => {
    const summary = await getGrocerySummary(req.params.id, req.user._id);
    return ApiResponse.success(res, summary, 200);
});

export const markPurchased = asyncHandler(async (req, res) => {
    const { items = [] } = req.body;
    const result = await markPurchasedItems(
        req.params.id,
        req.user._id,
        items
    );
    return ApiResponse.success(res, result, 200);
});

export const getStoreSuggestionsCtrl = asyncHandler(async (req, res) => {
    const stores = await getStoreSuggestions();
    return ApiResponse.success(res, { stores }, 200);
});

export const getBudgetAlternativesCtrl = asyncHandler(async (req, res) => {
    const alternatives = await getBudgetAlternatives(
        req.params.id,
        req.user._id
    );
    return ApiResponse.success(res, { alternatives }, 200);
});
