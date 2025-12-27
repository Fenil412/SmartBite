import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Calendar, BarChart3 } from 'lucide-react'
import { mealPlanService } from '../../services/mealPlanService'
import { useToast } from '../../contexts/ToastContext'
import MealPlanCard from '../../components/mealPlan/MealPlanCard'
import LoadingSpinner from '../../components/LoadingSpinner'

const MealPlannerDashboard = () => {
  const { error } = useToast()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMealPlans()
  }, [])

  const loadMealPlans = async () => {
    try {
      setLoading(true)
      const response = await mealPlanService.getMyMealPlans()
      
      if (response.success) {
        setPlans(response.data.plans || [])
      }
    } catch (err) {
      error(err.message || 'Failed to load meal plans')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanDelete = (planId) => {
    setPlans(prev => prev.filter(plan => plan._id !== planId))
  }

  const getOverallStats = () => {
    if (plans.length === 0) return { totalPlans: 0, totalMeals: 0, completionRate: 0 }

    const totalMeals = plans.reduce((total, plan) => {
      return total + plan.days.reduce((dayTotal, day) => dayTotal + day.meals.length, 0)
    }, 0)

    const completedMeals = plans.reduce((total, plan) => {
      return total + plan.days.reduce((dayTotal, day) => {
        return dayTotal + day.meals.filter(meal => 
          meal.adherence.status === 'eaten' || meal.adherence.status === 'replaced'
        ).length
      }, 0)
    }, 0)

    const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0

    return {
      totalPlans: plans.length,
      totalMeals,
      completionRate
    }
  }

  const stats = getOverallStats()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Meal Planner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your weekly meals and track your nutrition goals
            </p>
          </div>
          
          <Link
            to="/dashboard/meal-planner/create"
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPlans}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Plans
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalMeals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Meals
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stats.completionRate}%
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Completion
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Rate
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" message="Loading meal plans..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No meal plans yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start planning your weekly meals to maintain a healthy diet and reach your nutrition goals.
          </p>
          <Link
            to="/dashboard/meal-planner/create"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Plan</span>
          </Link>
        </motion.div>
      )}

      {/* Meal Plans Grid */}
      {!loading && plans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Meal Plans
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {plans.length} plan{plans.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <MealPlanCard plan={plan} onDelete={handlePlanDelete} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MealPlannerDashboard