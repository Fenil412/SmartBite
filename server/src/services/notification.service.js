// src/services/notification.service.js
import { Notification } from "../models/notification.model.js";
import { NOTIFICATION_EVENTS } from "../utils/notificationEvents.js";
import { sendMail } from "../utils/mailer.js";
import { sendSMS } from "../utils/sms.js";

const MAX_ATTEMPTS = 3;

export const dispatchNotification = async ({
    user,
    event,
    emailPayload,
    smsPayload
}) => {
    const log = await Notification.create({
        user: user._id,
        event,
        payload: { emailPayload, smsPayload },
        status: "pending",
        attempts: 1,
        channels: {
            email: { status: "failed" },
            sms: { status: "failed" }
        }
    });

    let emailSuccess = false;
    let smsSuccess = false;

    /* ---------- EMAIL ---------- */
    try {
        if (user.notificationPreferences?.email !== false && emailPayload?.to) {
            await sendMail(emailPayload);
            log.channels.email.status = "success";
            emailSuccess = true;
        }
    } catch (err) {
        log.channels.email.error = err.message;
        console.error("Email send failed:", err.message);
    }

    /* ---------- SMS ---------- */
    try {
        if (
            user.notificationPreferences?.sms !== false &&
            user.phone &&
            process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN
        ) {
            const res = await sendSMS(smsPayload);
            log.channels.sms.status = "success";
            smsSuccess = true;
        } else {
            console.warn("SMS skipped: missing phone or Twilio credentials");
        }
    } catch (err) {
        log.channels.sms.error = err.message;
        console.error("SMS send failed:", err.message);
    }

    /* ---------- FINAL STATUS ---------- */
    if (emailSuccess || smsSuccess) {
        log.status = "sent";
        log.sentAt = new Date();
    } else {
        log.status = "failed";
    }

    await log.save();

    // ⚠️ NEVER throw → login/signup must not fail because SMS failed
    return { email: emailSuccess, sms: smsSuccess };
};


/* ========= EVENT HELPERS ========= */

export const notifySignup = (user) =>
    dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.USER_SIGNUP,
        emailPayload: {
            to: user.email,
            subject: "Welcome to SmartBite",
            text: `Hi ${user.name}, welcome to SmartBite!`
        },
        smsPayload: {
            to: user.phone,
            message: "Welcome to SmartBite! Your journey starts now."
        }
    });

export const notifyLogin = (user) =>
    dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.USER_LOGIN,
        emailPayload: {
            to: user.email,
            subject: "Login Alert",
            text: "New login detected on your SmartBite account."
        },
        smsPayload: {
            to: user.phone,
            message: "SmartBite login detected."
        }
    });

export const notifyPasswordOtp = (user, otp) =>
    dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_RESET_OTP,
        emailPayload: {
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp}`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite OTP: ${otp}`
        }
    });


export const notifyPasswordChanged = (user) =>
    dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_CHANGED,
        emailPayload: {
            to: user.email,
            subject: "Password changed",
            text: "Your password was updated successfully."
        },
        smsPayload: {
            to: user.phone,
            message: "SmartBite password changed successfully."
        }
    });

export const notifyPasswordExpiry = (user, expiryDate) =>
    dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_EXPIRY_REMINDER,
        emailPayload: {
            to: user.email,
            subject: "Password expiring soon",
            text: `Your password expires on ${expiryDate}`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite: Your password expires on ${expiryDate}`
        }
    });
