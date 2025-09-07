import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getPlatformStats,
    // searchUsers, // Removed as getAllUsers now handles search
    toggleUserStatus,
    getUserReadHistory // Import the new function
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Admin-only routes
router.use(verifyJWT, isAdmin);

// User management
// Consolidated getAllUsers and searchUsers into a single route
router.route('/users')
    .get(getAllUsers); // Handles pagination, filtering, and search via query parameters

router.route('/users/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

router.route('/users/:id/status')
    .patch(toggleUserStatus);

// New route for fetching a user's full read history
router.route('/users/:id/read-history')
    .get(getUserReadHistory);

// Platform analytics
router.route('/stats')
    .get(getPlatformStats);

export default router;