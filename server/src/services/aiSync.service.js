import axios from "axios";
import crypto from "crypto";

/**
 * Push user context to Flask AI backend
 * This should be called only when user data changes
 */
export const syncUserContextToFlask = async (userContext) => {
    if (!process.env.FLASK_AI_BASE_URL) {
        console.warn("⚠️ FLASK_AI_BASE_URL not set - skipping AI sync");
        return;
    }

    if (!process.env.INTERNAL_HMAC_SECRET) {
        console.warn("⚠️ INTERNAL_HMAC_SECRET not set - skipping AI sync");
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

        console.log(`🔄 Syncing user context to Flask for user: ${userContext.user.id}`);

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

        if (response.status === 200) {
            console.log(`✅ Successfully synced user context to Flask for user: ${userContext.user.id}`);
        } else {
            console.warn(`⚠️ Flask sync returned status ${response.status} for user: ${userContext.user.id}`);
        }

    } catch (error) {
        // Log error but don't throw - Flask downtime should not break Node APIs
        if (error.code === 'ECONNREFUSED') {
            console.warn(`⚠️ Flask AI service unavailable - user context sync skipped for user: ${userContext.user.id}`);
        } else if (error.code === 'ENOTFOUND') {
            console.warn(`⚠️ Flask AI service DNS resolution failed - check FLASK_AI_BASE_URL`);
        } else if (error.response) {
            console.error(`❌ Flask AI sync failed with status ${error.response.status} for user: ${userContext.user.id}`, error.response.data);
        } else {
            console.error(`❌ Flask AI sync error for user: ${userContext.user.id}`, error.message);
        }
        
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
        console.error(`❌ Failed to trigger user context sync for user ${userId}:`, error.message);
        // Don't throw - this is a background operation
    }
};
