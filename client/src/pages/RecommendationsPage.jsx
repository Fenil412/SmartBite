import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, Clock, ChefHat, MessageSquare, History } from 'lucide-react'
import { recommendationService } from '../services/recommendationService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'

const RecommendationsPage = () => {
  const { success, error } = useToast()
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [latestPlan, setLatestPlan] = useState(null)
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
        if (response.data.plans.length > 0) {
          setLatestPlan(response.data.plans[0])
        }
      }
    } catch (err) {
      error(err.message || 'Failed to load meal plan history')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    try {
      setGenerating(true)
      const response = await recommendationService.generateMealPlan()
      
      if (response.success) {
        success('Weekly meal plan generated successfully!')
        setLatestPlan(response.data.mealPlan)
        // Reload history to include the new plan
        await loadPlanHistory()
      }
    } catch (err) {
      error(err.message || 'Failed to generate meal plan')
    } finally {
      setGenerating(false)
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

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-200'
      case 'lunch': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-200'
      case 'dinner': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-200'
      case 'snack': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Recommendations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate personalized weekly meal plans using AI based on your preferences and constraints
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Generate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Generate Meal Plan
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Let our AI create a personalized weekly meal plan based on your preferences, constraints, and feedback history.
              </p>
              
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Weekly Plan</span>
                  </>
                )}
              </button>
              
              {generating && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  AI is analyzing your preferences and creating your personalized meal plan...
                </p>
              )}
            </div>
          </div>

          {/* AI Transparency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  How AI Recommendations Work
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Your cooking constraints are applied to filter suitable meals</li>
                  <li>• Past feedback improves future meal selections</li>
                  <li>• AI ranking considers your preferences and nutrition goals</li>
                  <li>• Weekly plans are balanced for variety and nutrition</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Latest Plan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : latestPlan ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    Latest Generated Plan
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(latestPlan.weekStartDate)} - {formatDate(getWeekEndDate(latestPlan.weekStartDate))}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(latestPlan.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/dashboard/feedback?mealPlanId=${latestPlan._id}`}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Feedback</span>
                  </Link>
                  
                  <Link
                    to={`/dashboard/meal-planner/${latestPlan._id}`}
                    className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span>View Plan</span>
                  </Link>
                </div>
              </div>

              {/* Nutrition Summary */}
              {(() => {
                const nutrition = calculateTotalNutrition(latestPlan)
                return (
                  <div className="grid grid-cols-4 gap-4 mb-6">
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
                )
              })()}

              {/* Weekly Breakdown */}
              <div className="space-y-4">
                {latestPlan.days.map((day) => (
                  <div key={day.day} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      {dayNames[day.day]}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {day.meals.map((mealEntry, mealIndex) => (
                        <div key={mealIndex} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                            {mealEntry.meal.image?.url ? (
                              <img
                                src={mealEntry.meal.image.url}
                                alt={mealEntry.meal.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ChefHat className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {mealEntry.meal.name}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMealTypeColor(mealEntry.mealType)}`}>
                                {mealEntry.mealType}
                              </span>
                              {mealEntry.meal.nutrition && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {mealEntry.meal.nutrition.calories} cal
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No meal plans generated yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Generate your first AI-powered weekly meal plan to get started.
              </p>
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Your First Plan</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Plan History Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 text-center"
      >
        <Link
          to="/dashboard/recommendations/history"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <History className="h-4 w-4" />
          <span>View All Generated Plans ({planHistory.length})</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default RecommendationsPage