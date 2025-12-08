import { ApiError } from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied");
        }

        next();
    };
};

export default roleMiddleware;
