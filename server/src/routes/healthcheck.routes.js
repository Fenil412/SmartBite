import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();

/**
 * @route   GET /healthcheck
 * @desc    Server health check
 * @access  Public
 */
router.get("/healthcheck", healthCheck);

export default router;
