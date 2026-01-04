import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react'
import { feedbackService } from '../services/feedbackService'
import { useToast } from '../contexts/ToastContext'

const QuickFeedback = ({ mealId, mealPlanId, onClose }) => {
  const { success, error } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState('')

  const quickFeedbackTypes = [
    { value: 'liked', label: 'Liked', icon: ThumbsUp, color: 'green' },
    { value: 'disliked', label: 'Disliked', icon: ThumbsDown, color: 'red' },
    { value: 'too_expensive', label: 'Too Expensive', icon: '💰', color: 'orange' },
    { value: 'too_spicy', label: 'Too Spicy', icon: '🌶️', color: 'red' },
    { value: 'too_hard_to_cook', label: 'Too Hard', icon: '🔥', color: 'orange' },
    { value: 'portion_size_issue', label: 'Portion Issue', icon: '📏', color: 'purple' }
  ]

  const handleQuickFeedback = async (type) => {
    if (!mealId && !mealPlanId) {
      error('No meal or meal plan specified')
      return
    }

    try {
      setSubmitting(true)
      setSelectedType(type)
      
      const payload = {
        type,
        ...(mealId && { mealId }),
        ...(mealPlanId && { mealPlanId })
      }

      const response = await feedbackService.submitFeedback(payload)
      
      if (response.success) {
        success('Feedback submitted successfully!')
        onClose && onClose()
      }
    } catch (err) {
      error(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
      setSelectedType('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Quick Feedback
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {quickFeedbackTypes.map(type => {
          const Icon = type.icon
          const isSubmittingThis = submitting && selectedType === type.value
          
          return (
            <button
              key={type.value}
              onClick={() => handleQuickFeedback(type.value)}
              disabled={submitting}
              className={`flex items-center space-x-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                isSubmittingThis
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {typeof Icon === 'string' ? (
                <span className="text-lg">{Icon}</span>
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {type.label}
              </span>
            </button>
          )
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            const url = mealId 
              ? `/dashboard/feedback?mealId=${mealId}`
              : `/dashboard/feedback?mealPlanId=${mealPlanId}`
            window.location.href = url
          }}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Detailed Feedback</span>
        </button>
      </div>
    </motion.div>
  )
}

export default QuickFeedback