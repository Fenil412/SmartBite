import { Notification } from "../models/notification.model.js";
import { NOTIFICATION_EVENTS } from "../utils/notificationEvents.js";

// dynamic import to avoid circular deps
const getMailer = async () => {
    const module = await import("../utils/mailer.js");
    return module.sendMail;
};

export const sendNotification = async ({
    user,
    event,
    title,
    message,
    meta = {},
    channel = "email"
}) => {
    const notification = await Notification.create({
        user: user._id,
        event,
        title,
        message,
        meta,
        channel
    });

    try {
        if (channel === "email") {
            const sendMail = await getMailer();
            await sendMail({
                to: user.email,
                subject: title,
                text: message
            });
        }

        notification.status = "sent";
        await notification.save();
    } catch (err) {
        notification.status = "failed";
        notification.error = err.message;
        await notification.save();
    }

    return notification;
};

/* ===========================
   EVENT HELPERS
=========================== */

export const notifySignup = (user) =>
    sendNotification({
        user,
        event: NOTIFICATION_EVENTS.USER_SIGNUP,
        title: "Welcome to SmartBite",
        message: `Hi ${user.name},\n\nWelcome to SmartBite! Your journey to smarter nutrition starts now.`
    });

export const notifyLogin = (user, ip) =>
    sendNotification({
        user,
        event: NOTIFICATION_EVENTS.USER_LOGIN,
        title: "New Login Detected",
        message: `Hi ${user.name},\n\nA new login was detected from IP: ${ip}`
    });

export const notifyPasswordOtp = (user, otp) =>
    sendNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_RESET_OTP,
        title: "SmartBite Password Reset OTP",
        message: `Your OTP is ${otp}. It is valid for 10 minutes.`
    });

export const notifyPasswordChanged = (user) =>
    sendNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_CHANGED,
        title: "Password Changed Successfully",
        message: "Your SmartBite password was changed successfully."
    });

export const notifyPasswordExpiry = (user) =>
    sendNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_EXPIRY_REMINDER,
        title: "Password Expiry Reminder",
        message: `Your password will expire on ${user.passwordExpiresAt}. Please update it soon.`
    });
