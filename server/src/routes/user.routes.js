import { Router } from "express";

/* ========== Controllers (MUST MATCH EXPORTS EXACTLY) ========== */
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,

    requestPasswordOtp,
    resetPasswordWithOtp,

    getMe,
    updateAvatar,
    deleteMyProfile,
    getMyActivityHistory,
} from "../controllers/user.controller.js";

/* ========== Middlewares ========== */
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

/* ================= AUTH ================= */

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/refresh-token", refreshAccessToken);

/* ================= PASSWORD (OTP FLOW) ================= */

router.post("/password/request-otp", requestPasswordOtp);
router.post("/password/reset", resetPasswordWithOtp);

/* ================= USER PROFILE ================= */

router.get("/me", authMiddleware, getMe);

router.put(
    "/avatar",
    authMiddleware,
    upload.single("avatar"),
    updateAvatar
);

router.delete("/me", authMiddleware, deleteMyProfile);

/* ================= USER ACTIVITY ================= */

router.get("/activity", authMiddleware, getMyActivityHistory);

export default router;
