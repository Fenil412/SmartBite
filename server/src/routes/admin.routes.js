import { Router } from "express";
import {
  registerAdmin,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  restoreUser
} from "../controllers/user.controller.js";
import {
  getDashboardStats,
  getSystemInfo,
  getAllMeals,
  updateMealStatus,
  deleteMeal,
  getAllFeedback,
  getRecentActivity,
  getAdminCodes,
  regenerateAdminCodes
} from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { adminOnly, superAdminOnly } from "../middlewares/role.middleware.js";

const router = Router();

// Dashboard and Analytics
router.get("/dashboard/stats", authMiddleware, adminOnly, getDashboardStats);
router.get("/system/info", authMiddleware, superAdminOnly, getSystemInfo);
router.get("/activity/recent", authMiddleware, adminOnly, getRecentActivity);

// User Management
router.post("/users/register-admin", authMiddleware, superAdminOnly, registerAdmin);
router.get("/users", authMiddleware, adminOnly, getAllUsers);
router.get("/users/:userId", authMiddleware, adminOnly, getUserById);
router.put("/users/:userId/role", authMiddleware, superAdminOnly, updateUserRole);
router.put("/users/:userId/status", authMiddleware, adminOnly, updateUserStatus);
router.delete("/users/:userId", authMiddleware, adminOnly, deleteUser);
router.put("/users/:userId/restore", authMiddleware, adminOnly, restoreUser);

// Content Management
router.get("/meals", authMiddleware, adminOnly, getAllMeals);
router.put("/meals/:mealId/status", authMiddleware, adminOnly, updateMealStatus);
router.delete("/meals/:mealId", authMiddleware, adminOnly, deleteMeal);
router.get("/feedback", authMiddleware, adminOnly, getAllFeedback);

// Admin Code Management (Super Admin Only)
router.get("/codes", authMiddleware, superAdminOnly, getAdminCodes);
router.post("/codes/regenerate", authMiddleware, superAdminOnly, regenerateAdminCodes);

export default router;