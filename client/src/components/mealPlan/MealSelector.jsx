import { useState, useEffect } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { mealService } from '../../services/mealService'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../LoadingSpinner'

const MealSelector = ({ selectedMeals, onMealSelect, onMealRemove, mealType }) => {
  const { error } = useToast()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [filteredMeals, setFilteredMeals] = useState([])

  useEffect(() => {
    if (showModal) {
      loadMeals()
    }
  }, [showModal])

  useEffect(() => {
    if (searchTerm) {
      const filtered = meals.filter(meal =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMeals(filtered)
    } else {
      setFilteredMeals(meals)
    }
  }, [searchTerm, meals])

  const loadMeals = async () => {
    try {
      setLoading(true)
      const response = await mealService.getMeals({ limit: 50 })
      
      if (response.success) {
        setMeals(response.data.meals.docs || [])
      }
    } catch (err) {
      error(err.message || 'Failed to load meals')
    } finally {
      setLoading(false)
    }
  }

  const handleMealSelect = (meal) => {
    // Only update local state - no API calls
    onMealSelect(meal)
    setShowModal(false)
    setSearchTerm('')
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
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {mealType}
          </h4>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              selectedMeals.length > 0 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {selectedMeals.length} meal{selectedMeals.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Selected Meals */}
        <div className="space-y-2">
          {selectedMeals.map((meal, index) => (
            <div
              key={`${meal._id}-${index}`}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                {meal.image?.url ? (
                  <img
                    src={meal.image.url}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    🍽️
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {meal.name}
                </h5>
                <div className="flex items-center space-x-2 mt-1">
                  {meal.mealType && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMealTypeColor(meal.mealType)}`}>
                      {meal.mealType}
                    </span>
                  )}
                  {meal.nutrition && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {meal.nutrition.calories} cal
                    </span>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => onMealRemove(index)}
                className="p-1 text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {selectedMeals.length === 0 && (
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No meals selected for {mealType}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Click "Add" to select meals • You can add multiple meals per category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Meal Selection Modal - Moved outside form to prevent interference */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false)
            setSearchTerm('')
          }
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Meal for {mealType}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSearchTerm('')
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search meals..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" message="Loading meals..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMeals.map(meal => (
                    <div
                      key={meal._id}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleMealSelect(meal)
                      }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden mb-3">
                        {meal.image?.url ? (
                          <img
                            src={meal.image.url}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                            🍽️
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {meal.name}
                      </h4>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {meal.mealType && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMealTypeColor(meal.mealType)}`}>
                              {meal.mealType}
                            </span>
                          )}
                        </div>
                        
                        {meal.nutrition && (
                          <span className="text-gray-600 dark:text-gray-400">
                            {meal.nutrition.calories} cal
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!loading && filteredMeals.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No meals found matching your search.' : 'No meals available.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MealSelector