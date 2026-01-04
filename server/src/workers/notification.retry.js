// src/workers/notification.retry.js
import { Notification } from "../models/notification.model.js";
import { dispatchNotification } from "../services/notification.service.js";

export const retryFailedNotifications = async () => {
    const failed = await Notification.find({
        status: "failed",
        attempts: { $lt: 3 }
    }).populate("user");

    for (const log of failed) {
        try {
            log.attempts += 1;
            await log.save();

            await dispatchNotification({
                user: log.user,
                event: log.event,
                emailPayload: log.payload.emailPayload,
                smsPayload: log.payload.smsPayload
            });
        } catch (err) {
            log.lastError = err.message;
            await log.save();
        }
    }
};
