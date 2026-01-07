// Example routes for email functionality
import express from 'express';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendMealPlanNotification
} from '../controllers/email.controller.js';

const router = express.Router();

// Non-blocking email routes (immediate response)
router.post('/welcome', sendWelcomeEmail);
router.post('/meal-plan-notification', sendMealPlanNotification);

// Synchronous email route (waits for email result)
router.post('/password-reset', sendPasswordResetEmail);

export default router;