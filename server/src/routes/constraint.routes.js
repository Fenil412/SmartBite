import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    upsertConstraints,
    getMyConstraints,
    deleteConstraints
} from "../controllers/constraint.controller.js";

const router = Router();

router.use(authMiddleware);

router.route("/")
    .post(upsertConstraints)
    .get(getMyConstraints)
    .delete(deleteConstraints);

export default router;
