import { ApiError } from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        // Check if user has any of the allowed roles
        const userRoles = req.user.roles || [];
        const hasPermission = allowedRoles.some(role => userRoles.includes(role));

        if (!hasPermission) {
            throw new ApiError(403, "Access denied - insufficient permissions");
        }

        next();
    };
};

// Admin-only middleware
const adminOnly = roleMiddleware("admin", "super_admin");

// Super admin only middleware
const superAdminOnly = roleMiddleware("super_admin");

// User or admin middleware
const userOrAdmin = roleMiddleware("user", "admin", "super_admin");

export default roleMiddleware;
export { adminOnly, superAdminOnly, userOrAdmin };
