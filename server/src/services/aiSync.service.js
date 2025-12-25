import axios from "axios";
import crypto from "crypto";

/**
 * Push user context to Flask AI backend
 * This should be called only when user data changes
 */
export const syncUserContextToFlask = async (userContext) => {
    if (!process.env.FLASK_AI_BASE_URL) {
        throw new Error("FLASK_AI_BASE_URL not set");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();

    const payload = {
        userId: userContext.user.id.toString(),
        data: userContext
    };

    const body = JSON.stringify(payload);

    const signature = crypto
        .createHmac("sha256", process.env.INTERNAL_HMAC_SECRET)
        .update(timestamp + body)
        .digest("hex");

    await axios.post(
        `${process.env.FLASK_AI_BASE_URL}/internal/sync-user`,
        {
            userId: userContext.user.id.toString(),
            data: userContext
        },
        {
            headers: {
                "Content-Type": "application/json",
                "x-timestamp": timestamp,
                "x-signature": signature
            }
        },
        {
            timeout: 5000
        }
    );
};
