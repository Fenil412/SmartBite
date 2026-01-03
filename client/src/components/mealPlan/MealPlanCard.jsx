import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Eye, Edit, Trash2, BarChart3, Download } from 'lucide-react'
import { mealPlanService } from '../../services/mealPlanService'
import { pdfService } from '../../services/pdfService'
import { useToast } from '../../contexts/ToastContext'

const MealPlanCard = ({ plan, onDelete }) => {
  const { success, error: showError } = useToast()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  const handleDownloadPDF = async () => {
    try {
      await pdfService.generateMealPlanPDF(plan)
      success('Meal plan PDF downloaded successfully')
    } catch (error) {
      showError(`Failed to download PDF: ${error.message}`)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await mealPlanService.deleteMealPlan(plan._id)
      if (response.success) {
        success('Meal plan deleted successfully')
        onDelete(plan._id)
        setShowDeleteModal(false)
      }
    } catch (err) {
      showError(err.message || 'Failed to delete meal plan')
    } finally {
      setIsDeleting(false)
    }
  }

  const getTotalMeals = () => {
    return plan.days.reduce((total, day) => total + day.meals.length, 0)
  }

  const getAdherenceStats = () => {
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

    return { eaten, skipped, replaced, planned }
  }

  const adherenceStats = getAdherenceStats()
  const totalMeals = getTotalMeals()

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {plan.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(plan.weekStartDate)} - {formatDate(getWeekEndDate(plan.weekStartDate))}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to={`/dashboard/meal-planner/${plan._id}`}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title="View plan"
              >
                <Eye className="h-4 w-4" />
              </Link>
              
              <button
                onClick={handleDownloadPDF}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </button>
              
              <Link
                to={`/dashboard/meal-planner/${plan._id}/edit`}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Edit plan"
              >
                <Edit className="h-4 w-4" />
              </Link>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete plan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalMeals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Meals
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.days.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Days Planned
              </div>
            </div>
          </div>

          {/* Adherence Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {Math.round(((adherenceStats.eaten + adherenceStats.replaced) / totalMeals) * 100)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((adherenceStats.eaten + adherenceStats.replaced) / totalMeals) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Adherence Stats */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1" />
              <div className="font-medium text-gray-900 dark:text-white">{adherenceStats.eaten}</div>
              <div className="text-gray-600 dark:text-gray-400">Eaten</div>
            </div>
            
            <div className="text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1" />
              <div className="font-medium text-gray-900 dark:text-white">{adherenceStats.replaced}</div>
              <div className="text-gray-600 dark:text-gray-400">Replaced</div>
            </div>
            
            <div className="text-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1" />
              <div className="font-medium text-gray-900 dark:text-white">{adherenceStats.skipped}</div>
              <div className="text-gray-600 dark:text-gray-400">Skipped</div>
            </div>
            
            <div className="text-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mb-1" />
              <div className="font-medium text-gray-900 dark:text-white">{adherenceStats.planned}</div>
              <div className="text-gray-600 dark:text-gray-400">Planned</div>
            </div>
          </div>

          {/* Nutrition Summary */}
          {plan.nutritionSummary && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Daily Avg Nutrition
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.round(plan.nutritionSummary.calories / 7)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Cal</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.round(plan.nutritionSummary.protein / 7)}g
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Protein</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.round(plan.nutritionSummary.carbs / 7)}g
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Carbs</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.round(plan.nutritionSummary.fats / 7)}g
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Fats</div>
                </div>
              </div>
            </div>
          )}
        </div>
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
    </>
  )
}

export default MealPlanCard