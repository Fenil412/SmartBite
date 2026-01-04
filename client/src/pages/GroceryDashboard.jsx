import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Calendar, 
  Clock, 
  ChefHat, 
  DollarSign, 
  Package,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { mealPlanService } from '../services/mealPlanService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const GroceryDashboard = () => {
  const { error } = useToast()
  const [loading, setLoading] = useState(true)
  const [mealPlans, setMealPlans] = useState([])

  useEffect(() => {
    loadMealPlans()
  }, [])

  const loadMealPlans = async () => {
    try {
      setLoading(true)
      const response = await mealPlanService.getMyMealPlans()
      
      if (response.success) {
        // Sort by most recent and limit to active plans
        const sortedPlans = response.data.plans
          .filter(plan => plan.isActive !== false)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10) // Show last 10 meal plans
        
        setMealPlans(sortedPlans)
      }
    } catch (err) {
      error(err.message || 'Failed to load meal plans')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getWeekEndDate = (startDate) => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    return endDate
  }

  const getMealPlanStatus = (plan) => {
    const now = new Date()
    const startDate = new Date(plan.weekStartDate)
    const endDate = getWeekEndDate(startDate)
    
    if (now < startDate) return { status: 'upcoming', color: 'blue' }
    if (now > endDate) return { status: 'completed', color: 'gray' }
    return { status: 'active', color: 'green' }
  }

  const getTotalMeals = (plan) => {
    if (!plan.days) return 0
    return plan.days.reduce((total, day) => total + day.meals.length, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading meal plans..." />
      </div>
    )
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
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Smart Grocery
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered grocery lists from your meal plans
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mealPlans.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Meal Plans</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mealPlans.filter(plan => getMealPlanStatus(plan).status === 'active').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Plans</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mealPlans.reduce((total, plan) => total + getTotalMeals(plan), 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Meals</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Meal Plans List */}
      {mealPlans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-12"
        >
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No meal plans found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create a meal plan first to generate smart grocery lists.
          </p>
          <Link
            to="/dashboard/meal-planner/create"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Meal Plan</span>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select a Meal Plan for Grocery List
            </h2>
            <Link
              to="/dashboard/meal-planner/create"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>New Meal Plan</span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan, index) => {
              const planStatus = getMealPlanStatus(plan)
              const totalMeals = getTotalMeals(plan)
              
              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {plan.title || `Week of ${formatDate(plan.weekStartDate)}`}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(plan.weekStartDate)} - {formatDate(getWeekEndDate(plan.weekStartDate))}
                      </p>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      planStatus.color === 'green' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200'
                        : planStatus.color === 'blue'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-200'
                    }`}>
                      {planStatus.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <ChefHat className="h-4 w-4" />
                        <span>Meals</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {totalMeals}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Days</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.days?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Created</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(plan.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/dashboard/grocery/${plan._id}`}
                      className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors group-hover:bg-primary-700"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Grocery List</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    
                    <Link
                      to={`/dashboard/meal-planner/${plan._id}`}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Meal Plan"
                    >
                      <Calendar className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800"
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              How Smart Grocery Works
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• <strong>AI-Generated Lists:</strong> Automatically creates grocery lists from your meal plan ingredients</li>
              <li>• <strong>Smart Categories:</strong> Groups items by store sections (Produce, Dairy, Meat, etc.)</li>
              <li>• <strong>Missing Items:</strong> Compare against your pantry to find what you actually need</li>
              <li>• <strong>Cost Estimates:</strong> Get budget breakdowns and find cheaper alternatives</li>
              <li>• <strong>Store Suggestions:</strong> Find the best stores based on price and location</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default GroceryDashboard