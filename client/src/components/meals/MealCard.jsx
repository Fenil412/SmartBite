import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Clock, Users, DollarSign } from 'lucide-react'
import { mealService } from '../../services/mealService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const MealCard = ({ meal, onLikeUpdate }) => {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [isLiking, setIsLiking] = useState(false)
  const [likedBy, setLikedBy] = useState(meal.likedBy || [])

  const isLiked = user && likedBy.includes(user._id)
  const isOwner = user && meal.createdBy._id === user._id

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      error('Please login to like meals')
      return
    }

    setIsLiking(true)
    try {
      const response = await mealService.toggleLikeMeal(meal._id)
      if (response.success) {
        const newLikedBy = response.data.meal.likedBy
        setLikedBy(newLikedBy)
        onLikeUpdate && onLikeUpdate(meal._id, newLikedBy)
        success(isLiked ? 'Meal unliked' : 'Meal liked')
      }
    } catch (err) {
      error(err.message || 'Failed to update like')
    } finally {
      setIsLiking(false)
    }
  }

  const getCostLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'breakfast': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-200'
      case 'lunch': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-200'
      case 'dinner': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-200'
      case 'snack': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  return (
    <Link to={`/dashboard/meals/${meal._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          {meal.image?.url ? (
            <img
              src={meal.image.url}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
          )}
          
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-white'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Owner Badge */}
          {isOwner && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
              Your Recipe
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Description */}
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
            {meal.name}
          </h3>
          
          {meal.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {meal.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {meal.mealType && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(meal.mealType)}`}>
                {meal.mealType}
              </span>
            )}
            
            {meal.cuisine && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                {meal.cuisine}
              </span>
            )}

            {meal.isVegetarian && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-200 rounded-full text-xs font-medium">
                Vegetarian
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{meal.cookTime || meal.prepTimeMinutes || 0}m</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span className={`font-medium ${getCostLevelColor(meal.costLevel).split(' ')[0]}`}>
                  {meal.costLevel}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{likedBy.length}</span>
            </div>
          </div>

          {/* Nutrition Preview */}
          {meal.nutrition && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{meal.nutrition.calories} cal</span>
                <span>{meal.nutrition.protein}g protein</span>
                <span>{meal.nutrition.carbs}g carbs</span>
                <span>{meal.nutrition.fats}g fat</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default MealCard