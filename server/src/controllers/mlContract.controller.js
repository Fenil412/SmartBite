import {asyncHandler} from "../utils/asyncHandler.js";
import { buildUserMLContext, fetchMealCatalogForML, getMealCatalogStats } from "../services/mlContract.service.js";

export const getUserMLContext = asyncHandler(async (req, res) => {
    const data = await buildUserMLContext(req.user._id);

    res.status(200).json({
        success: true,
        data
    });
});

export const getMealCatalogML = asyncHandler(async (req, res) => {
    const meals = await fetchMealCatalogForML();

    res.status(200).json({
        success: true,
        count: meals.length,
        data: meals
    });
});

export const getMealCatalogStatsML = asyncHandler(async (req, res) => {
    const stats = await getMealCatalogStats();

    res.status(200).json({
        success: true,
        data: stats
    });
});
