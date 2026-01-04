import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { mealService } from '../../services/mealService'
import { flaskAiService } from '../../services/flaskAi.service'
import { 
  AlertTriangle, 
  ShieldCheck, 
  Heart,
  Eye,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Users,
  ChefHat,
  Sparkles,
  BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const HealthRiskPage = () => {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [selectedMeal, setSelectedMeal] = useState(null) // Changed to single meal
  const [riskReport, setRiskReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mealsLoading, setMealsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    try {
      setMealsLoading(true)
      const response = await mealService.getAllMeals() // Use the corrected getAllMeals endpoint
      if (response.success && response.data?.meals?.docs) {
        // Handle paginated response structure
        setMeals(response.data.meals.docs)
      } else if (response.success && Array.isArray(response.data)) {
        setMeals(response.data)
      } else {
        setMeals([])
      }
    } catch (error) {
      console.error('Failed to load meals:', error)
      setError('Failed to load meals')
    } finally {
      setMealsLoading(false)
    }
  }

  const handleMealSelect = (meal) => {
    setSelectedMeal(meal)
    setRiskReport(null) // Clear previous report
  }

  const generateRiskReport = async () => {
    if (!selectedMeal) {
      setError('Please select a meal to analyze')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Format meal data according to the required structure
      const mealData = {
        id: selectedMeal._id, // Use _id from the meals endpoint
        name: selectedMeal.name,
        mealType: selectedMeal.mealType,
        nutrition: selectedMeal.nutrition,
        ingredients: selectedMeal.ingredients,
        allergens: selectedMeal.allergens
      }
      
      const response = await flaskAiService.getHealthRiskReport(user._id, [mealData])
      
      if (response.success) {
        setRiskReport(response.data)
      } else {
        throw new Error(response.message || 'Risk analysis failed')
      }
    } catch (error) {
      setError(error.message || 'Failed to generate risk report')
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

  const getSeverityColor = (severity) => {
    const colors = {
      'High': 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
      'Medium': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Low': 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    }
    return colors[severity] || 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
  }

  const getSeverityIcon = (severity) => {
    if (severity === 'High') return <AlertTriangle className="h-5 w-5" />
    if (severity === 'Medium') return <Eye className="h-5 w-5" />
    return <ShieldCheck className="h-5 w-5" />
  }

  const getRiskTypeIcon = (type) => {
    const icons = {
      'cardiovascular': '❤️',
      'diabetes': '🩸',
      'obesity': '⚖️',
      'digestive': '🫃',
      'nutritional': '🥗',
      'metabolic': '⚡'
    }
    return icons[type.toLowerCase()] || '⚠️'
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
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
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
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Health Risk Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get AI-powered health risk analysis for your selected meal
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-800 dark:text-red-200 font-medium">
              AI-generated analysis • Not medical advice • Consult healthcare providers for personalized health guidance
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
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
            Select a Meal for Risk Analysis
          </h2>
          {selectedMeal && (
            <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
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
                const isSelected = selectedMeal?._id === meal._id
                return (
                  <motion.div
                    key={meal._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMealSelect(meal)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg'
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
                        <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
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
          onClick={generateRiskReport}
          disabled={loading || !selectedMeal}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
        >
          <Heart className="h-5 w-5" />
          <span>{loading ? 'Analyzing Risks...' : 'Generate Risk Report'}</span>
          {loading && (
            <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </motion.button>
      </div>

      {/* Risk Report Results */}
      {riskReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Health Risk Analysis for "{selectedMeal?.name}"
            </h2>
          </div>

          {/* Nutritional Summary */}
          {riskReport.summary && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                Nutritional Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {riskReport.summary.totalCalories || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Calories</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {riskReport.summary.totalProtein || 0}g
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Total Protein</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 text-center border border-yellow-200 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {riskReport.summary.totalFiber || 0}g
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Total Fiber</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {riskReport.summary.totalSugar || 0}g
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Total Sugar</div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 text-center border border-red-200 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {riskReport.summary.totalSodium || 0}mg
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Total Sodium</div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {riskReport.detectedRisks?.filter(r => r.severity === 'high').length || 0}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">High Risk Issues</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {riskReport.detectedRisks?.filter(r => r.severity === 'medium').length || 0}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium Risk Issues</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {riskReport.detectedRisks?.filter(r => r.severity === 'low').length || 0}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Low Risk Issues</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Cards */}
          {riskReport.detectedRisks && riskReport.detectedRisks.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Identified Health Risks
              </h3>
              
              {riskReport.detectedRisks.map((risk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getRiskTypeIcon(risk.type)}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {risk.type} Risk
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {risk.message}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${getSeverityColor(risk.severity)}`}>
                      {getSeverityIcon(risk.severity)}
                      <span className="ml-2">{risk.severity} Risk</span>
                    </div>
                  </div>

                  {/* Affected Meals */}
                  {risk.meal && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Affected Meal:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                          {risk.meal}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Recommendations - Only show for first risk to avoid duplication */}
                  {riskReport.recommendations && riskReport.recommendations.length > 0 && index === 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                        General Recommendations:
                      </div>
                      <ul className="space-y-2">
                        {riskReport.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-green-500 mr-2 mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 text-center border border-green-200 dark:border-green-800">
              <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Great News! No Significant Risks Detected
              </h3>
              <p className="text-green-700 dark:text-green-300">
                The selected meal appears to have a low risk profile based on our AI analysis.
              </p>
            </div>
          )}

          {/* Insights List */}
          {riskReport.insights && riskReport.insights.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                Health Insights
              </h3>
              <ul className="space-y-3">
                {riskReport.insights.map((insight, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">💡</span>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations Section - Always show when available */}
          {riskReport.recommendations && riskReport.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                AI Recommendations
              </h3>
              <ul className="space-y-3">
                {riskReport.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-4 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
                  Important Medical Disclaimer
                </h3>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-3">
                  <p>
                    This health risk analysis is AI-generated and for informational purposes only. 
                    It is not intended as medical advice, diagnosis, or treatment.
                  </p>
                  <p>
                    Always consult with qualified healthcare professionals before making dietary changes, 
                    especially if you have existing health conditions or concerns.
                  </p>
                  <p>
                    Individual health needs vary significantly, and this analysis cannot account for 
                    your complete medical history, current medications, or personal health circumstances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default HealthRiskPage