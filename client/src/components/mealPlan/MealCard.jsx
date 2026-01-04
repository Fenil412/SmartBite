import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, RefreshCw, Clock, Zap } from 'lucide-react'
import { mealPlanService } from '../../services/mealPlanService'
import { useToast } from '../../contexts/ToastContext'

const MealCard = ({ meal, day, planId, onStatusUpdate }) => {
  const { success, error } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [replacementText, setReplacementText] = useState('')

  const getStatusColor = (status) => {
    switch (status) {
      case 'eaten': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'skipped': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      case 'replaced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'eaten': return <Check className="h-3 w-3" />
      case 'skipped': return <X className="h-3 w-3" />
      case 'replaced': return <RefreshCw className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const handleAdhere = async () => {
    setIsUpdating(true)
    try {
      const response = await mealPlanService.adhereMeal(planId, {
        day,
        mealType: meal.mealType
      })
      
      if (response.success) {
        success('Meal marked as eaten')
        onStatusUpdate(day, meal.mealType, 'eaten')
      }
    } catch (err) {
      error(err.message || 'Failed to update meal status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSkip = async () => {
    setIsUpdating(true)
    try {
      const response = await mealPlanService.skipMeal(planId, {
        day,
        mealType: meal.mealType
      })
      
      if (response.success) {
        success('Meal marked as skipped')
        onStatusUpdate(day, meal.mealType, 'skipped')
      }
    } catch (err) {
      error(err.message || 'Failed to update meal status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReplace = async () => {
    if (!replacementText.trim()) {
      error('Please enter what you ate instead')
      return
    }

    setIsUpdating(true)
    try {
      const response = await mealPlanService.replaceMeal(planId, {
        day,
        mealType: meal.mealType,
        replacedWith: replacementText.trim()
      })
      
      if (response.success) {
        success('Meal marked as replaced')
        onStatusUpdate(day, meal.mealType, 'replaced', replacementText.trim())
        setShowReplaceModal(false)
        setReplacementText('')
      }
    } catch (err) {
      error(err.message || 'Failed to update meal status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'breakfast': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-200'
      case 'lunch': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-200'
      case 'dinner': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-200'
      case 'snack': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const isActionDisabled = meal.adherence.status !== 'planned' || isUpdating

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Image */}
        <div className="relative h-32 bg-gray-200 dark:bg-gray-700">
          {meal.meal.image?.url ? (
            <img
              src={meal.meal.image.url}
              alt={meal.meal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">🍽️</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meal.adherence.status)}`}>
              {getStatusIcon(meal.adherence.status)}
              <span className="capitalize">{meal.adherence.status}</span>
            </span>
          </div>

          {/* Meal Type Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMealTypeColor(meal.mealType)}`}>
              {meal.mealType}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {meal.meal.name}
          </h4>

          {/* Replacement Info */}
          {meal.adherence.status === 'replaced' && meal.adherence.replacedWith && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Replaced with:</strong> {meal.adherence.replacedWith}
              </p>
            </div>
          )}

          {/* Nutrition */}
          {meal.meal.nutrition && (
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>{meal.meal.nutrition.calories} cal</span>
              </div>
              <span>{meal.meal.nutrition.protein}g protein</span>
              <span>{meal.meal.nutrition.carbs}g carbs</span>
              <span>{meal.meal.nutrition.fats}g fat</span>
            </div>
          )}

          {/* Action Buttons */}
          {meal.adherence.status === 'planned' && (
            <div className="flex space-x-2">
              <button
                onClick={handleAdhere}
                disabled={isActionDisabled}
                className="flex-1 flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-3 w-3" />
                <span>Eaten</span>
              </button>
              
              <button
                onClick={handleSkip}
                disabled={isActionDisabled}
                className="flex-1 flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-3 w-3" />
                <span>Skip</span>
              </button>
              
              <button
                onClick={() => setShowReplaceModal(true)}
                disabled={isActionDisabled}
                className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Replace</span>
              </button>
            </div>
          )}

          {/* Status Updated Time */}
          {meal.adherence.updatedAt && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Updated: {new Date(meal.adherence.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Replace Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Replace Meal
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              What did you eat instead of <strong>{meal.meal.name}</strong>?
            </p>
            
            <textarea
              value={replacementText}
              onChange={(e) => setReplacementText(e.target.value)}
              placeholder="e.g., Chicken salad with vegetables"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReplaceModal(false)
                  setReplacementText('')
                }}
                disabled={isUpdating}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleReplace}
                disabled={isUpdating || !replacementText.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Replace'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default MealCard