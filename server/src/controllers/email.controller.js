// Example Express controller showing how to use the updated email service
import { sendMail, sendMailSync } from '../utils/mailer.js';

/**
 * Send welcome email (non-blocking)
 * API response is immediate, email is sent asynchronously
 */
export const sendWelcomeEmail = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Send email asynchronously (non-blocking)
    sendMail({
      to: email,
      subject: 'Welcome to SmartBite! 🍽️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4CAF50;">Welcome to SmartBite!</h1>
          <p>Hi ${name},</p>
          <p>Welcome to SmartBite! Your personalized nutrition journey starts now.</p>
          <p>We're excited to help you achieve your health goals!</p>
          <div style="margin: 20px 0;">
            <a href="https://smartbite.app/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Get Started
            </a>
          </div>
          <p>Best regards,<br>The SmartBite Team</p>
        </div>
      `,
      text: `Hi ${name}, welcome to SmartBite! Your personalized nutrition journey starts now. We're excited to help you achieve your health goals!`
    });

    // Return immediately (non-blocking)
    res.status(200).json({
      success: true,
      message: 'Welcome email is being sent'
    });

  } catch (error) {
    console.error('Welcome email controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process welcome email request'
    });
  }
};

/**
 * Send password reset email (synchronous for validation)
 * Waits for email result before responding
 */
export const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email, resetToken, name } = req.body;

    if (!email || !resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset token are required'
      });
    }

    // Send email synchronously (wait for result)
    const result = await sendMailSync({
      to: email,
      subject: 'SmartBite Password Reset 🔑',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6B6B;">Password Reset Request</h1>
          <p>Hi ${name || 'there'},</p>
          <p>You requested a password reset for your SmartBite account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="margin: 20px 0;">
            <a href="https://smartbite.app/reset-password?token=${resetToken}" 
               style="background-color: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The SmartBite Team</p>
        </div>
      `,
      text: `Hi ${name || 'there'}, you requested a password reset for your SmartBite account. Visit this link to reset your password: https://smartbite.app/reset-password?token=${resetToken} (expires in 1 hour)`
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
        emailId: result.data?.id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Password reset email controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset email request'
    });
  }
};

/**
 * Send meal plan notification (non-blocking)
 */
export const sendMealPlanNotification = async (req, res) => {
  try {
    const { email, name, planType = 'weekly' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Send email asynchronously (non-blocking)
    sendMail({
      to: email,
      subject: 'Your SmartBite Meal Plan is Ready! 🍽️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4CAF50;">Your Meal Plan is Ready!</h1>
          <p>Hi ${name},</p>
          <p>Your personalized ${planType} meal plan has been generated!</p>
          <p>Check the app to view your customized nutrition recommendations.</p>
          <div style="margin: 20px 0;">
            <a href="https://smartbite.app/meal-plans" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              View Meal Plan
            </a>
          </div>
          <p>Best regards,<br>The SmartBite Team</p>
        </div>
      `,
      text: `Hi ${name}, your personalized ${planType} meal plan has been generated! Check the app to view your customized nutrition recommendations.`
    });

    // Return immediately (non-blocking)
    res.status(200).json({
      success: true,
      message: 'Meal plan notification is being sent'
    });

  } catch (error) {
    console.error('Meal plan notification controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process meal plan notification request'
    });
  }
};