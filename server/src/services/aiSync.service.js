import axios from "axios";
import crypto from "crypto";

/**
 * Push user context to Flask AI backend
 * This should be called only when user data changes
 */
export const syncUserContextToFlask = async (userContext) => {
    if (!process.env.FLASK_AI_BASE_URL || !process.env.INTERNAL_HMAC_SECRET) {
        return;
    }

    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();

        const payload = {
            userId: userContext.user.id.toString(),
            data: userContext,
            timestamp: timestamp
        };

        const body = JSON.stringify(payload);

        // Generate HMAC signature for security
        const signature = crypto
            .createHmac("sha256", process.env.INTERNAL_HMAC_SECRET)
            .update(timestamp + body)
            .digest("hex");

        const response = await axios.post(
            `${process.env.FLASK_AI_BASE_URL}/internal/sync-user`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-timestamp": timestamp,
                    "x-signature": signature,
                    "User-Agent": "SmartBite-Node/1.0"
                },
                timeout: 5000
            }
        );

    } catch (error) {
        // Log error but don't throw - Flask downtime should not break Node APIs
        // Don't throw - this is a non-blocking operation
    }
};

/**
 * Trigger user context sync when data changes
 * Call this from controllers when user data is updated
 */
export const triggerUserContextSync = async (userId) => {
    try {
        // Import here to avoid circular dependency
        const { buildUserMLContext } = await import("./mlContract.service.js");
        const userContext = await buildUserMLContext(userId);
        await syncUserContextToFlask(userContext);
    } catch (error) {
        // Don't throw - this is a background operation
    }
};
