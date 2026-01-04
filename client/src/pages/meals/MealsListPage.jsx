import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { mealService } from '../../services/mealService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import MealCard from '../../components/meals/MealCard'
import MealFilters from '../../components/meals/MealFilters'
import Pagination from '../../components/meals/Pagination'
import LoadingSpinner from '../../components/LoadingSpinner'

const MealsListPage = () => {
  const { user } = useAuth()
  const { error } = useToast()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    cuisine: '',
    mealType: '',
    costLevel: '',
    vegetarian: undefined,
    page: 1,
    limit: 12
  })

  useEffect(() => {
    loadMeals()
  }, [filters])

  const loadMeals = async () => {
    try {
      setLoading(true)
      const response = await mealService.getMeals(filters)
      
      if (response.success) {
        setMeals(response.data.meals.docs || [])
        setPagination({
          currentPage: response.data.meals.page,
          totalPages: response.data.meals.totalPages,
          totalDocs: response.data.meals.totalDocs,
          limit: response.data.meals.limit
        })
      }
    } catch (err) {
      error(err.message || 'Failed to load meals')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      cuisine: '',
      mealType: '',
      costLevel: '',
      vegetarian: undefined,
      page: 1,
      limit: 12
    })
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleLikeUpdate = (mealId, newLikedBy) => {
    setMeals(prev => prev.map(meal => 
      meal._id === mealId 
        ? { ...meal, likedBy: newLikedBy }
        : meal
    ))
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
              Discover Meals
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore delicious recipes from our community
            </p>
          </div>
          
          {user && (
            <Link
              to="/dashboard/meals/create"
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Meal</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <MealFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" message="Loading meals..." />
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
            No meals found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or create a new meal to get started.
          </p>
          {user && (
            <Link
              to="/dashboard/meals/create"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Meal</span>
            </Link>
          )}
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
              >
                <MealCard meal={meal} onLikeUpdate={handleLikeUpdate} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  )
}

export default MealsListPage