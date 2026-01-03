import { Router } from 'express'
import {
  getAnalytics,
  exportUserData,
  getFeedbackStats,
  getConstraintStats
} from '../controllers/analytics.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Analytics routes
router.route('/').get(getAnalytics)
router.route('/export').get(exportUserData)
router.route('/feedback').get(getFeedbackStats)
router.route('/constraints').get(getConstraintStats)

export default router