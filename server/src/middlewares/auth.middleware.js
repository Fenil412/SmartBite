import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new ApiError("Authorization token required", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        // Use ACCESS_TOKEN_SECRET to match the controller's signing key
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch full user data for admin operations
        const user = await User.findById(decoded._id).select("-password -refreshToken -passwordResetOtp -passwordResetOtpExpiresAt");
        
        if (!user) {
            throw new ApiError("User not found", 401);
        }

        // Check if user is deleted
        if (user.isDeleted) {
            throw new ApiError("Account has been deactivated", 401);
        }

        req.user = {
            _id: user._id,
            id: user._id,
            email: user.email,
            roles: user.roles,
            isAdmin: user.isAdmin(),
            isSuperAdmin: user.isSuperAdmin(),
            fullUser: user // Include full user object for admin operations
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError("Invalid token", 401);
        } else if (error.name === 'TokenExpiredError') {
            throw new ApiError("Token expired", 401);
        }
        throw new ApiError("Invalid or expired token", 401);
    }
});

export default authMiddleware;