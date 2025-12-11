import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new ApiError("Authorization token required", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        // Use ACCESS_TOKEN_SECRET to match the controller's signing key
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = {
            _id: decoded._id, // Map _id for Mongoose compatibility
            id: decoded._id,  // Keep id for generic compatibility
            email: decoded.email || "", // Handle cases where email might not be in payload
            role: decoded.role
        };

        next();
    } catch (error) {
        throw new ApiError("Invalid or expired token", 401);
    }
});

export default authMiddleware;