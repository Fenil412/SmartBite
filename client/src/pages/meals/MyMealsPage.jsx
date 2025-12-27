import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Edit } from 'lucide-react'
import { mealService } from '../../services/mealService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import MealCard from '../../components/meals/MealCard'
import Pagination from '../../components/meals/Pagination'
import LoadingSpinner from '../../components/LoadingSpinner'

const MyMealsPage = () => {
  const { user } = useAuth()
  const { error } = useToast()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user) {
      loadMyMeals()
    }
  }, [user, currentPage])

  const loadMyMeals = async () => {
    try {
      setLoading(true)
      // Get all meals and filter by current user on frontend
      // Since backend doesn't have a specific "my meals" endpoint
      const response = await mealService.getMeals({
        page: currentPage,
        limit: 12
      })
      
      if (response.success) {
        // Filter meals created by current user
        const myMeals = response.data.meals.docs.filter(meal => 
          meal.createdBy._id === user._id
        )
        
        setMeals(myMeals)
        setPagination({
          currentPage: response.data.meals.page,
          totalPages: response.data.meals.totalPages,
          totalDocs: myMeals.length,
          limit: response.data.meals.limit
        })
      }
    } catch (err) {
      error(err.message || 'Failed to load your meals')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleLikeUpdate = (mealId, newLikedBy) => {
    setMeals(prev => prev.map(meal => 
      meal._id === mealId 
        ? { ...meal, likedBy: newLikedBy }
        : meal
    ))
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Please login to view your meals
        </h1>
        <Link
          to="/auth/login"
          className="text-primary-600 hover:text-primary-700"
        >
          Go to login
        </Link>
      </div>
    )
  }

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
              My Meals
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your created recipes
            </p>
          </div>
          
          <Link
            to="/dashboard/meals/create"
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Meal</span>
          </Link>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" message="Loading your meals..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && meals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No meals created yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start sharing your delicious recipes with the community.
          </p>
          <Link
            to="/dashboard/meals/create"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Meal</span>
          </Link>
        </motion.div>
      )}

      {/* Meals Grid */}
      {!loading && meals.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
          >
            {meals.map((meal, index) => (
              <motion.div
                key={meal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="relative group"
              >
                <MealCard meal={meal} onLikeUpdate={handleLikeUpdate} />
                
                {/* Owner Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-2">
                    <Link
                      to={`/dashboard/meals/${meal._id}/edit`}
                      className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg shadow-lg transition-colors"
                      title="Edit meal"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalDocs={pagination.totalDocs}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default MyMealsPage