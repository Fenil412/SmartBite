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
        console.error(`❌ Email failed for user ${user._id}:`, err.message);
    }

    /* ---------- SMS ---------- */
    try {
        // Enhanced SMS validation and logging
        const hasPhone = user.phone && user.phone.trim().length > 0;
        const hasTwilioConfig = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER;
        const smsEnabled = user.notificationPreferences?.sms !== false;
        const hasMessage = smsPayload?.message && smsPayload.message.trim().length > 0;

        if (smsEnabled && hasPhone && hasTwilioConfig && hasMessage) {
            // Ensure phone number is in proper format
            let phoneNumber = user.phone.trim();
            
            // Add country code if missing (assuming US/Canada for now)
            if (!phoneNumber.startsWith('+')) {
                if (phoneNumber.startsWith('1')) {
                    phoneNumber = '+' + phoneNumber;
                } else if (phoneNumber.length === 10) {
                    phoneNumber = '+1' + phoneNumber;
                } else {
                    throw new Error('Invalid phone number format. Please include country code.');
                }
            }

            const smsData = {
                to: phoneNumber,
                message: smsPayload.message
            };
            
            const res = await sendSMS(smsData);
            log.channels.sms.status = "success";
            log.channels.sms.twilioSid = res.sid;
            smsSuccess = true;
        } else {
            // Log specific reasons why SMS was skipped
            const reasons = [];
            if (!smsEnabled) reasons.push('SMS notifications disabled');
            if (!hasPhone) reasons.push('No phone number');
            if (!hasTwilioConfig) reasons.push('Twilio not configured');
            if (!hasMessage) reasons.push('No message content');
            
            log.channels.sms.error = `SMS skipped: ${reasons.join(', ')}`;
        }
    } catch (err) {
        log.channels.sms.error = err.message;
        console.error(`❌ SMS failed for user ${user._id}:`, err.message);
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

export const notifySignup = (user) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.USER_SIGNUP,
        emailPayload: {
            to: user.email,
            subject: "Welcome to SmartBite! 🍽️",
            text: `Hi ${user.name}, welcome to SmartBite! Your personalized nutrition journey starts now. We're excited to help you achieve your health goals!`
        },
        smsPayload: {
            to: user.phone,
            message: `Welcome to SmartBite, ${user.name}! 🍽️ Your personalized nutrition journey starts now. Download our app and start tracking your meals today!`
        }
    });
};

export const notifyLogin = (user) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.USER_LOGIN,
        emailPayload: {
            to: user.email,
            subject: "SmartBite Login Alert 🔐",
            text: `Hi ${user.name}, we detected a new login to your SmartBite account at ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite Login Alert: New login detected at ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`
        }
    });
};

export const notifyPasswordOtp = (user, otp) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_RESET_OTP,
        emailPayload: {
            to: user.email,
            subject: "SmartBite Password Reset OTP 🔑",
            text: `Hi ${user.name}, your password reset OTP is: ${otp}. This code will expire in 10 minutes. If you didn't request this, please ignore this message.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite Password Reset OTP: ${otp}. Valid for 10 minutes. If you didn't request this, please ignore.`
        }
    });
};

export const notifyPasswordChanged = (user) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_CHANGED,
        emailPayload: {
            to: user.email,
            subject: "SmartBite Password Changed Successfully ✅",
            text: `Hi ${user.name}, your SmartBite password was successfully changed at ${new Date().toLocaleString()}. If you didn't make this change, please contact support immediately.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite: Your password was successfully changed. If you didn't make this change, please contact support immediately.`
        }
    });
};

export const notifyPasswordExpiry = (user, expiryDate) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_EXPIRY_REMINDER,
        emailPayload: {
            to: user.email,
            subject: "SmartBite Password Expiring Soon ⚠️",
            text: `Hi ${user.name}, your SmartBite password will expire on ${expiryDate}. Please update your password to continue using our services without interruption.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite: Your password expires on ${expiryDate}. Please update it to avoid service interruption.`
        }
    });
};

// New helper for meal plan notifications
export const notifyMealPlanGenerated = (user, planType = 'weekly') => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.MEAL_PLAN_GENERATED,
        emailPayload: {
            to: user.email,
            subject: "Your SmartBite Meal Plan is Ready! 🍽️",
            text: `Hi ${user.name}, your personalized ${planType} meal plan has been generated! Check the app to view your customized nutrition recommendations.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite: Your ${planType} meal plan is ready! 🍽️ Check the app to view your personalized nutrition recommendations.`
        }
    });
};

// New helper for weekly summary notifications
export const notifyWeeklySummary = (user, summaryData) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.WEEKLY_SUMMARY,
        emailPayload: {
            to: user.email,
            subject: "Your SmartBite Weekly Summary 📊",
            text: `Hi ${user.name}, your weekly nutrition summary is ready! You've made great progress this week. Check the app to see your detailed analytics.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite Weekly Summary: Great progress this week! 📊 Check the app for your detailed nutrition analytics.`
        }
    });
};

// New helper for feedback confirmation
export const notifyFeedbackReceived = (user, feedbackType, rating) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.FEEDBACK_RECEIVED,
        emailPayload: {
            to: user.email,
            subject: "Thank you for your feedback! 🌟",
            text: `Hi ${user.name}, thank you for rating your ${feedbackType} ${rating}/5 stars! Your feedback helps us improve SmartBite and provide better meal recommendations.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite: Thanks for your ${rating}/5 star rating! 🌟 Your feedback helps us improve your meal recommendations.`
        }
    });
};

// New helper for meal creation confirmation
export const notifyMealCreated = (user, mealName) => {
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.MEAL_CREATED,
        emailPayload: {
            to: user.email,
            subject: "New Meal Added Successfully! 🍽️",
            text: `Hi ${user.name}, your meal "${mealName}" has been successfully added to SmartBite! It's now available for your meal plans and recommendations.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite: Your meal "${mealName}" has been added successfully! 🍽️ It's now available for meal planning.`
        }
    });
};
