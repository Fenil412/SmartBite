import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    verifyOtp,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    deleteUser,
    updateUserAvatar,
    updateUserCoverImage,
    getReadHistory,
    updateAccountDetails,
    updateUserProfileHealthDetails // Import the new controller function
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router()

// Public routes
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/verify-otp").post(verifyOtp)
router.route("/refresh-token").post(refreshAccessToken)

// Secured routes (require authentication)
router.use(verifyJWT)

router.route("/logout").post(logoutUser)
router.route("/change-password").post(changeCurrentPassword)
router.route("/current-user").get(getCurrentUser)
router.route("/update-account").patch(updateAccountDetails)
router.route("/read-history").get(getReadHistory)

// New route for updating health profile
router.route("/health-profile").patch(updateUserProfileHealthDetails);

// Avatar and cover image routes
router.route("/avatar").patch(upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(upload.single("coverImage"), updateUserCoverImage)

// Admin routes
router.route("/delete/:id").delete(isAdmin, deleteUser)

export default router