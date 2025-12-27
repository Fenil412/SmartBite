import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Calendar, BarChart3 } from 'lucide-react'
import { mealPlanService } from '../../services/mealPlanService'
import { useToast } from '../../contexts/ToastContext'
import MealSelector from '../../components/mealPlan/MealSelector'
import LoadingSpinner from '../../components/LoadingSpinner'

const CreateMealPlan = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Debug: Track component lifecycle
  useEffect(() => {
    console.log('🔍 DEBUG: CreateMealPlan component mounted')
    return () => {
      console.log('🔍 DEBUG: CreateMealPlan component unmounted')
    }
  }, [])
  
  const [formData, setFormData] = useState({
    title: '',
    weekStartDate: '',
    days: {
      monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      sunday: { breakfast: [], lunch: [], dinner: [], snack: [] }
    }
  })

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday', 
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  // Generate smart default title based on week start date
  const generateDefaultTitle = (weekStartDate) => {
    if (!weekStartDate) return ''
    
    const startDate = new Date(weekStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })
    }
    
    const startMonth = startDate.getMonth()
    const endMonth = endDate.getMonth()
    const year = startDate.getFullYear()
    
    if (startMonth === endMonth) {
      // Same month: "Meal Plan: Jan 15-21, 2024"
      return `Meal Plan: ${formatDate(startDate)}-${endDate.getDate()}, ${year}`
    } else {
      // Different months: "Meal Plan: Jan 29 - Feb 4, 2024"
      return `Meal Plan: ${formatDate(startDate)} - ${formatDate(endDate)}, ${year}`
    }
  }

  // Set default week start date to next Monday and generate title
  useEffect(() => {
    const today = new Date()
    const nextMonday = new Date(today)
    const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7
    nextMonday.setDate(today.getDate() + daysUntilMonday)
    
    const weekStartDate = nextMonday.toISOString().split('T')[0]
    const defaultTitle = generateDefaultTitle(weekStartDate)
    
    setFormData(prev => ({
      ...prev,
      weekStartDate,
      title: defaultTitle
    }))
  }, [])

  const handleWeekStartDateChange = (newDate) => {
    const newTitle = generateDefaultTitle(newDate)
    setFormData(prev => ({
      ...prev,
      weekStartDate: newDate,
      // Only update title if it's still the default/generated title
      title: prev.title === generateDefaultTitle(prev.weekStartDate) ? newTitle : prev.title
    }))
  }

  const handleMealSelect = (day, mealType, meal) => {
    console.log('🔍 DEBUG: handleMealSelect called', { day, mealType, mealName: meal.name })
    console.log('🔍 DEBUG: Current formData before update:', formData.days[day][mealType].length, 'meals')
    
    setFormData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [mealType]: [...prev.days[day][mealType], meal]
        }
      }
    }))
    
    console.log('🔍 DEBUG: Meal added to local state only - NO API CALL')
  }

  const handleMealRemove = (day, mealType, index) => {
    setFormData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [mealType]: prev.days[day][mealType].filter((_, i) => i !== index)
        }
      }
    }))
  }

  const calculateNutritionSummary = () => {
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0

    Object.keys(formData.days).forEach(day => {
      Object.keys(formData.days[day]).forEach(mealType => {
        formData.days[day][mealType].forEach(meal => {
          if (meal.nutrition) {
            totalCalories += meal.nutrition.calories || 0
            totalProtein += meal.nutrition.protein || 0
            totalCarbs += meal.nutrition.carbs || 0
            totalFats += meal.nutrition.fats || 0
          }
        })
      })
    })

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      error('Plan title is required')
      return false
    }

    if (!formData.weekStartDate) {
      error('Week start date is required')
      return false
    }

    // Check if at least one meal is planned
    const hasMeals = Object.keys(formData.days).some(day =>
      Object.keys(formData.days[day]).some(mealType =>
        formData.days[day][mealType].length > 0
      )
    )

    if (!hasMeals) {
      error('Please add at least one meal to your plan')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🔍 DEBUG: handleSubmit called - Form submission started')
    console.log('🔍 DEBUG: isSubmitting state:', isSubmitting)
    
    if (isSubmitting) {
      console.log('🔍 DEBUG: Already submitting, preventing duplicate submission')
      return
    }
    
    if (!validateForm()) {
      console.log('🔍 DEBUG: Form validation failed, not submitting')
      return
    }

    console.log('🔍 DEBUG: Starting API call to create meal plan')
    setIsSubmitting(true)
    
    try {
      // Transform data to match backend format
      const days = Object.keys(formData.days).map(dayKey => ({
        day: dayKey,
        meals: Object.keys(formData.days[dayKey]).flatMap(mealType =>
          formData.days[dayKey][mealType].map(meal => ({
            mealType,
            meal: meal._id
          }))
        )
      })).filter(day => day.meals.length > 0)

      const nutritionSummary = calculateNutritionSummary()

      const planData = {
        title: formData.title,
        weekStartDate: formData.weekStartDate,
        days,
        nutritionSummary
      }

      console.log('🔍 DEBUG: Sending API request with data:', planData)
      console.log('🔍 DEBUG: Plan title being sent:', formData.title)
      const response = await mealPlanService.createMealPlan(planData)
      console.log('🔍 DEBUG: API response received:', response)
      
      if (response.success) {
        success('Meal plan created successfully!')
        console.log('🔍 DEBUG: Navigating to meal plan details')
        navigate(`/dashboard/meal-planner/${response.data.plan._id}`)
      }
    } catch (err) {
      console.error('🔍 DEBUG: API call failed:', err)
      error(err.message || 'Failed to create meal plan')
    } finally {
      console.log('🔍 DEBUG: Setting isSubmitting to false')
      setIsSubmitting(false)
    }
  }

  const nutritionSummary = calculateNutritionSummary()
  const totalMeals = Object.keys(formData.days).reduce((total, day) =>
    total + Object.keys(formData.days[day]).reduce((dayTotal, mealType) =>
      dayTotal + formData.days[day][mealType].length, 0
    ), 0
  )
  
  const daysWithMeals = Object.keys(formData.days).filter(day =>
    Object.keys(formData.days[day]).some(mealType =>
      formData.days[day][mealType].length > 0
    )
  ).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/dashboard/meal-planner')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to meal planner</span>
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
          Create Meal Plan
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Plan your weekly meals and track your nutrition goals
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} onKeyDown={(e) => {
        // Prevent form submission on Enter key unless it's the submit button
        if (e.key === 'Enter' && e.target.type !== 'submit') {
          e.preventDefault()
          console.log('🔍 DEBUG: Enter key pressed - prevented form submission')
        }
      }} className="space-y-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter a custom title for your meal plan"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tip: Title will auto-update when you change the week start date
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Week Start Date
              </label>
              <input
                type="date"
                value={formData.weekStartDate}
                onChange={(e) => handleWeekStartDateChange(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Choose the Monday that starts your meal planning week
              </p>
            </div>
          </div>
        </motion.div>

        {/* Nutrition Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nutrition Summary
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalMeals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Meals
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {totalMeals === 0 ? 'Start adding meals' : 
                 totalMeals < 7 ? 'Keep adding meals' : 
                 'Great! Ready to create'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {daysWithMeals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Days Planned
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                out of 7 days
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {nutritionSummary.calories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Calories
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {daysWithMeals > 0 ? Math.round(nutritionSummary.calories / daysWithMeals) : 0}/day avg
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {nutritionSummary.protein}g
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Protein
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {daysWithMeals > 0 ? Math.round(nutritionSummary.protein / daysWithMeals) : 0}g/day avg
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {nutritionSummary.carbs}g
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Carbs
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {daysWithMeals > 0 ? Math.round(nutritionSummary.carbs / daysWithMeals) : 0}g/day avg
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {nutritionSummary.fats}g
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Fats
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {daysWithMeals > 0 ? Math.round(nutritionSummary.fats / daysWithMeals) : 0}g/day avg
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Meal Planning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Weekly Meal Planning
              </h2>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Add meals for each day and meal type. You can add multiple meals per category.
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  How to create your meal plan:
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Build your complete weekly plan:</strong> Add meals to any day and meal type</li>
                  <li>• <strong>Multiple meals per category:</strong> You can add multiple breakfast, lunch, dinner, or snack options</li>
                  <li>• <strong>Plan multiple days:</strong> Add meals to as many days as you want (Monday through Sunday)</li>
                  <li>• <strong>No auto-creation:</strong> Your plan will only be created when you click "Create Plan" below</li>
                  <li>• <strong>Take your time:</strong> Build your complete weekly plan before submitting</li>
                </ul>
              </div>
            </div>
          </div>

          {Object.keys(formData.days).map((day, dayIndex) => {
            const dayMealCount = Object.keys(formData.days[day]).reduce((count, mealType) => 
              count + formData.days[day][mealType].length, 0
            )
            
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + dayIndex * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dayNames[day]}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dayMealCount > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {dayMealCount} meal{dayMealCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mealTypes.map(mealType => (
                    <MealSelector
                      key={`${day}-${mealType}`}
                      selectedMeals={formData.days[day][mealType]}
                      onMealSelect={(meal) => handleMealSelect(day, mealType, meal)}
                      onMealRemove={(index) => handleMealRemove(day, mealType, index)}
                      mealType={mealType}
                    />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-4"
        >
          {/* Plan Summary */}
          {totalMeals > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                  Your meal plan is ready!
                </h3>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                You've planned {totalMeals} meals across {daysWithMeals} days. 
                {daysWithMeals < 7 && ' You can still add more meals to other days if needed.'}
                {' '}Click "Create Plan" below to save your weekly meal plan.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/meal-planner')}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || totalMeals === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>
                {isSubmitting ? 'Creating...' : 
                 totalMeals === 0 ? 'Add meals to create plan' : 
                 'Create Plan'}
              </span>
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  )
}

export default CreateMealPlan