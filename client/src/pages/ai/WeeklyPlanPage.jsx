import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'
import { Calendar, Sparkles, Clock } from 'lucide-react'

const WeeklyPlanPage = () => {
  const { user } = useAuth()
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [targets, setTargets] = useState({
    dailyCalorieTarget: 2000
  })

  const generateWeeklyPlan = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Build profile from user data
      const profile = {
        age: user.profile?.age || 25,
        gender: user.profile?.gender || 'other',
        height: user.profile?.heightCm || 170,
        weight: user.profile?.weightKg || 70,
        activityLevel: user.profile?.activityLevel || 'moderate',
        goal: user.profile?.goal || 'maintenance',
        dietaryPreferences: user.profile?.dietaryPreferences || [],
        dietaryRestrictions: user.profile?.dietaryRestrictions || [],
        allergies: user.profile?.allergies || []
      }

      const response = await flaskAiService.generateWeeklyPlan(user._id, profile, targets)
      
      if (response.success) {
        setWeeklyPlan(response.data)
      } else {
        throw new Error(response.message || 'Failed to generate weekly plan')
      }
    } catch (error) {
      console.error('Weekly plan generation failed:', error)
      setError(error.message || 'Failed to generate weekly plan')
    } finally {
      setLoading(false)
    }
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const mealTypes = ['breakfast', 'lunch', 'dinner']

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙'
    }
    return icons[type] || '🍽️'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Weekly Meal Plan Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate a personalized weekly meal plan based on your profile and goals
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ⚠️ AI-generated meal plan • Adjust based on your preferences
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Profile Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Your Profile Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Age</div>
            <div className="font-medium">{user?.profile?.age || 'Not set'}</div>
          </div>
          <div>
            <div className="text-gray-500">Goal</div>
            <div className="font-medium capitalize">{user?.profile?.goal?.replace('_', ' ') || 'Not set'}</div>
          </div>
          <div>
            <div className="text-gray-500">Activity Level</div>
            <div className="font-medium capitalize">{user?.profile?.activityLevel || 'Not set'}</div>
          </div>
          <div>
            <div className="text-gray-500">Diet Type</div>
            <div className="font-medium">
              {user?.profile?.dietaryPreferences?.join(', ') || 'None specified'}
            </div>
          </div>
        </div>

        {/* Calorie Target */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Daily Calorie Target
          </label>
          <input
            type="number"
            value={targets.dailyCalorieTarget}
            onChange={(e) => setTargets({ ...targets, dailyCalorieTarget: parseInt(e.target.value) })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1000"
            max="5000"
          />
          <span className="ml-2 text-sm text-gray-500">calories/day</span>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={generateWeeklyPlan}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          {loading ? 'Generating Plan...' : 'Generate Weekly Plan'}
        </button>
      </div>

      {/* Weekly Plan Grid */}
      {weeklyPlan && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Your AI-Generated Weekly Plan
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {days.map((day) => (
              <div key={day} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  {day}
                </h3>
                
                <div className="space-y-3">
                  {mealTypes.map((mealType) => {
                    const meal = weeklyPlan.weeklyPlan?.[day]?.find(m => m.mealType === mealType)
                    
                    return (
                      <div key={mealType} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">{getMealTypeIcon(mealType)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {mealType}
                          </span>
                        </div>
                        
                        {meal ? (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                              {meal.name}
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div className="flex items-center">
                                <span>{meal.calories || 'N/A'} cal</span>
                              </div>
                              {meal.cookTime && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{meal.cookTime} min</span>
                                </div>
                              )}
                              {meal.cuisine && (
                                <div className="text-blue-600 dark:text-blue-400">
                                  {meal.cuisine}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">
                            No meal planned
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Daily Total Calories */}
                {weeklyPlan.weeklyPlan?.[day] && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 text-center">
                      Daily Total: {
                        weeklyPlan.weeklyPlan[day].reduce((total, meal) => total + (meal.calories || 0), 0)
                      } cal
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Plan Summary */}
          {weeklyPlan.summary && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Plan Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {weeklyPlan.summary}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> This meal plan is AI-generated based on your profile. 
              Please adjust portions and ingredients based on your specific needs, preferences, and any medical conditions. 
              Consult with a healthcare provider or registered dietitian for personalized nutrition advice.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeeklyPlanPage