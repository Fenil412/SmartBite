import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Star, MessageSquare, History, Search, ChevronDown } from 'lucide-react'
import { feedbackService } from '../services/feedbackService'
import { mealService } from '../services/mealService'
import { mealPlanService } from '../services/mealPlanService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const FeedbackPage = () => {
  const [searchParams] = useSearchParams()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [meals, setMeals] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const [loadingMeals, setLoadingMeals] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  
  const [formData, setFormData] = useState({
    feedbackFor: 'meal', // 'meal' or 'mealPlan'
    selectedMealId: '',
    selectedMealPlanId: '',
    type: '',
    rating: 0,
    comment: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showMealDropdown, setShowMealDropdown] = useState(false)
  const [showPlanDropdown, setShowPlanDropdown] = useState(false)

  const feedbackTypes = [
    { value: 'too_expensive', label: 'Too Expensive', icon: '💰', color: 'red' },
    { value: 'too_hard_to_cook', label: 'Too Hard to Cook', icon: '🔥', color: 'orange' },
    { value: 'too_spicy', label: 'Too Spicy', icon: '🌶️', color: 'red' },
    { value: 'too_many_carbs', label: 'Too Many Carbs', icon: '🍞', color: 'yellow' },
    { value: 'too_low_protein', label: 'Too Low Protein', icon: '🥩', color: 'blue' },
    { value: 'portion_size_issue', label: 'Portion Size Issue', icon: '📏', color: 'purple' },
    { value: 'taste_issue', label: 'Taste Issue', icon: '👅', color: 'pink' },
    { value: 'liked', label: 'Liked', icon: '👍', color: 'green' },
    { value: 'disliked', label: 'Disliked', icon: '👎', color: 'red' }
  ]

  useEffect(() => {
    loadFeedbackHistory()
    loadMeals()
    loadMealPlans()
    
    // Check URL parameters for pre-selection
    const mealId = searchParams.get('mealId')
    const mealPlanId = searchParams.get('mealPlanId')
    
    if (mealId) {
      setFormData(prev => ({
        ...prev,
        feedbackFor: 'meal',
        selectedMealId: mealId
      }))
    } else if (mealPlanId) {
      setFormData(prev => ({
        ...prev,
        feedbackFor: 'mealPlan',
        selectedMealPlanId: mealPlanId
      }))
    }
  }, [searchParams])

  const loadMeals = async () => {
    try {
      setLoadingMeals(true)
      const response = await mealService.getMeals({ limit: 50 })
      
      if (response.success) {
        setMeals(response.data.meals.docs || [])
      }
    } catch (err) {
      console.error('Failed to load meals:', err)
    } finally {
      setLoadingMeals(false)
    }
  }

  const loadMealPlans = async () => {
    try {
      setLoadingPlans(true)
      const response = await mealPlanService.getMyMealPlans()
      
      if (response.success) {
        setMealPlans(response.data.plans || [])
      }
    } catch (err) {
      console.error('Failed to load meal plans:', err)
    } finally {
      setLoadingPlans(false)
    }
  }

  const loadFeedbackHistory = async () => {
    try {
      setLoading(true)
      const response = await feedbackService.getMyFeedback()
      
      if (response.success) {
        setFeedbackHistory(response.data.feedbacks)
      }
    } catch (err) {
      error(err.message || 'Failed to load feedback history')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.type) {
      error('Please select a feedback type')
      return
    }

    if (formData.feedbackFor === 'meal' && !formData.selectedMealId) {
      error('Please select a meal to give feedback about')
      return
    }

    if (formData.feedbackFor === 'mealPlan' && !formData.selectedMealPlanId) {
      error('Please select a meal plan to give feedback about')
      return
    }

    try {
      setSubmitting(true)
      
      const payload = {
        type: formData.type,
        ...(formData.rating > 0 && { rating: formData.rating }),
        ...(formData.comment.trim() && { comment: formData.comment.trim() }),
        ...(formData.feedbackFor === 'meal' && { mealId: formData.selectedMealId }),
        ...(formData.feedbackFor === 'mealPlan' && { mealPlanId: formData.selectedMealPlanId })
      }

      const response = await feedbackService.submitFeedback(payload)
      
      if (response.success) {
        success('Feedback submitted successfully!')
        
        // Reset form
        setFormData({
          feedbackFor: 'meal',
          selectedMealId: '',
          selectedMealPlanId: '',
          type: '',
          rating: 0,
          comment: ''
        })
        
        // Reload feedback history
        await loadFeedbackHistory()
      }
    } catch (err) {
      error(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const getFeedbackTypeInfo = (type) => {
    return feedbackTypes.find(ft => ft.value === type) || { label: type, icon: '📝', color: 'gray' }
  }

  const getColorClasses = (color) => {
    const colorMap = {
      red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
    return colorMap[color] || colorMap.gray
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onStarClick && onStarClick(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Feedback
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Help us improve your meal recommendations by sharing your feedback
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Submit Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Submit Feedback
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback For Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Give Feedback For *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  formData.feedbackFor === 'meal'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="feedbackFor"
                    value="meal"
                    checked={formData.feedbackFor === 'meal'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      feedbackFor: e.target.value,
                      selectedMealId: '',
                      selectedMealPlanId: ''
                    }))}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    🍽️ Meal
                  </span>
                </label>
                
                <label className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  formData.feedbackFor === 'mealPlan'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="feedbackFor"
                    value="mealPlan"
                    checked={formData.feedbackFor === 'mealPlan'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      feedbackFor: e.target.value,
                      selectedMealId: '',
                      selectedMealPlanId: ''
                    }))}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    📅 Meal Plan
                  </span>
                </label>
              </div>
            </div>

            {/* Meal Selection */}
            {formData.feedbackFor === 'meal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Meal *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMealDropdown(!showMealDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <span>
                      {formData.selectedMealId 
                        ? meals.find(m => m._id === formData.selectedMealId)?.name || 'Select a meal'
                        : 'Select a meal'
                      }
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showMealDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search meals..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>
                      {loadingMeals ? (
                        <div className="p-4 text-center">
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto">
                          {meals
                            .filter(meal => 
                              meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              meal.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(meal => (
                              <button
                                key={meal._id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, selectedMealId: meal._id }))
                                  setShowMealDropdown(false)
                                  setSearchTerm('')
                                }}
                                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3"
                              >
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                                  {meal.image?.url ? (
                                    <img src={meal.image.url} alt={meal.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">🍽️</div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{meal.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{meal.cuisine}</div>
                                </div>
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meal Plan Selection */}
            {formData.feedbackFor === 'mealPlan' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Meal Plan *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <span>
                      {formData.selectedMealPlanId 
                        ? mealPlans.find(p => p._id === formData.selectedMealPlanId)?.title || 'Select a meal plan'
                        : 'Select a meal plan'
                      }
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showPlanDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {loadingPlans ? (
                        <div className="p-4 text-center">
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : mealPlans.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No meal plans found
                        </div>
                      ) : (
                        <div>
                          {mealPlans.map(plan => (
                            <button
                              key={plan._id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, selectedMealPlanId: plan._id }))
                                setShowPlanDropdown(false)
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{plan.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(plan.weekStartDate).toLocaleDateString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Feedback Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedbackTypes.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Rating (Optional)
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(formData.rating, true, handleRatingClick)}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {formData.rating > 0 ? `${formData.rating}/5` : 'No rating'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Additional Comments (Optional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Share more details about your experience..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.type || 
                (formData.feedbackFor === 'meal' && !formData.selectedMealId) ||
                (formData.feedbackFor === 'mealPlan' && !formData.selectedMealPlanId)
              }
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </form>
        </motion.div>

        {/* Feedback History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-6">
            <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Feedback History
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" message="Loading feedback history..." />
            </div>
          ) : feedbackHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No feedback submitted yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Your feedback history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {feedbackHistory.map(feedback => {
                const typeInfo = getFeedbackTypeInfo(feedback.type)
                return (
                  <div
                    key={feedback._id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(typeInfo.color)}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>

                    {feedback.rating && (
                      <div className="mb-2">
                        {renderStars(feedback.rating)}
                      </div>
                    )}

                    {feedback.comment && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {feedback.comment}
                      </p>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {feedback.meal && (
                        <span>Meal: {feedback.meal.name}</span>
                      )}
                      {feedback.mealPlan && (
                        <span>Plan: {feedback.mealPlan.title}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Context Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              How your feedback helps
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your feedback is used by our AI to improve future meal recommendations. 
              The more feedback you provide, the better we can personalize your meal suggestions 
              based on your preferences, constraints, and past experiences.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default FeedbackPage