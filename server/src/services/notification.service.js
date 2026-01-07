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
        // Send email to ALL users (ignore email preferences for important notifications)
        if (emailPayload?.to) {
            await sendMail(emailPayload);
            log.channels.email.status = "success";
            emailSuccess = true;
            console.log(`✅ Email sent successfully to user ${user._id}: ${emailPayload.to}`);
        } else {
            log.channels.email.error = "No email address provided";
            console.log(`⚠️ No email address for user ${user._id}`);
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
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">Welcome to SmartBite! 🍽️</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Welcome to SmartBite! Your personalized nutrition journey starts now. 
                            We're excited to help you achieve your health goals!
                        </p>
                        <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #4CAF50; margin-top: 0;">What's Next?</h3>
                            <ul style="color: #333; line-height: 1.6;">
                                <li>Complete your profile for personalized recommendations</li>
                                <li>Generate your first AI-powered meal plan</li>
                                <li>Track your nutrition goals</li>
                                <li>Get health insights and recommendations</li>
                            </ul>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://smartbite.app/dashboard" 
                               style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Get Started Now
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                            Best regards,<br>The SmartBite Team
                        </p>
                    </div>
                </div>
            `,
            text: `Hi ${user.name}, welcome to SmartBite! Your personalized nutrition journey starts now. We're excited to help you achieve your health goals!`
        },
        smsPayload: {
            to: user.phone,
            message: `Welcome to SmartBite, ${user.name}! 🍽️ Your personalized nutrition journey starts now. Download our app and start tracking your meals today!`
        }
    });
};

export const notifyLogin = (user) => {
    const loginTime = new Date().toLocaleString();
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.USER_LOGIN,
        emailPayload: {
            to: user.email,
            subject: "SmartBite Login Alert 🔐",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #FF6B6B; margin: 0; font-size: 24px;">Login Alert 🔐</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            We detected a new login to your SmartBite account.
                        </p>
                        <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                            <p style="margin: 0; color: #333;"><strong>Login Details:</strong></p>
                            <p style="margin: 5px 0; color: #666;">Time: ${loginTime}</p>
                            <p style="margin: 5px 0; color: #666;">Account: ${user.email}</p>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            If this wasn't you, please secure your account immediately by changing your password.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://smartbite.app/change-password" 
                               style="background-color: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Change Password
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                            Best regards,<br>The SmartBite Security Team
                        </p>
                    </div>
                </div>
            `,
            text: `Hi ${user.name}, we detected a new login to your SmartBite account at ${loginTime}. If this wasn't you, please secure your account immediately.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite Login Alert: New login detected at ${loginTime}. If this wasn't you, please secure your account immediately.`
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
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2196F3; margin: 0; font-size: 24px;">Password Reset Request 🔑</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            You requested a password reset for your SmartBite account. Use the OTP below to reset your password:
                        </p>
                        <div style="background-color: #e3f2fd; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code:</p>
                            <h2 style="margin: 10px 0; color: #2196F3; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</h2>
                            <p style="margin: 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
                        </div>
                        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #e65100; font-size: 14px;">
                                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                            </p>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                            Best regards,<br>The SmartBite Security Team
                        </p>
                    </div>
                </div>
            `,
            text: `Hi ${user.name}, your password reset OTP is: ${otp}. This code will expire in 10 minutes. If you didn't request this, please ignore this message.`
        },
        smsPayload: {
            to: user.phone,
            message: `SmartBite Password Reset OTP: ${otp}. Valid for 10 minutes. If you didn't request this, please ignore.`
        }
    });
};

export const notifyPasswordChanged = (user) => {
    const changeTime = new Date().toLocaleString();
    return dispatchNotification({
        user,
        event: NOTIFICATION_EVENTS.PASSWORD_CHANGED,
        emailPayload: {
            to: user.email,
            subject: "SmartBite Password Changed Successfully ✅",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #4CAF50; margin: 0; font-size: 24px;">Password Changed Successfully ✅</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Your SmartBite password was successfully changed.
                        </p>
                        <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                            <p style="margin: 0; color: #333;"><strong>Change Details:</strong></p>
                            <p style="margin: 5px 0; color: #666;">Time: ${changeTime}</p>
                            <p style="margin: 5px 0; color: #666;">Account: ${user.email}</p>
                        </div>
                        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #e65100; font-size: 14px;">
                                <strong>⚠️ Security Notice:</strong> If you didn't make this change, please contact our support team immediately.
                            </p>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://smartbite.app/support" 
                               style="background-color: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Contact Support
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                            Best regards,<br>The SmartBite Security Team
                        </p>
                    </div>
                </div>
            `,
            text: `Hi ${user.name}, your SmartBite password was successfully changed at ${changeTime}. If you didn't make this change, please contact support immediately.`
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
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #4CAF50; margin: 0; font-size: 24px;">Your Meal Plan is Ready! 🍽️</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Great news! Your personalized <strong>${planType} meal plan</strong> has been generated and is ready for you!
                        </p>
                        <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #4CAF50; margin-top: 0;">Your Plan Includes:</h3>
                            <ul style="color: #333; line-height: 1.6;">
                                <li>Customized nutrition recommendations</li>
                                <li>Balanced meal suggestions</li>
                                <li>Ingredient lists and preparation tips</li>
                                <li>Calorie and macro tracking</li>
                            </ul>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://smartbite.app/meal-plans" 
                               style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                View Your Meal Plan
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                            Best regards,<br>The SmartBite Team
                        </p>
                    </div>
                </div>
            `,
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
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #FF9800; margin: 0; font-size: 24px;">Thank You for Your Feedback! 🌟</h1>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Thank you for taking the time to rate your <strong>${feedbackType}</strong>!
                        </p>
                        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 14px;">Your Rating:</p>
                            <div style="margin: 10px 0;">
                                ${'⭐'.repeat(rating)}${'☆'.repeat(5-rating)}
                            </div>
                            <p style="margin: 0; color: #FF9800; font-size: 18px; font-weight: bold;">${rating}/5 Stars</p>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #333;">
                            Your feedback helps us improve SmartBite and provide better meal recommendations for you and our community.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://smartbite.app/feedback" 
                               style="background-color: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Share More Feedback
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                            Best regards,<br>The SmartBite Team
                        </p>
                    </div>
                </div>
            `,
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
