import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, Calendar, BarChart3 } from 'lucide-react'
import { mealPlanService } from '../../services/mealPlanService'
import { useToast } from '../../contexts/ToastContext'
import WeekCalendar from '../../components/mealPlan/WeekCalendar'
import LoadingSpinner from '../../components/LoadingSpinner'

const MealPlanDetails = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadMealPlan()
  }, [planId])

  const loadMealPlan = async () => {
    try {
      setLoading(true)
      const response = await mealPlanService.getMealPlanById(planId)
      
      if (response.success) {
        setPlan(response.data.plan)
      }
    } catch (err) {
      error(err.message || 'Failed to load meal plan')
      navigate('/dashboard/meal-planner')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = (day, mealType, status, replacedWith = null) => {
    setPlan(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.day === day) {
          return {
            ...d,
            meals: d.meals.map(m => {
              if (m.mealType === mealType) {
                return {
                  ...m,
                  adherence: {
                    ...m.adherence,
                    status,
                    replacedWith: replacedWith || m.adherence.replacedWith,
                    updatedAt: new Date().toISOString()
                  }
                }
              }
              return m
            })
          }
        }
        return d
      })
    }))
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await mealPlanService.deleteMealPlan(planId)
      if (response.success) {
        success('Meal plan deleted successfully')
        navigate('/dashboard/meal-planner')
      }
    } catch (err) {
      error(err.message || 'Failed to delete meal plan')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  const getAdherenceStats = () => {
    if (!plan) return { eaten: 0, skipped: 0, replaced: 0, planned: 0, total: 0 }
    
    let eaten = 0, skipped = 0, replaced = 0, planned = 0
    
    plan.days.forEach(day => {
      day.meals.forEach(meal => {
        switch (meal.adherence.status) {
          case 'eaten': eaten++; break
          case 'skipped': skipped++; break
          case 'replaced': replaced++; break
          default: planned++; break
        }
      })
    })

    const total = eaten + skipped + replaced + planned
    return { eaten, skipped, replaced, planned, total }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading meal plan..." />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Meal plan not found
        </h1>
        <Link
          to="/dashboard/meal-planner"
          className="text-primary-600 hover:text-primary-700"
        >
          Back to meal planner
        </Link>
      </div>
    )
  }

  const adherenceStats = getAdherenceStats()
  const completionRate = adherenceStats.total > 0 
    ? Math.round(((adherenceStats.eaten + adherenceStats.replaced) / adherenceStats.total) * 100)
    : 0

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {plan.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(plan.weekStartDate)} - {formatDate(getWeekEndDate(plan.weekStartDate))}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>{completionRate}% Complete</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/dashboard/meal-planner/${planId}/edit`}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {adherenceStats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Meals
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {adherenceStats.eaten}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Eaten
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {adherenceStats.replaced}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Replaced
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {adherenceStats.skipped}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Skipped
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {adherenceStats.planned}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Planned
          </div>
        </div>
      </motion.div>

      {/* Nutrition Summary */}
      {plan.nutritionSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Nutrition Summary
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.nutritionSummary.calories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Calories
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {Math.round(plan.nutritionSummary.calories / 7)}/day avg
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.nutritionSummary.protein}g
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Protein
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {Math.round(plan.nutritionSummary.protein / 7)}g/day avg
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.nutritionSummary.carbs}g
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Carbs
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {Math.round(plan.nutritionSummary.carbs / 7)}g/day avg
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.nutritionSummary.fats}g
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Fats
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {Math.round(plan.nutritionSummary.fats / 7)}g/day avg
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Week Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <WeekCalendar plan={plan} onStatusUpdate={handleStatusUpdate} />
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Meal Plan
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{plan.title}"? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MealPlanDetails