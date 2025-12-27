import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, BarChart3, MessageSquare, Eye, Sparkles } from 'lucide-react'
import { recommendationService } from '../services/recommendationService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link, useNavigate } from 'react-router-dom'

const RecommendationHistoryPage = () => {
  const navigate = useNavigate()
  const { error } = useToast()
  const [loading, setLoading] = useState(true)
  const [planHistory, setPlanHistory] = useState([])

  useEffect(() => {
    loadPlanHistory()
  }, [])

  const loadPlanHistory = async () => {
    try {
      setLoading(true)
      const response = await recommendationService.getMealPlanHistory()
      
      if (response.success) {
        setPlanHistory(response.data.plans)
      }
    } catch (err) {
      error(err.message || 'Failed to load meal plan history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getWeekEndDate = (startDate) => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    return endDate
  }

  const calculateTotalNutrition = (plan) => {
    if (!plan || !plan.days) return { calories: 0, protein: 0, carbs: 0, fats: 0 }
    
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0
    
    plan.days.forEach(day => {
      day.meals.forEach(mealEntry => {
        if (mealEntry.meal && mealEntry.meal.nutrition) {
          totalCalories += mealEntry.meal.nutrition.calories || 0
          totalProtein += mealEntry.meal.nutrition.protein || 0
          totalCarbs += mealEntry.meal.nutrition.carbs || 0
          totalFats += mealEntry.meal.nutrition.fats || 0
        }
      })
    })
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats)
    }
  }

  const getTotalMeals = (plan) => {
    if (!plan || !plan.days) return 0
    return plan.days.reduce((total, day) => total + day.meals.length, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading meal plan history..." />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/dashboard/recommendations')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to recommendations</span>
        </button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meal Plan History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all your AI-generated meal plans and their performance
        </p>
      </motion.div>

      {/* Plans List */}
      {planHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center py-12"
        >
          <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No meal plans generated yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Generate your first AI-powered weekly meal plan to see it here.
          </p>
          <Link
            to="/dashboard/recommendations"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Meal Plan</span>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {planHistory.map((plan, index) => {
            const nutrition = calculateTotalNutrition(plan)
            const totalMeals = getTotalMeals(plan)
            
            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.title || `Week of ${formatDate(plan.weekStartDate)}`}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(plan.weekStartDate)} - {formatDate(getWeekEndDate(plan.weekStartDate))}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{totalMeals} meals planned</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Generated {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/dashboard/feedback?mealPlanId=${plan._id}`}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Feedback</span>
                    </Link>
                    
                    <Link
                      to={`/dashboard/meal-planner/${plan._id}`}
                      className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Plan</span>
                    </Link>
                  </div>
                </div>

                {/* Nutrition Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {nutrition.calories}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Calories
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {nutrition.protein}g
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Protein
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {nutrition.carbs}g
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Carbs
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {nutrition.fats}g
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Fats
                    </div>
                  </div>
                </div>

                {/* Days Preview */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
                    {plan.days.map((day) => (
                      <div key={day.day} className="text-center">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                          {day.day.slice(0, 3)}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {day.meals.length} meals
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      {planHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your AI Meal Planning Journey
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {planHistory.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Plans Generated
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {planHistory.reduce((total, plan) => total + getTotalMeals(plan), 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Meals Planned
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {planHistory.length * 7}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Days Covered
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RecommendationHistoryPage