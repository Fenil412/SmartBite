// src/services/cron/weeklySummary.cron.js
import cron from "node-cron";
import { User } from "../../models/user.model.js";
import { dispatchNotification } from "../notification.service.js";
import { NOTIFICATION_EVENTS } from "../../utils/notificationEvents.js";

export const startWeeklySummaryCron = () => {
    cron.schedule("0 9 * * 1", async () => {
        const users = await User.find({
            "notificationPreferences.events.weeklySummary": true,
            isDeleted: false
        });

        for (const user of users) {
            await dispatchNotification({
                user,
                event: NOTIFICATION_EVENTS.WEEKLY_SUMMARY,
                emailPayload: {
                    to: user.email,
                    subject: "Your SmartBite Weekly Summary",
                    text: "Here is your weekly nutrition summary."
                },
                smsPayload: {
                    to: user.phone,
                    message: "SmartBite: Your weekly summary is ready."
                }
            });
        }
    });
};
