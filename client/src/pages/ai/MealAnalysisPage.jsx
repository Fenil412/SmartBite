import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { mealService } from '../../services/mealService'
import { flaskAiService } from '../../services/flaskAi.service'
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  Sparkles,
  Clock,
  Users,
  ChefHat
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MealAnalysisPage = () => {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [selectedMeal, setSelectedMeal] = useState(null) // Changed to single meal
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mealsLoading, setMealsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Load available meals
  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    try {
      setMealsLoading(true)
      const response = await mealService.getAllMeals() // Use the new getAllMeals endpoint
      if (response.success && Array.isArray(response.data)) {
        setMeals(response.data)
      } else {
        setMeals([])
      }
    } catch (error) {
      console.error('Failed to load meals:', error)
      setError('Failed to load meals')
      setMeals([])
    } finally {
      setMealsLoading(false)
    }
  }

  const handleMealSelect = (meal) => {
    setSelectedMeal(meal)
    setAnalysis(null) // Clear previous analysis
  }

  const analyzeMeal = async () => {
    if (!selectedMeal) {
      setError('Please select a meal to analyze')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Format meal data according to the required structure
      const mealData = {
        id: selectedMeal.id,
        name: selectedMeal.name,
        mealType: selectedMeal.mealType,
        nutrition: selectedMeal.nutrition,
        ingredients: selectedMeal.ingredients,
        allergens: selectedMeal.allergens
      }
      
      const response = await flaskAiService.analyzeMeals(user._id, [mealData])
      
      if (response.success) {
        setAnalysis(response.data)
      } else {
        throw new Error(response.message || 'Analysis failed')
      }
    } catch (error) {
      console.error('Meal analysis failed:', error)
      setError(error.message || 'Failed to analyze meal')
    } finally {
      setLoading(false)
    }
  }

  // Filter meals based on search and type
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || meal.mealType === filterType
    return matchesSearch && matchesType
  })

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getVerdictBadge = (verdict) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Poor': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    return colors[verdict] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    }
    return icons[type] || '🍽️'
  }

  if (mealsLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Meal Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select a meal to get AI-powered nutritional analysis and health insights
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              AI-generated analysis • Not medical advice • Consult healthcare providers for personalized nutrition guidance
            </span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search meals by name or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snacks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meal Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select a Meal to Analyze
          </h2>
          {selectedMeal && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <CheckCircle className="h-4 w-4" />
              <span>Selected: {selectedMeal.name}</span>
            </div>
          )}
        </div>
        
        {filteredMeals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm || filterType !== 'all' ? 'No meals match your search criteria' : 'No meals available'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Create some meals first to analyze them'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <AnimatePresence>
              {filteredMeals.map((meal) => {
                const isSelected = selectedMeal?.id === meal.id
                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMealSelect(meal)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMealTypeIcon(meal.mealType)}</span>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {meal.name}
                        </h3>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span className="capitalize">{meal.cuisine}</span>
                        <span className="capitalize">{meal.mealType}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">🔥</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {meal.nutrition?.calories || 'N/A'} cal
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {meal.cookTime || 'N/A'} min
                          </span>
                        </div>
                      </div>
                      
                      {meal.likeCount > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{meal.likeCount} likes</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={analyzeMeal}
          disabled={loading || !selectedMeal}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
        >
          <BarChart3 className="h-5 w-5" />
          <span>{loading ? 'Analyzing...' : 'Analyze Selected Meal'}</span>
          {loading && (
            <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </motion.button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Analysis Results for "{selectedMeal?.name}"
            </h2>
          </div>

          {/* Single Meal Analysis Result */}
          {analysis.results?.[0] && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMealTypeIcon(selectedMeal?.mealType)}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {analysis.results[0].mealName || selectedMeal?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">
                      {selectedMeal?.cuisine} • {selectedMeal?.mealType}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Health Score</div>
                    <div className={`text-3xl font-bold ${getHealthScoreColor(analysis.results[0].healthScore || 0)}`}>
                      {analysis.results[0].healthScore || 0}/100
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getVerdictBadge(analysis.results[0].verdict)}`}>
                    {analysis.results[0].verdict || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Warnings */}
              {analysis.results[0].warnings && analysis.results[0].warnings.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    Health Warnings
                  </h4>
                  <ul className="space-y-2">
                    {analysis.results[0].warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                        <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrition Breakdown */}
              {analysis.results[0].nutrition && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                    Detailed Nutrition Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {Object.entries(analysis.results[0].nutrition).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
                          {key === 'fats' ? 'Fat' : key}
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {value || 'N/A'}{key === 'calories' ? '' : 'g'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients Analysis */}
              {selectedMeal?.ingredients && selectedMeal.ingredients.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Ingredients ({selectedMeal.ingredients.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeal.ingredients.map((ingredient, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {selectedMeal?.allergens && selectedMeal.allergens.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    Allergens
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeal.allergens.map((allergen, i) => (
                      <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-full text-sm">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overall Summary */}
          {analysis.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                AI Analysis Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Disclaimer:</strong> This analysis is AI-generated and for informational purposes only. 
                It is not intended as medical advice, diagnosis, or treatment. Always consult with qualified 
                healthcare professionals for personalized nutrition guidance.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MealAnalysisPage