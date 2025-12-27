import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, Clock, DollarSign, ChefHat, Utensils, 
  Edit, Trash2, ArrowLeft, AlertTriangle 
} from 'lucide-react'
import { mealService } from '../../services/mealService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'

const MealDetailsPage = () => {
  const { mealId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadMeal()
  }, [mealId])

  const loadMeal = async () => {
    try {
      setLoading(true)
      const response = await mealService.getMealById(mealId)
      
      if (response.success) {
        setMeal(response.data.meal)
      }
    } catch (err) {
      error(err.message || 'Failed to load meal')
      navigate('/dashboard/meals')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      error('Please login to like meals')
      return
    }

    setIsLiking(true)
    try {
      const response = await mealService.toggleLikeMeal(mealId)
      if (response.success) {
        setMeal(prev => ({
          ...prev,
          likedBy: response.data.meal.likedBy
        }))
        const isLiked = response.data.meal.likedBy.includes(user._id)
        success(isLiked ? 'Meal liked' : 'Meal unliked')
      }
    } catch (err) {
      error(err.message || 'Failed to update like')
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await mealService.deleteMeal(mealId)
      if (response.success) {
        success('Meal deleted successfully')
        navigate('/dashboard/meals')
      }
    } catch (err) {
      error(err.message || 'Failed to delete meal')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading meal details..." />
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Meal not found
        </h1>
        <Link
          to="/dashboard/meals"
          className="text-primary-600 hover:text-primary-700"
        >
          Back to meals
        </Link>
      </div>
    )
  }

  const isOwner = user && meal.createdBy._id === user._id
  const isLiked = user && meal.likedBy.includes(user._id)

  const getDietBadges = () => {
    const badges = []
    if (meal.isVegetarian) badges.push({ label: 'Vegetarian', color: 'green' })
    if (meal.isVegan) badges.push({ label: 'Vegan', color: 'green' })
    if (meal.isGlutenFree) badges.push({ label: 'Gluten Free', color: 'blue' })
    if (meal.isDairyFree) badges.push({ label: 'Dairy Free', color: 'purple' })
    if (meal.isNutFree) badges.push({ label: 'Nut Free', color: 'orange' })
    return badges
  }

  const getBadgeColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
    }
    return colors[color] || colors.green
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
          onClick={() => navigate('/dashboard/meals')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to meals</span>
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {meal.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  By {meal.createdBy.name}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    isLiked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{meal.likedBy.length}</span>
                </button>

                {/* Owner Actions */}
                {isOwner && (
                  <>
                    <Link
                      to={`/dashboard/meals/${mealId}/edit`}
                      className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
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
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {meal.description && (
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {meal.description}
              </p>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden">
              {meal.image?.url ? (
                <img
                  src={meal.image.url}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">🍽️</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Ingredients */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Utensils className="h-5 w-5" />
                <span>Ingredients</span>
              </h2>
              <ul className="space-y-2">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Allergens */}
          {meal.allergens && meal.allergens.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Allergens</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {meal.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Info
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Cook Time</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {meal.cookTime || meal.prepTimeMinutes || 0} min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Cost Level</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {meal.costLevel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Skill Level</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {meal.skillLevel}
                </span>
              </div>

              {meal.cuisine && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Cuisine</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {meal.cuisine}
                  </span>
                </div>
              )}

              {meal.mealType && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Meal Type</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {meal.mealType}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Nutrition */}
          {meal.nutrition && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nutrition Facts
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Calories</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {meal.nutrition.calories}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Protein</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {meal.nutrition.protein}g
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Carbs</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {meal.nutrition.carbs}g
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Fats</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {meal.nutrition.fats}g
                  </span>
                </div>

                {meal.nutrition.fiber > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Fiber</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {meal.nutrition.fiber}g
                    </span>
                  </div>
                )}

                {meal.nutrition.sugar > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Sugar</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {meal.nutrition.sugar}g
                    </span>
                  </div>
                )}

                {meal.nutrition.sodium > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Sodium</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {meal.nutrition.sodium}mg
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Diet Badges */}
          {getDietBadges().length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Diet Compatibility
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {getDietBadges().map((badge, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(badge.color)}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Appliances */}
          {meal.appliances && meal.appliances.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Required Appliances
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {meal.appliances.map((appliance, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                  >
                    {appliance}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
                Delete Meal
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{meal.name}"? This action cannot be undone.
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
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MealDetailsPage